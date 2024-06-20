package models

import "time"

type Poll struct {
	ID int `json:"id"`
	Question string `json:"question"`
	NumberOfVotes int `json:"number_of_votes"`
	Answers []*Answer `json:"answers"`
	Voted bool `json:"voted"`
	CreatedAt time.Time `json:"-"`
	UpdatedAt time.Time `json:"-"`
}

type Answer struct {
	ID int `json:"id"`
	Answer string `json:"answer"`
	PollId int `json:"-"`
	VotedByUeser bool `json:"ckecked_by_user"`
	NumberOfVotes int `json:"number_of_votes"`
	CreatedAt time.Time `json:"-"`
	UpdatedAt time.Time `json:"-"`
}