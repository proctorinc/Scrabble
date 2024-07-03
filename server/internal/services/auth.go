package services

import (
	"proctorinc/scrabble/internal/db"

	"github.com/google/uuid"
)

type AuthService struct {}

func NewAuthService() *AuthService {
	return &AuthService{}
}

func (s *AuthService) GenerateAuthToken() string {
	return uuid.NewString()
}

func (s *AuthService) VerifyAuthToken(token string) bool {
	db := db.GetDB()

	_, err := db.Query("SELECT * FROM users WHERE auth_token = $1", token)

	if err != nil {
		return false
	}

	return true
}