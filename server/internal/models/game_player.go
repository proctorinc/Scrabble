package models

import (
	"encoding/json"
	"proctorinc/scrabble/internal/db"

	"github.com/google/uuid"
)

type GamePlayer struct {
	Id string `json:"id"`
	User User `json:"user"`
	Score int `json:"score"`
	Tiles []Tile `json:"tiles,omitempty"`
}

func (p *GamePlayer) ScorePoints(points int) {
	p.Score += points
}

func (p *GamePlayer) DrawTiles(b *TileBag) {
	numToDraw := 7 - len(p.Tiles)

	p.Tiles = append(p.Tiles, b.TakeTiles(numToDraw)...)
}

func (p GamePlayer) Save() error {
	db := db.GetDB()

	tilesB, err := json.Marshal(p.Tiles)
	if err != nil {
			return err
	}

	_, err = db.Exec(`
	UPDATE game_players
	SET score=$1, tiles=$2
	WHERE id = $3`, p.Score, tilesB, p.Id)
	
	if err != nil {
		return err
	}

	return nil
}

func GetGamePlayersByGameId(gameId string) ([]*GamePlayer, error) {
	db := db.GetDB()

	players := []*GamePlayer{}

	rows, err := db.Query(`
		SELECT id, player_id, username, score, tiles
		FROM game_players
		JOIN users ON game_players.player_id = users.user_id
		WHERE game_id = $1`,
		gameId)

	if err != nil {
		return nil, err
	}

	defer rows.Close()
		
	for rows.Next() {
		player := GamePlayer{
			User: User{},
		}
		var tiles []uint8

		if err := rows.Scan(&player.Id, &player.User.Id, &player.User.Username, &player.Score, &tiles); err != nil {
			return nil, err
		}

		err = json.Unmarshal(tiles, &player.Tiles)

		if err != nil {
			return nil, err
		}

		players = append(players, &player)
	}

	return players, nil
}

func CreateGamePlayer(gameId string, user User) (*GamePlayer, error) {
	db := db.GetDB()

	player := newGamePlayer(user)

	tilesB, err := json.Marshal(player.Tiles)
	if err != nil {
			return nil, err
	}

	_, err = db.Exec(`
		INSERT INTO game_players
		(id, player_id, game_id, score, tiles)
		VALUES ($1, $2, $3, $4, $5)`,
		player.Id, player.User.Id, gameId, player.Score, tilesB)
	
	if err != nil {
		return nil, err
	}

	return player, nil
}

func GetGamePlayer(userId string, gameId string) (*GamePlayer, error) {
	db := db.GetDB()

	player := &GamePlayer{
		User: User{},
	}
	var tiles []uint8

	err := db.QueryRow(`
		SELECT id, player_id, username, score, tiles
		FROM game_players
		JOIN users ON game_players.player_id = users.user_id
		WHERE user_id = $1 and game_id = $2`,
		userId, gameId).Scan(&player.Id, &player.User.Id, &player.User.Username, &player.Score, &tiles)

	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(tiles, &player.Tiles)

	if err != nil {
		return nil, err
	}

	return player, nil
}

func newGamePlayer(user User) *GamePlayer {
	return &GamePlayer{
		Id: uuid.NewString(),
		User: user,
		Score: 0,
		Tiles: []Tile{},
	}
}