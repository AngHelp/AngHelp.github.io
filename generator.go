package main

import (
	"bufio"
	"errors"
	"fmt"
	"io/fs"
	"log"
	"os"
	"path/filepath"
	"strings"

	_ "embed"
)

//go:embed format.html
var format string

type navElement struct {
	name     string       // file/directory name, relative to its parent; directories contain trailing slash
	link     string       // empty - no link; may be equal to name or dir/index.html for directories
	title    string       // pretty title
	children []navElement // does not contain index.html for directories
}

// root -> sekcja -> strony sekcji -> podstrony
var nav navElement

// Ta funkcja poszukuje w pliku (a dokładniej w ciągu) specjalnych komentarzy i zwraca ich wartości
func getConfigVars(text string) map[string]string {
	out := make(map[string]string)

	scanner := bufio.NewScanner(strings.NewReader(text))
	for scanner.Scan() {
		t := scanner.Text()
		start := strings.Index(t, "<!--")
		end := -1
		if start != -1 {
			start += 4
			end = strings.Index(t[start:], "-->")
		}
		if end != -1 {
			end = end + start
			comment := t[start:end]
			comment = strings.TrimSpace(comment)
			if comment[0] == '@' {
				split := strings.SplitN(comment, ":", 2)
				if len(split) == 1 {
					out[strings.TrimSpace(split[0][1:])] = ""
				} else {
					out[strings.TrimSpace(split[0][1:])] = strings.TrimSpace(split[1])
				}
			}
		}
	}

	return out
}

func navRec(currentPath string, current navElement, src string, relRoot string) string {
	str := "<li"
	fmt.Println(current.link, currentPath+current.link, strings.SplitN(src, "/", 2)[1])
	if currentPath+current.name == strings.SplitN(src, "/", 2)[1] ||
		currentPath+current.name == "./"+strings.SplitN(src, "/", 2)[1] ||
		(strings.Contains(current.link, "index.html") && currentPath+current.link == strings.SplitN(src, "/", 2)[1]) ||
		(strings.Contains(current.link, "index.html") && currentPath+current.link == "./"+strings.SplitN(src, "/", 2)[1]) {
		str += " class=\"current\""
	}
	str += "><a"
	if current.link != "" {
		str += " href=\"" + relRoot + "/" + currentPath + current.link + "\""
	}
	str += ">" + current.title + "</a></li>"
	if len(current.children) != 0 {
		str += "<li><ul>"
		for _, c := range current.children {
			str += navRec(filepath.Base(currentPath)+"/"+current.name, c, src, relRoot)
		}
		str += "</ul></li>"
	}
	return str
}

// Ta funkcja tworzy menu nawigacyjne dla danej strony
func navHTML(src string, relRoot string, section string) string {
	for _, s := range nav.children {
		if s.name == section+"/" {
			return "<ul>" + navRec("", s, src, relRoot) + "</ul>"
		}
	}
	fmt.Println(src, section)
	return ""
}

func navTop(relRoot string) string {
	str := ""
	for _, s := range nav.children {
		str += "<a href=\"" + relRoot + "/" + s.link + "\">" + s.title + "</a>"
	}
	return str
}

// Ta funkcja tworzy gotowy plik html z pliku z folderu src/
func generateFile(src string, dest string) error {
	out, err := os.Create(dest)
	if err != nil {
		return err
	}
	defer out.Close()

	mainBytes, err := os.ReadFile(src)
	if err != nil {
		return err
	}
	main := string(mainBytes)

	conf := getConfigVars(main)

	title := conf["title"]
	if title != "" {
		title = "AngHelp - " + title
	} else {
		title = "AngHelp"
	}

	navClass := "with-nav"
	_, noNav := conf["no-nav"]
	if noNav {
		navClass = "no-nav"
	}

	relRoot, err := filepath.Rel(filepath.Dir(dest), "public")
	if err != nil {
		log.Panicln("Couldn't get relative path to public/: ", err)
	}

	nav := ""
	if filepath.Base(filepath.Dir(src)) != "src" {
		section := strings.Split(src, "/")[1]
		nav = "<nav>" + navHTML(src, relRoot, section) + "</nav>"
	} else {
		fmt.Println(filepath.Split(src))
	}

	replacer := strings.NewReplacer(
		"{style.css}", relRoot+"/style.css",
		"{title}", title,
		"{index}", relRoot+"/index.html",
		"{nav-class}", navClass,
		//"{vocabulary}", relRoot+"/vocabulary/index.html",
		//"{grammar}", relRoot+"/grammar/index.html",
		"{nav-top}", navTop(relRoot),
		"{nav}", nav,
		"{main}", main,
	)

	out.WriteString(replacer.Replace(format))

	return nil
}

// Ta funkcja jest uruchamiana dla każdego folderu i pliku w folderze src/
func handleFile(path string, d fs.DirEntry, err error) error {
	if err != nil {
		log.Panicln("Error (WalkDir):", err)
	}

	if path == "src" {
		err = os.Mkdir("public", d.Type().Perm())
		if errors.Is(err, fs.ErrExist) {
			return nil
		}
		return err
	}

	if d.IsDir() {
		info, _ := d.Info()
		err = os.Mkdir(strings.Replace(path, "src/", "public/", 1), info.Mode())
		if errors.Is(err, fs.ErrExist) {
			return nil
		} else if err != nil {
			return err
		}
		return nil
	} else {
		return generateFile(path, strings.Replace(path, "src/", "public/", 1))
	}
}

func dirContains(d []fs.DirEntry, name string) bool {
	for _, a := range d {
		if a.Name() == name {
			return true
		}
	}
	return false
}

func getTitle(file string) string {
	bytes, err := os.ReadFile(file)
	if err != nil {
		return ""
	}
	main := string(bytes)

	conf := getConfigVars(main)

	return conf["title"]
}

// reurns new children
func directoryNavTree(dir string, parentsChildren []navElement) ([]navElement, error) {
	dirEntries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}

	dirName := filepath.Base(dir)

	if dir == "src" {
		dirName = "."
	}

	link := ""
	title := dirName
	if dirContains(dirEntries, "index.html") {
		//link = "index.html"
		link = dirName + "/index.html"
		title = getTitle(dir + "/index.html")
	}

	thisDir := navElement{
		name:     dirName + "/",
		link:     link,
		title:    title,
		children: make([]navElement, 0),
	}

	for _, c := range dirEntries {
		if c.Type().IsDir() {
			thisDir.children, err = directoryNavTree(dir+"/"+c.Name(), thisDir.children)
			if err != nil {
				return nil, err
			}
		} else if c.Name() != "index.html" {
			title := getTitle(dir + "/" + c.Name())
			if title == "" {
				title = c.Name()
			}
			thisDir.children = append(thisDir.children, navElement{
				name:     c.Name(),
				link:     c.Name(),
				title:    title,
				children: nil,
			})
		}
	}

	return append(parentsChildren, thisDir), nil
}

func main() {
	n, err := directoryNavTree("src", make([]navElement, 0))
	if err != nil {
		log.Panicln("Error when creating navigation tree:", err)
	}
	nav = n[0]
	fmt.Println(nav)

	err = filepath.WalkDir("src", handleFile)
	if err != nil {
		log.Panicln("Error when walking through src/ directory:", err)
	}
}
