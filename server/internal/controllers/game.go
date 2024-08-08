package controllers

import (
	"net/http"
	"proctorinc/scrabble/internal/models"
	"proctorinc/scrabble/internal/services"

	"github.com/gin-gonic/gin"
)

type GameController struct{}

type PlayTilesRequestBody struct {
	Cells []models.Cell `json:"cells"`
}

type SwapTilesRequestBody struct {
	TileIds []string `json:"tiles"`
}

func (gc *GameController) GetGameList(ctx *gin.Context) {
	userId := ctx.GetString("user_id")
	gameService := services.NewGameService()

	games, err := gameService.GetGameList(userId)

	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"message": "Error retrieving game list", "error": err.Error()})
		ctx.Abort()
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Game list retrieved", "games": games})
}

func (gc *GameController) GetGame(ctx *gin.Context) {
	gameId := ctx.Param("id")
	userId := ctx.GetString("user_id")
	gameService := services.NewGameService()

	game, err := gameService.GetGameState(userId, gameId)

	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"message": "Error retrieving game", "error": err.Error()})
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
		ctx.JSON(http.StatusNotFound, gin.H{"message": "Error retrieving game logs", "error": err.Error()})
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
		ctx.JSON(http.StatusInternalServerError, gin.H{"message": "Error creating new game", "error": err.Error()})
		ctx.Abort()
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "New game has been created", "game_id": game.Id})
}

func (gc *GameController) JoinGame(ctx *gin.Context) {
	gameId := ctx.Param("id")
	userId := ctx.GetString("user_id")
	gameService := services.NewGameService()

	game, err := gameService.JoinGame(userId, gameId)

	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"message": "Error retrieving game", "error": err.Error()})
		ctx.Abort()
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Joined game successfully", "game_id": game.Id})
}

func (gc *GameController) QuitGame(ctx *gin.Context) {
	gameId := ctx.Param("id")
	userId := ctx.GetString("user_id")
	gameService := services.NewGameService()

	game, err := gameService.QuitGame(userId, gameId)

	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"message": "Error quitting", "error": err.Error()})
		ctx.Abort()
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Game quit successfully", "state": game})
}

func (gc *GameController) PlayTiles(ctx *gin.Context) {
	gameId := ctx.Param("id")
	userId := ctx.GetString("user_id")
	gameService := services.NewGameService()

	var body PlayTilesRequestBody

	if err := ctx.ShouldBindBodyWithJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request body", "error": err.Error()})
		ctx.Abort()
		return
	}

	points, err := gameService.PlayTiles(userId, gameId, body.Cells)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "Invalid tile placement", "error": err.Error()})
		ctx.Abort()
		return
	}

	game, err := gameService.GetGameState(userId, gameId)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "Invalid tile placement", "error": err.Error()})
		ctx.Abort()
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Tiles played successfully", "state": game, "points_scored": points})
}

func (gc *GameController) SwapTiles(ctx *gin.Context) {
	gameId := ctx.Param("id")
	userId := ctx.GetString("user_id")
	gameService := services.NewGameService()

	var body SwapTilesRequestBody

	if err := ctx.ShouldBindBodyWithJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request body", "error": err.Error()})
		ctx.Abort()
		return
	}

	game, err := gameService.SwapTiles(userId, gameId, body.TileIds)

	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"message": "Error swapping tiles", "error": err.Error()})
		ctx.Abort()
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Tiles swapped successfully", "state": game})
}

func (gc *GameController) SkipTurn(ctx *gin.Context) {
	gameId := ctx.Param("id")
	userId := ctx.GetString("user_id")
	gameService := services.NewGameService()

	game, err := gameService.SkipTurn(userId, gameId)

	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"message": "Error skipping turn", "error": err.Error()})
		ctx.Abort()
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Turn skipped successfully", "state": game})
}
