package main

import (
	"fmt"
	"proctorinc/scrabble/internal/db"
	"proctorinc/scrabble/internal/router"

	"github.com/joho/godotenv"
)

const PORT = 8080

func main() {
		godotenv.Load(".env")
		db.Connect()

		// Only needs to be done once for DB
		// err := models.LoadDictionaryWords()
		// if err != nil {
		// 	log.Printf("Failed to load dictionary words: %v", err)
		// }

		db := db.GetDB()
		defer db.Close()

		router := router.NewRouter()
		router.Run(fmt.Sprintf("localhost:%d", PORT))
}
