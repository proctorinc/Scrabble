package models

import (
	"fmt"
	"proctorinc/scrabble/internal/db"

	"github.com/google/uuid"
	"github.com/jaswdr/faker/v2"
)

type User struct {
	Id string `json:"id"`
	Username string `json:"username"`
}

type AuthUser struct {
	Id string `json:"id"`
	Username string `json:"username"`
	AuthToken string `json:"auth_token"`
}

func (u AuthUser) GetUser() *User {
	return &User{
		Id: u.Id,
		Username: u.Username,
	}
}

func CreateRandomUser() (*AuthUser, error) {
	db := db.GetDB()

	user := AuthUser{
		Id: uuid.NewString(),
		Username: generateRandomName(),
		AuthToken: uuid.NewString(),
	}

	_, err := db.Exec("INSERT INTO users (user_id, username, auth_token) VALUES ($1, $2, $3);", user.Id, user.Username, user.AuthToken)
 
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func GetUserByAuthToken(token string) (*User, error) {
	db := db.GetDB()
	user := &User{}

	err := db.QueryRow("SELECT user_id, username FROM users WHERE auth_token = $1 LIMIT 1", token).Scan(&user.Id, &user.Username)

	if err != nil {
		return nil, err
	}

	return user, nil
}

func GetUserById(id string) (*User, error) {
	db := db.GetDB()
	user := &User{}

	err := db.QueryRow("SELECT user_id, username FROM users WHERE user_id = $1 LIMIT 1", id).Scan(&user.Id, &user.Username)

	if err != nil {
		return nil, err
	}

	return user, nil
}

func generateRandomName() string {
	faker := faker.New()

	return fmt.Sprintf("%s #%s", faker.Color().ColorName(), faker.RandomStringWithLength(4))
}