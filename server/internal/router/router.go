package router

import (
	"proctorinc/scrabble/internal/controllers"
	"proctorinc/scrabble/internal/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func NewRouter() *gin.Engine {
	router := gin.Default()
	config := cors.DefaultConfig()
  config.AllowOrigins = []string{"http://localhost:5173"}
  config.AllowCredentials = true

  router.Use(cors.New(config))

	websocket := new(controllers.WebsocketController)
	router.GET("/ws", websocket.WebSocketHandler)

	// Router groups
	v1 := router.Group("v1")
	{
		userGroup := v1.Group("user")
		{
			user := new(controllers.UserController)
			userGroup.GET("/me", user.GetMe)
		}
		gameGroup := v1.Group("game", middleware.AuthRequired())
		{
			game := new(controllers.GameController)
			gameGroup.GET("", game.GetGameList)
			gameGroup.POST("/start", game.StartGame)
			gameIdGroup := gameGroup.Group(":id")
			{
				gameIdGroup.GET("", game.GetGame)
				gameIdGroup.GET("/logs", game.GetGameLogs)
				gameIdGroup.POST("/join", game.JoinGame)
				gameIdGroup.POST("/quit", game.QuitGame)

				turnGroup := gameIdGroup.Group("/turn", middleware.ActiveTurnRequired())
				{
					turnGroup.POST("/play", game.PlayTiles)
					turnGroup.POST("/swap", game.SwapTiles)
					turnGroup.POST("/skip", game.SkipTurn)
				}
			}
		}
		dictGroup := v1.Group("dictionary", middleware.AuthRequired())
		{
			dictionary := new(controllers.DictionaryController)
			dictGroup.GET("/define", dictionary.DefineWord)
			dictGroup.POST("/validate", dictionary.ValidateWords)
		}
	}

	return router
}