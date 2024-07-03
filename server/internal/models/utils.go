package models

import (
	"encoding/json"
	"proctorinc/scrabble/internal/db"
)

func InitializeDevData() error {
	db := db.GetDB()

	user := AuthUser{
		Id: "test-user_id",
		Username: "Test User",
		AuthToken: "test-token",
	}

	player := GamePlayer{
		Id: "test-game-player-id",
		User: User{
			Id: user.Id,
			Username: user.Username,
		},
		Score: 100,
		Tiles: []Tile{
			{
				Id: "test-tile-id-1",
				Letter: "B",
				Value: 4,
				InPlay: true,
			},
			{
				Id: "test-tile-id-2",
				Letter: "A",
				Value: 1,
				InPlay: true,
			},
			{
				Id: "test-tile-id-3",
				Letter: "N",
				Value: 5,
				InPlay: true,
			},
			{
				Id: "test-tile-id-4",
				Letter: "A",
				Value: 1,
				InPlay: true,
			},
			{
				Id: "test-tile-id-5",
				Letter: "N",
				Value: 5,
				InPlay: true,
			},
			{
				Id: "test-tile-id-6",
				Letter: "A",
				Value: 1,
				InPlay: true,
			},
			{
				Id: "test-tile-id-7",
				Letter: "S",
				Value: 2,
				InPlay: true,
			},
		},
	}

	game := Game{
		Id: "test-game-id",
		Status: INVITE_PLAYERS,
		PlayerTurn: &player,
		Board: NewBoard(),
		TileBag: NewTileBag(),
		Players: []*GamePlayer{&player},
		IsLocal: true,
	}

	_, err := db.Exec("INSERT INTO users (user_id, username, auth_token) VALUES ($1, $2, $3)", user.Id, user.Username, user.AuthToken)

	if err != nil {
		return err
	}

	boardB, err := json.Marshal(game.Board)

	if err != nil {
			return err
	}

	tileBagB, err := json.Marshal(game.TileBag)

	if err != nil {
			return err
	}

	playerTilesB, err := json.Marshal(player.Tiles)

	if err != nil {
			return err
	}

	_, err = db.Exec("INSERT INTO games (game_id, status, is_local, board, tile_bag) VALUES ($1, $2, $3, $4, $5)", game.Id, game.Status, game.IsLocal, boardB, tileBagB)

	if err != nil {
		return err
	}

	_, err = db.Exec("INSERT INTO game_players (id, player_id, game_id, score, tiles) VALUES ($1, $2, $3, $4, $5)", player.Id, player.User.Id, game.Id, player.Score, playerTilesB)
	
	if err != nil {
		return err
	}

	return nil
}