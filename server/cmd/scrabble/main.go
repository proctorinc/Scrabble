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

		db := db.GetDB()
		defer db.Close()

		router := router.NewRouter()
		router.Run(fmt.Sprintf("localhost:%d", PORT))
}
