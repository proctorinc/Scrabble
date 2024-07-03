package models

import (
	"encoding/json"
	"proctorinc/scrabble/internal/db"
	"time"

	"github.com/google/uuid"
)

type GameLog struct {
	Id string `json:"id"`
	Player GamePlayer `json:"player"`
	Action GameAction `json:"action"`
	PointsScored *int `json:"points_scored,omitempty"`
	WordPlayed *string `json:"word_played,omitempty"`
	NumTilesTraded *int `json:"num_tiles_traded,omitempty"`
	Date time.Time `json:"date"`
}

type GameAction string

const (
	JOIN_GAME GameAction = "join_game"
	PLAY_TILES GameAction = "play-tiles"
	TRADE_TILES GameAction = "trade-tiles"
	SKIP_TURN GameAction = "skip-turn"
	QUIT_GAME GameAction = "quit-game"
	WIN_GAME GameAction = "win-game"
)

func CreateJoinGameLog(gameId string, playerId string) error {
	db := db.GetDB()
	
	log := GameLog{
		Id: uuid.NewString(),
		Player: GamePlayer{
			Id: playerId,
		},
		Action: JOIN_GAME,
	}

	_, err := db.Exec(`
	INSERT INTO game_logs
	(id, player_id, game_id, action, date)
	VALUES ($1, $2, $3, $4, $5)`,
	log.Id, log.Player.Id, gameId, log.Action, time.Now())

	if err != nil {
		return err
	}

	return nil
}

func CreatePlayTilesLog(gameId string, playerId string, word string, points int) error {
	db := db.GetDB()
	
	log := GameLog{
		Id: uuid.NewString(),
		Player: GamePlayer{
			Id: playerId,
		},
		Action: PLAY_TILES,
		WordPlayed: &word,
		PointsScored: &points,
	}

	_, err := db.Exec(`
	INSERT INTO game_logs
	(id, player_id, game_id, action, points_scored, word_played, date)
	VALUES ($1, $2, $3, $4, $5, $6, $7)`,
	log.Id, log.Player.Id, gameId, log.Action, log.PointsScored, log.WordPlayed, time.Now())

	if err != nil {
		return err
	}

	return nil
}

func CreateTradeTilesLog(gameId string, playerId string, numTiles int) error {
	db := db.GetDB()
	
	log := GameLog{
		Id: uuid.NewString(),
		Player: GamePlayer{
			Id: playerId,
		},
		Action: TRADE_TILES,
		NumTilesTraded: &numTiles,
	}

	_, err := db.Exec(`
	INSERT INTO game_logs
	(id, player_id, game_id, action, num_tiles_traded, date)
	VALUES ($1, $2, $3, $4, $5, $6)`,
	log.Id, log.Player.Id, gameId, log.Action, log.NumTilesTraded, time.Now())

	if err != nil {
		return err
	}

	return nil
}

func CreateSkipTurnLog(gameId string, playerId string) error {
	db := db.GetDB()
	
	log := GameLog{
		Id: uuid.NewString(),
		Player: GamePlayer{
			Id: playerId,
		},
		Action: SKIP_TURN,
	}

	_, err := db.Exec(`
	INSERT INTO game_logs
	(id, player_id, game_id, action, date)
	VALUES ($1, $2, $3, $4, $5)`,
	log.Id, log.Player.Id, gameId, log.Action, time.Now())

	if err != nil {
		return err
	}

	return nil
}

func CreateQuitGameLog(gameId string, playerId string) error {
	db := db.GetDB()
	
	log := GameLog{
		Id: uuid.NewString(),
		Player: GamePlayer{
			Id: playerId,
		},
		Action: QUIT_GAME,
	}

	_, err := db.Exec(`
	INSERT INTO game_logs
	(id, player_id, game_id, action, date)
	VALUES ($1, $2, $3, $4, $5)`,
	log.Id, log.Player.Id, gameId, log.Action, time.Now())

	if err != nil {
		return err
	}

	return nil
}

func CreateWinGameLog(gameId string, playerId string) error {
	db := db.GetDB()
	
	log := GameLog{
		Id: uuid.NewString(),
		Player: GamePlayer{
			Id: playerId,
		},
		Action: WIN_GAME,
	}

	_, err := db.Exec(`
	INSERT INTO game_logs
	(id, player_id, game_id, action, date)
	VALUES ($1, $2, $3, $4, $5)`,
	log.Id, log.Player.Id, gameId, log.Action, time.Now())

	if err != nil {
		return err
	}

	return nil
}

func GetGameLogsByGameId(gameId string) ([]*GameLog, error) {
	db := db.GetDB()

	logs := []*GameLog{}

	rows, err := db.Query(`
		SELECT game_logs.id, game_logs.player_id, user_id, username, score, tiles, action, points_scored, word_played, num_tiles_traded, date
		FROM game_logs
		JOIN game_players ON game_players.id = game_logs.player_id
		JOIN users ON users.user_id = game_players.player_id
		WHERE game_logs.game_id = $1
		ORDER BY date ASC`,
		gameId)

	if err != nil {
		return nil, err
	}

	defer rows.Close()
		
	for rows.Next() {
		log := GameLog{
			Player: GamePlayer{
				User: User{},
			},
		}

		var tiles []uint8

		if err := rows.Scan(&log.Id, &log.Player.Id, &log.Player.User.Id, &log.Player.User.Username, &log.Player.Score,
			&tiles, &log.Action, &log.PointsScored, &log.WordPlayed, &log.NumTilesTraded, &log.Date); err != nil {
			
			return nil, err
		}

		err = json.Unmarshal(tiles, &log.Player.Tiles)

		if err != nil {
			return nil, err
		}

		logs = append(logs, &log)
	}

	return logs, nil
}