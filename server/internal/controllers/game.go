package controllers

import (
	"log"
	"net/http"
	"proctorinc/scrabble/internal/models"
	"proctorinc/scrabble/internal/services"

	"github.com/gin-gonic/gin"
)

type GameController struct{}

type PlayTilesRequestBody struct {
	Cells []models.Cell `json:"cells"`
}

func (gc *GameController) GetGame(ctx *gin.Context) {
	gameId := ctx.Param("id")
	userId := ctx.GetString("user_id")
	gameService := services.NewGameService()

	game, err := gameService.GetGameState(userId, gameId)

	if err != nil {
		log.Printf("ERROR: %v", err)
		ctx.JSON(http.StatusNotFound, gin.H{ "message": "Error retrieving game", "error": err.Error() })
		ctx.Abort()
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Game state retrieved", "state": game})
}

func (gc *GameController) GetGameLogs(ctx *gin.Context) {
	gameId := ctx.Param("id")
	gameService := services.NewGameService()

	logs, err := gameService.GetGameLogs(gameId)

	if err != nil {
		log.Printf("ERROR: %v", err)
		ctx.JSON(http.StatusNotFound, gin.H{ "message": "Error retrieving game logs", "error": err.Error() })
		ctx.Abort()
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Game logs retrieved", "logs": logs})
}

func (gc *GameController) StartGame(ctx *gin.Context) {
	isLocalParam := ctx.Query("is_local")
	userId := ctx.GetString("user_id")
	gameService := services.NewGameService()

	game, err := gameService.CreateNewGame(userId, isLocalParam == "true")

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{ "message": "Error creating new game", "error": err.Error() })
		ctx.Abort()
		return
	}

	ctx.JSON(http.StatusOK, gin.H{ "message": "New game has been created", "game_id": game.Id })
}

func (gc *GameController) JoinGame(ctx *gin.Context) {
	gameId := ctx.Param("id")
	userId := ctx.GetString("user_id")
	gameService := services.NewGameService()

	game, err := gameService.JoinGame(userId, gameId)

	if err != nil {
		log.Printf("ERROR: %v", err)
		ctx.JSON(http.StatusNotFound, gin.H{ "message": "Error retrieving game", "error": err.Error() })
		ctx.Abort()
		return
	}

	ctx.JSON(http.StatusOK, gin.H{ "message": "Joined game successfully", "game_id": game.Id })
}

func (gc *GameController) QuitGame(ctx *gin.Context) {
gameId := ctx.Param("id")
	gameService := services.NewGameService()
	game, err := gameService.QuitGame(gameId)

	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{ "message": "Error quitting", "error": err.Error() })
		ctx.Abort()
		return
	}

	ctx.JSON(http.StatusOK, gin.H{ "message": "Game quit successfully", "state": game })
}

func (gc *GameController) PlayTiles(ctx *gin.Context) {
	gameId := ctx.Param("id")
	gameService := services.NewGameService()

	var body PlayTilesRequestBody

	if err := ctx.ShouldBindBodyWithJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{ "message": "Invalid request body", "error": err.Error() })
		ctx.Abort()
		return
	}

	game, err := gameService.PlayTiles(gameId, body.Cells)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{ "message": "Invalid tile placement", "error": err.Error() })
		ctx.Abort()
		return
	}

	ctx.JSON(http.StatusOK, gin.H{ "message": "Tiles played successfully", "state": game })
}

func (gc *GameController) SwapTiles(ctx *gin.Context) {
	var tiles = []models.Tile{}
	gameId := ctx.Param("id")
	gameService := services.NewGameService()
	game, err := gameService.SwapTiles(gameId, tiles)

	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{ "message": "Error swapping tiles", "error": err.Error() })
		ctx.Abort()
		return
	}

	ctx.JSON(http.StatusOK, gin.H{ "message": "Tiles swapped successfully", "state": game })
}

func (gc *GameController) SkipTurn(ctx *gin.Context) {
	gameId := ctx.Param("id")
	gameService := services.NewGameService()
	game, err := gameService.SkipTurn(gameId)

	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{ "message": "Error skipping turn", "error": err.Error() })
		ctx.Abort()
		return
	}

	ctx.JSON(http.StatusOK, gin.H{ "message": "Turn skipped successfully", "state": game })
}
