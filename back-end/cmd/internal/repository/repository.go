package repository

import (
	"backend/cmd/internal/models"
	"database/sql"
)

type DatabaseRepo interface {
	Connection () *sql.DB
	AllPolls() ([] *models.Poll, error)
	OnePoll(id int, user_id string) (*models.Poll, error)
	InsertPollWithAnswers(poll models.Poll) (int, error)
	UpdatePoll(payload models.Poll) error
	DeletePoll(id int) error
	DeleteOneAnswer(id int) error
	GetUserByEmail(email string) (*models.User, error)
	GetUserByID(id int) (*models.User, error)
	InsertUser(user *models.User) (int, error)
	InserUserVotes(userId string, answerIds []int, pollId string) ([]int, error)
}