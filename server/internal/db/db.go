package db

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"
)

const initializeTables string = `
	DROP TABLE IF EXISTS game_players CASCADE;
	DROP TABLE IF EXISTS games CASCADE;
	DROP TABLE IF EXISTS users CASCADE;
	DROP TABLE IF EXISTS game_logs CASCADE;

	CREATE TABLE IF NOT EXISTS users (
		user_id VARCHAR(255) PRIMARY KEY,
		username VARCHAR(255) NOT NULL UNIQUE,
		auth_token VARCHAR(50) NOT NULL UNIQUE
	);
	
	CREATE TABLE IF NOT EXISTS games (
		game_id VARCHAR(255) PRIMARY KEY,
		status VARCHAR(255) NOT NULL,
		player_turn_id VARCHAR(255),
		is_local BOOLEAN DEFAULT FALSE,
		board JSONB NOT NULL,
		tile_bag JSONB NOT NULL
	);

	CREATE TABLE IF NOT EXISTS game_players (
		id VARCHAR(255) PRIMARY KEY,
		alias VARCHAR(255) NOT NULL,
		player_id VARCHAR(255) REFERENCES users (user_id) NOT NULL,
		game_id VARCHAR(255) REFERENCES games (game_id) NOT NULL,
		score INTEGER NOT NULL DEFAULT 0,
		tiles JSONB NOT NULL
	);

	CREATE TABLE IF NOT EXISTS game_logs (
		id VARCHAR(255) PRIMARY KEY,
		game_id VARCHAR(255) REFERENCES games (game_id) NOT NULL,
		player_id VARCHAR(255) REFERENCES game_players (id) NOT NULL,
		action VARCHAR(255),
		points_scored INTEGER,
		word_played VARCHAR(255),
		num_tiles_traded INTEGER,
		date TIMESTAMPTZ NOT NULL
	);

	CREATE TABLE IF NOT EXISTS dictionary_words (
		word VARCHAR(255) PRIMARY KEY
	);

	CREATE TABLE IF NOT EXISTS word_definitions (
		id VARCHAR(255) PRIMARY KEY,
		word VARCHAR(255) REFERENCES dictionary_words (word) NOT NULL,
		definition VARCHAR(255),
		updated TIMESTAMPTZ NOT NULL
	);

	ALTER TABLE games
	ADD FOREIGN KEY (player_turn_id)
	REFERENCES game_players (id);`

var database *sql.DB

func Connect() {
  db, err := sql.Open("postgres", os.Getenv("POSTGRES_URL"))
  if err != nil {
    log.Fatal(err)
  }

  rows, err := db.Query("select version()")
  if err != nil {
    log.Fatal(err)
  }
  defer rows.Close()

  var version string
  for rows.Next() {
    err := rows.Scan(&version)
    if err != nil {
      log.Fatal(err)
    }
  }

	_, err = db.Exec(initializeTables)

	if err != nil {
		log.Fatal("[Create tables] ", err)
	}

  log.Printf("version=%s\n", version)

	database = db
}

func GetDB() *sql.DB {
	return database
}