package controllers

import (
	"net/http"
	"proctorinc/scrabble/internal/services"

	"github.com/gin-gonic/gin"
)

type DictionaryController struct{}

func (c *DictionaryController) GetDefinition(ctx *gin.Context) {
	word := ctx.Query("word")
	dictService := services.NewDictionaryService()

	if word == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{ "message": "Error defining word. No word provided" })
		ctx.Abort()
		return
	}

	definition, err := dictService.GetDefinition(word)

	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{ "message": "Error retrieving definition", "error": err.Error() })
		ctx.Abort()
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Word definition retrieved", "result": definition})
}