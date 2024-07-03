package services

import (
	"fmt"
	"log"
	"proctorinc/scrabble/internal/models"
)

type GameService struct {}

func NewGameService() *GameService {
	 return &GameService{}
}

func (s *GameService) GetGameState(userId string, gameId string) (*models.Game, error) {
	game, err := models.GetGameById(gameId)

	if err != nil {
		return nil, err
	}

	// Skip error for when user first joins and there is no current player
	player, _ := models.GetGamePlayer(userId, gameId)

	game.CurrentPlayer = player

	return game, nil
}

func (s *GameService) GetGameLogs(gameId string) ([]*models.GameLog, error) {
	logs, err := models.GetGameLogsByGameId(gameId)

	if err != nil {
		return nil, err
	}

	return logs, nil
}

func (s *GameService) CreateNewGame(userId string, isLocal bool) (*models.Game, error) {
	game, err := models.CreateGame(userId, isLocal)

	if err != nil {
		return nil, err
	}

	user, err := models.GetUserById(userId)

	if err != nil {
		return nil, err
	}

	player, err := models.CreateGamePlayer(game.Id, *user, "Player 1")

	if err != nil {
		return nil, err
	}

	game.AddPlayer(player)

	if err = models.CreateJoinGameLog(game.Id, player.Id); err != nil {
		return nil, err
	}

	// If local, start the game
	if game.IsLocal {
		player, err := models.CreateGamePlayer(game.Id, *user, "Player 2")

		if err != nil {
			return nil, err
		}
	
		game.AddPlayer(player)

		if err = models.CreateJoinGameLog(game.Id, player.Id); err != nil {
			return nil, err
		}

		if err = game.Start(); err != nil {
			return nil, err
		}

	}

	return game.Save()
}

func (s *GameService) QuitGame(gameId string) (*models.Game, error) {
	game, err := models.GetGameById(gameId)

	if err != nil {
		return nil, err
	}

	game.Quit()

	// TODO: should the active user not be the only one who can quit the game?
	err = models.CreateQuitGameLog(gameId, game.PlayerTurn.Id)

	if err != nil {
		return nil, err
	}

	return game, nil
}

func (s *GameService) JoinGame(userId string, gameId string) (*models.Game, error) {
	game, err := models.GetGameById(gameId)

	if err != nil {
		return nil, err
	}

	// Get Authenticated user
	user, err := models.GetUserById(userId)

	if err != nil {
		return nil, err
	}

	// Check if game is accepting users
	if game.IsWaitingForPlayer() {
		player, err := models.CreateGamePlayer(game.Id, *user, "Player 2")

		if err != nil {
			return nil, err
		}

		game.AddPlayer(player)

		err = models.CreateJoinGameLog(game.Id, player.Id)

		if err != nil {
			return nil, err
		}

		// Move game status to in progress
		err = game.Start()

		if err != nil {
			return nil, err
		}

		return game.Save()

	}
	
	return nil, fmt.Errorf("game is no longer accepting players to join")
}

func (s *GameService) PlayTiles(gameId string, cells []models.Cell) (*models.Game, error) {
	dictionaryService := NewDictionaryService()
	
	game, err := models.GetGameById(gameId)

	if err != nil {
		return nil, err
	}
	
	tiles, err := getTilesFromCells(cells)

	if err != nil {
		return nil, err
	}

	if !game.PlayerTurn.HasTiles(tiles) {
		return nil, fmt.Errorf("invalid tiles. User does not have all tiles played")
	}

	if err := game.Board.PutTilesOnBoard(cells); err != nil {
		return nil, err
	}

	if err := game.Board.ValidateTilePlacement(); err != nil {
		return nil, err
	}

	played, err := game.Board.GetPlayedWords()

	if err != nil {
		return nil, err
	}

	if len(played.Words) == 0 {
		return nil, fmt.Errorf("no valid words were played")
	}

	if err := dictionaryService.ValidateWords(played.Words); err != nil {
		return nil, err
	}

	game.Board.ConfirmInPlayTiles()

	if err := game.PlayerTurn.RemoveTiles(tiles); err != nil {
		return nil, err
	}

	game.PlayerTurn.ScorePoints(played.TotalPoints)

	log.Printf("Player's new score: %d", game.PlayerTurn.Score)

	log.Printf("BEFORE: Tiles in bag: %d", game.TileBag.GetTileCount())
	// Current player draw new tiles
	game.PlayerTurn.DrawTiles(&game.TileBag)

	log.Printf("AFTER: Tiles in bag: %d", game.TileBag.GetTileCount())

	if err = game.PlayerTurn.Save(); err != nil {
		return nil, err
	}

	// Log player turn
	if err = models.CreatePlayTilesLog(gameId, game.PlayerTurn.Id, played.Words[0].Word, played.TotalPoints); err != nil {
		return nil, err
	}

	if err = game.IncrementTurn(); err != nil {
		return nil, err
	}

	return game.Save()
}

func (s *GameService) SwapTiles(gameId string, tiles []models.Tile) (*models.Game, error) {
	game, err := models.GetGameById(gameId)

	if err != nil {
		return nil, err
	}

	// Confirm user has all the tiles

	// Remove tiles from the user

	// Add tiles back into the tile bag

	// Save the game

	// Log player turn
	err = models.CreateTradeTilesLog(gameId, game.PlayerTurn.Id, len(tiles))

	if err != nil {
		return nil, err
	}

	// Return the game
	return nil, fmt.Errorf("swap tiles functionality not implemented yet")
}

func (s *GameService) SkipTurn(gameId string) (*models.Game, error) {
	game, err := models.GetGameById(gameId)

	if err != nil {
		return nil, err
	}
	
	// Log player turn
	err = models.CreateSkipTurnLog(gameId, game.PlayerTurn.Id)

	if err != nil {
		return nil, err
	}

	err = game.IncrementTurn()

	if err != nil {
		return nil, err
	}

	game.Save()

	return game, nil
}

func getTilesFromCells(cells []models.Cell) ([]models.Tile, error) {
	tiles := []models.Tile{}

	for _, cell := range cells {
		if cell.Tile != nil {
			tiles = append(tiles, *cell.Tile)
		} else {
			return nil, fmt.Errorf("invalid cell. No tile on cell")
		}
	}

	return tiles, nil
}