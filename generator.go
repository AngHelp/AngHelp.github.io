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
	name     string       // file/directory name, directories contain trailing slash
	link     bool         // true if the directory has an index.html child, true for all files
	title    string       // pretty title
	children []navElement // does not contain index.html
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

func pathToSlice(path string) []string {
	return strings.Split(path, string(os.PathSeparator))
}

func sliceToPath(path []string) string {
	str := ""
	for i, s := range path {
		if i != 0 {
			str += string(os.PathSeparator)
		}
		str += strings.Trim(s, string(os.PathSeparator))
	}
	return str
}

// Ta funkcja porównuje dwie ścieżki i zwraca:
//    2 jeżeli są sobie równe
//    1 jeżeli p2 jest rodzicem p1
//    0 w innym przypadku
// Traktuje ścieżkę do katalogu i ścieżkę do pliku
// index.html w tym samym katalogu jako równe sobie ścieżki.
func compareSlicePaths(p1 []string, p2 []string) int {
	fmt.Println(p1, p2)
	len1 := len(p1)
	len2 := len(p2)
	eq := 0
	for i, s := range p2 {
		if p1[i] == s {
			eq++
		} else {
			break
		}
	}
	if eq == len2 {
		if len1 == len2 || ((len1-1 == len2) && p1[len1-1] == "index.html") {
			return 2
		}
		return 1
	}
	return 0
}

// Ta funkcja służy do rekursywnego tworzenia menu nawigacyjnego na stronie o ścieżce `page`
func navRec(path []string, current *navElement, page []string, relRoot string) string {
	currentPath := append(path, strings.Trim(current.name, string(os.PathSeparator)))
	str := "<li"
	cmp := compareSlicePaths(page, currentPath)
	if cmp == 2 {
		str += " class=\"current\""
	} else if cmp == 1 {
		str += " class=\"parent\""
	}
	str += "><a"
	if current.link {
		str += " href=\"" + relRoot + string(os.PathSeparator) + sliceToPath(currentPath) + "\""
	}
	str += ">" + current.title + "</a></li>"
	if len(current.children) != 0 {
		str += "<li><ul>"
		for i := range current.children {
			str += navRec(currentPath, &current.children[i], page, relRoot)
		}
		str += "</ul></li>"
	}
	return str
}

// Ta funkcja tworzy menu nawigacyjne dla danej strony
func navHTML(page string, relRoot string, section string) string {
	for i, s := range nav.children {
		if s.name == section+"/" {
			return "<ul>" + navRec([]string{}, &nav.children[i], pathToSlice(page)[1:], relRoot) + "</ul>"
		}
	}
	return ""
}

// Ta funkcja tworzy linki do różnych sekcji strony
func navTop(relRoot string) string {
	str := ""
	for _, s := range nav.children {
		if s.link {
			str += "<a href=\"" + relRoot + "/" + s.name + "\">" + s.title + "</a>"
		} else {
			fmt.Println("Warning: Section", s.title, "should have an index.html file.")
		}
	}
	str += "<a href=\"" + relRoot + "/quiz/index.html\">Quiz</a>"
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

	footer := conf["footer"]
	if footer != "" {
		footer = "<br><p>" + footer + "</p>"
	}
	footer = "<p>Autorzy strony:</p><ul><li>Patryk Koszlaga,</li><li>Mateusz Tomaszewski,</li><li>Mateusz Mariasik</li></ul>" + footer

	relRoot, err := filepath.Rel(filepath.Dir(dest), "public")
	if err != nil {
		log.Panicln("Couldn't get relative path to public/: ", err)
	}

	nav := ""
	if filepath.Base(filepath.Dir(src)) != "src" {
		section := strings.Split(src, "/")[1]
		nav = navHTML(src, relRoot, section)
	}

	nt := navTop(relRoot)

	replacer := strings.NewReplacer(
		"{style.css}", relRoot+"/style.css",
		"{title}", title,
		"{index}", relRoot+"/index.html",
		"{nav-class}", navClass,
		//"{vocabulary}", relRoot+"/vocabulary/index.html",
		//"{grammar}", relRoot+"/grammar/index.html",
		"{nav-top}", nt,
		"{nav}", "<nav><div class=\"nav-top\">"+nt+"</div>"+nav+"</nav>",
		"{main}", main,
		"{logo}", relRoot+"/img/logo.png",
		"{logo-b}", relRoot+"/img/logo-b.png",
		"{footer}", footer,
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

func directoryNavTree(dir string, e *navElement) error {
	dirEntries, err := os.ReadDir(dir)
	if err != nil {
		return err
	}

	name := filepath.Base(dir)
	if dir == "src" {
		name = ""
	}

	e.name = name + "/"
	e.title = name // będzie zastąpione jeżeli index.html jest w katalogu
	e.children = make([]navElement, 0)

	for _, c := range dirEntries {
		if c.Type().IsDir() {
			ce := navElement{}
			err = directoryNavTree(dir+"/"+c.Name(), &ce)
			if err != nil {
				return err
			}
			e.children = append(e.children, ce)
		} else {
			title := getTitle(dir + "/" + c.Name())
			if title == "" {
				title = c.Name()
			}
			if c.Name() == "index.html" {
				e.title = title
				e.link = true
			} else {
				e.children = append(e.children, navElement{
					name:     c.Name(),
					link:     true,
					title:    title,
					children: nil,
				})
			}
		}
	}

	return nil
}

func main() {
	nav = navElement{}
	err := directoryNavTree("src", &nav)
	if err != nil {
		log.Panicln("Error when creating navigation tree:", err)
	}
	fmt.Println(nav)
	fmt.Println(nav.children)

	err = filepath.WalkDir("src", handleFile)
	if err != nil {
		log.Panicln("Error when walking through src/ directory:", err)
	}
}
