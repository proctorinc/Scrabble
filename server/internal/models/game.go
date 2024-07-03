package models

import (
	"encoding/json"
	"fmt"
	"proctorinc/scrabble/internal/db"

	"github.com/google/uuid"
)

type Game struct {
	Id string `json:"id"`
	Status GameStatus `json:"status"`
	IsLocal bool `json:"is_local"`
	Board Board `json:"board"`
	TileBag TileBag `json:"tile_bag"`
	Players []GamePlayer `json:"players"`
	CurrentPlayer *GamePlayer `json:"current_player"`
	PlayerTurn *GamePlayer `json:"player_turn"`
}

type GameStatus string

const (
	INVITE_PLAYERS GameStatus = "invite-players"
	IN_PROGRESS GameStatus = "in-progress"
	COMPLETED GameStatus = "completed"
	CANCELLED GameStatus = "cancelled"
)

func CreateGame(userId string, isLocal bool) (*Game, error) {
	db := db.GetDB()
	status := calculateGameStatus(isLocal)
	game := newGame(status, isLocal)

	boardB, err := json.Marshal(game.Board)

	if err != nil {
			return nil, err
	}

	tileBagB, err := json.Marshal(game.TileBag)

	if err != nil {
			return nil, err
	}

	_, err = db.Exec(`
		INSERT INTO games
		(game_id, status, is_local, board, tile_bag)
		VALUES ($1, $2, $3, $4, $5);`,
		game.Id, game.Status, game.IsLocal, boardB, tileBagB)
 
	if err != nil {
		return nil, err
	}

	return &game, nil
}

func GetGameById(id string) (*Game, error) {
	db := db.GetDB()
	
	game := &Game{
		PlayerTurn: &GamePlayer{},
	}
	var board []uint8
	var tileBag []uint8
	var playerTurnTiles []uint8

	err := db.QueryRow(`
		SELECT games.game_id, status, is_local, board, tile_bag, player_turn_id, alias, score, tiles, user_id, username
		FROM games
		JOIN game_players ON games.player_turn_id = game_players.id
		JOIN users ON game_players.player_id = users.user_id
		WHERE games.game_id = $1 LIMIT 1`,
		id).Scan(&game.Id, &game.Status, &game.IsLocal, &board, &tileBag, &game.PlayerTurn.Id, &game.PlayerTurn.Alias, &game.PlayerTurn.Score, &playerTurnTiles, &game.PlayerTurn.User.Id, &game.PlayerTurn.User.Username)

	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(board, &game.Board)

	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(tileBag, &game.TileBag)

	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(playerTurnTiles, &game.PlayerTurn.Tiles)

	if err != nil {
		return nil, err
	}

	game.Players, err = GetGamePlayersByGameId(id)

	if err != nil {
		return nil, err
	}

	return game, nil
}

func (g Game) IsWaitingForPlayer() bool {
	return !g.IsLocal && g.Status == INVITE_PLAYERS
}

func (g *Game) Save() (*Game, error) {
	db := db.GetDB()

	boardB, err := json.Marshal(g.Board)

	if err != nil {
			return nil, err
	}

	tileBagB, err := json.Marshal(g.TileBag)

	if err != nil {
			return nil, err
	}

	_, err = db.Exec(`
		UPDATE games
		SET status=$1, player_turn_id=$2, board=$3, tile_bag=$4
		WHERE game_id=$5;`,
		g.Status, g.PlayerTurn.Id, boardB, tileBagB, g.Id)
 
	if err != nil {
		return nil, err
	}

	return g, nil
}

func (g *Game) Start() error {
	// Set state to in progress
	g.Status = IN_PROGRESS

	// Deal tiles to all players
	for _, player := range g.Players {
		player.DrawTiles(&g.TileBag)
		if err := player.Save(); err != nil {
			return err
		}
	}

	return nil
}

func (g *Game) Quit() {
	// Set state to in progress
	g.Status = CANCELLED
}

func (g *Game) AddPlayer(player *GamePlayer) {
	g.Players = append(g.Players, *player)

	if g.PlayerTurn == nil {
		g.PlayerTurn = player
	}
}

func (g *Game) IncrementTurn() error {
	for _, player := range g.Players {
		// Set the turn to the player who's turn it currently is not
		if player.Id != g.PlayerTurn.Id {
			g.PlayerTurn = &player
			
			return nil
		}
	}

	return fmt.Errorf("unable to find next player to set turn to")
}

func newGame(status GameStatus, isLocal bool) Game {
	return Game{
		Id: uuid.NewString(),
		Status: status,
		IsLocal: isLocal,
		Board: NewBoard(),
		TileBag: NewTileBag(),
	}
}

func calculateGameStatus(isLocal bool) GameStatus {
	if isLocal {
		return IN_PROGRESS
	}

	return INVITE_PLAYERS
}