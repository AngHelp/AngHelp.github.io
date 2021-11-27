package main

import (
	"bufio"
	"errors"
	"io/fs"
	"log"
	"os"
	"path/filepath"
	"strings"

	_ "embed"
)

//go:embed format.html
var format string

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

// Ta funkcja tworzy gotowy plik html z pliku z folderu src/
func generateFile(src string, dest string) error {
	out, err := os.Create(dest)
	if err != nil {
		return err
	}

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

	replacer := strings.NewReplacer(
		"{style.css}", relRoot+"/style.css",
		"{title}", title,
		"{index}", relRoot+"/index.html",
		"{nav-class}", navClass,
		"{vocabulary}", relRoot+"/vocabulary/index.html",
		"{grammar}", relRoot+"/grammar/index.html",
		"{nav}", "<nav></nav>", // TODO
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

func main() {
	err := filepath.WalkDir("src", handleFile)
	if err != nil {
		log.Panicln("Error when walking through src/ directory:", err)
	}
}
