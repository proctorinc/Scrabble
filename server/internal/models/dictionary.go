package models

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"proctorinc/scrabble/internal/db"
)

type Dictionary struct {}

func IsWordInDictionary(word string) bool {
	db := db.GetDB()
	err := db.QueryRow(`SELECT * FROM dictionary_words where word = $1`, word).Scan(&word)

	if err != nil {
		log.Println(err)
		return false
	}

	return true
}

func LoadDictionaryWords() error {
	db := db.GetDB()
	file, err := os.Open("./data/static/dictionary.txt")

	if err != nil {
		return fmt.Errorf("Failed to open dictionary file")
	}
	
	defer file.Close()

	fileScanner := bufio.NewScanner(file)
	fileScanner.Split(bufio.ScanLines)
	var fileLines []string

	for fileScanner.Scan() {
			fileLines = append(fileLines, fileScanner.Text())
	}

	log.Println("huh?")

	count := 0

	for _, word := range fileLines {
		_, err := db.Exec(`
		INSERT INTO dictionary_words
		(word)
		VALUES ($1);`,
		word)

		count++
		log.Println(word)

		if err != nil {
			log.Println(err)
			// return err
		}
	}

	log.Printf("COUNT: %d", count)

	return nil
}