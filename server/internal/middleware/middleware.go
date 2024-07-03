package middleware

import (
	"net/http"
	"proctorinc/scrabble/internal/models"

	"github.com/gin-gonic/gin"
)

func AuthRequired() gin.HandlerFunc {
	return func(ctx *gin.Context) {

		authToken, err := ctx.Cookie("token")

		if err != nil {
			ctx.JSON(http.StatusUnauthorized, gin.H{ "message": "Invalid auth token supplied" })
			ctx.Abort()
			return
		}

		user, err := models.GetUserByAuthToken(authToken)

		if err != nil {
			ctx.JSON(http.StatusUnauthorized, gin.H{ "message": "Invalid auth token supplied" })
			ctx.Abort()
			return
		}

		ctx.Set("user_id", user.Id)

		ctx.Next()
	}
}

func GameAuthRequired() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		gameId := ctx.Param("id")
		userId := ctx.GetString("user_id")

		_, err := models.GetGamePlayer(userId, gameId)

		// Verify http only cookies
		if err != nil {
			ctx.JSON(http.StatusUnauthorized, gin.H{ "message": "unauthorized to access this endpoint", "error": err.Error() })
			ctx.Abort()
			return
		} else {
			ctx.Next()
		}
	}
}

func ActiveTurnRequired() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		gameId := ctx.Param("id")
		userId := ctx.GetString("user_id")

		game, err := models.GetGameById(gameId)

		if err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{ "message": "game not found" })
			ctx.Abort()
			return
		}

		// Verify http only cookies
		if game.PlayerTurn.User.Id != userId {
			ctx.JSON(http.StatusUnauthorized, gin.H{ "message": "unauthorized to access this endpoint. It is not your turn" })
			ctx.Abort()
			return
		} else {
			ctx.Next()
		}
	}
}