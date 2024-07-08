package models

import (
	"encoding/json"
	"fmt"
	"proctorinc/scrabble/internal/db"

	"github.com/google/uuid"
)

type GamePlayer struct {
	Id string `json:"id"`
	Alias string `json:"alias"`
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

func (p *GamePlayer) Save() error {
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

func GetGamePlayersByGameId(gameId string) ([]GamePlayer, error) {
	db := db.GetDB()

	players := []GamePlayer{}

	rows, err := db.Query(`
		SELECT id, alias, player_id, username, score, tiles
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

		if err := rows.Scan(&player.Id, &player.Alias, &player.User.Id, &player.User.Username, &player.Score, &tiles); err != nil {
			return nil, err
		}

		err = json.Unmarshal(tiles, &player.Tiles)

		if err != nil {
			return nil, err
		}

		players = append(players, player)
	}

	return players, nil
}

func CreateGamePlayer(gameId string, user User, alias string) (*GamePlayer, error) {
	db := db.GetDB()

	player := newGamePlayer(user, alias)

	tilesB, err := json.Marshal(player.Tiles)
	if err != nil {
			return nil, err
	}

	_, err = db.Exec(`
		INSERT INTO game_players
		(id, alias, player_id, game_id, score, tiles)
		VALUES ($1, $2, $3, $4, $5, $6)`,
		player.Id, player.Alias, player.User.Id, gameId, player.Score, tilesB)
	
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
		SELECT id, alias, player_id, username, score, tiles
		FROM game_players
		JOIN users ON game_players.player_id = users.user_id
		WHERE user_id = $1 and game_id = $2`,
		userId, gameId).Scan(&player.Id, &player.Alias, &player.User.Id, &player.User.Username, &player.Score, &tiles)

	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(tiles, &player.Tiles)

	if err != nil {
		return nil, err
	}

	return player, nil
}

func (p *GamePlayer) RemoveTiles(tiles []Tile) error {
	for _, tile := range tiles {
		if err := p.removeTile(tile); err != nil {
			return err
		}
	}

	return nil
}

func (p *GamePlayer) HasTiles(tiles []Tile) bool {
	for _, tile := range tiles {
		if !p.hasTile(tile) {
			return false
		}
	}

	return true
}

func (p *GamePlayer) getTileById(id string) (*Tile, error) {
	for _, tile := range p.Tiles {
		if tile.Id == id {
			return &tile, nil
		}
	}

	return nil, fmt.Errorf("invalid tile id: user does not have tile")
} 

func (p *GamePlayer) GetTilesById(ids []string) ([]Tile, error) {
	var tiles []Tile
	
	for _, id := range ids {
		tile, err := p.getTileById(id)
		if err != nil {
			return nil, err
		}
		tiles = append(tiles, *tile)
	}

	return tiles, nil
} 

func (p *GamePlayer) removeTile(tile Tile) error {
	for index, playerTile := range p.Tiles {
		if playerTile.Id == tile.Id {
			p.Tiles = remove(p.Tiles, index)
			return nil
		}
	}

	return fmt.Errorf("unable to remove tile. Tile not found")
}

func (p *GamePlayer) hasTile(tile Tile) bool {
	for _, playerTile := range p.Tiles {
		if playerTile.Id == tile.Id {
			return true
		}
	}

	return false
}

func remove(tiles []Tile, index int) []Tile {
	return append(tiles[:index], tiles[index+1:]...)
}

func newGamePlayer(user User, alias string) *GamePlayer {
	return &GamePlayer{
		Id: uuid.NewString(),
		Alias: alias,
		User: user,
		Score: 0,
		Tiles: []Tile{},
	}
}