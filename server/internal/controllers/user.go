package controllers

import (
	"net/http"
	"proctorinc/scrabble/internal/models"

	"github.com/gin-gonic/gin"
)

type UserController struct{}

func (uc *UserController) GetMe(ctx *gin.Context) {
	// Get auth token from require auth middleware
	authToken, tokenErr := ctx.Cookie("token")

	user, userErr := models.GetUserByAuthToken(authToken)

	// Check if request has auth token
	if tokenErr != nil || userErr != nil {
		// If no token, create new user with token
		newUser, err := models.CreateRandomUser()

		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{ "message": "failed to create new user", "error": err.Error() })
			ctx.Abort()
			return
		}

		ctx.SetCookie("token", newUser.AuthToken, 34560000, "/", "localhost", false, true)

		user = &models.User{
			Id: newUser.Id,
			Username: newUser.Username,
		}
	}

	ctx.JSON(http.StatusOK, gin.H{ "user": user })
}