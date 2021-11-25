package main

import (
	"log"
	"os"
)

func main() {
	f, err := os.Create("test.html")
	if err != nil {
		log.Panicln("Error when creating test.html: ", err)
	}

	_, err = f.WriteString("<h1>Bardzo udany test</h1>")
	if err != nil {
		log.Panicln("Error when writing to file test.html:", err)
	}
}
