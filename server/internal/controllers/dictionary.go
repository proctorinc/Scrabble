package controllers

import (
	"net/http"
	"proctorinc/scrabble/internal/services"

	"github.com/gin-gonic/gin"
)

type DictionaryController struct{}

type ValidateWordsBody struct {
	Words []string `json:"words"`
}

func (c *DictionaryController) DefineWord(ctx *gin.Context) {
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

func (c *DictionaryController) ValidateWords(ctx *gin.Context) {
	dictService := services.NewDictionaryService()

	var body ValidateWordsBody

	if err := ctx.ShouldBindBodyWithJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{ "message": "Invalid request body", "error": err.Error() })
		ctx.Abort()
		return
	}

	err := dictService.ValidateWords(body.Words)

	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{ "message": "Error validating word", "error": err.Error() })
		ctx.Abort()
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Word is in the dictionary"})
}