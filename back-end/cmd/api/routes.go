package main

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func (app *application) routes() http.Handler{
	// create a router mux

	mux := chi.NewRouter()
	mux.Use((middleware.Recoverer)) // will apply on every request that come
	mux.Use(app.enableCORS)

	mux.Get("/", app.Home)
	mux.Post("/authenticate", app.Authenticate)
	mux.Get("/refresh", app.refreshToken)
	mux.Get("/logout", app.logout)
	
	mux.Get("/polls", app.GetAllPolls)
	mux.Get("/polls/{id}", app.GetPoll)
	mux.Post("/polls/create_poll", app.InsertPollWithAnswers)
	mux.Patch("/polls/{id}", app.UpdatePoll)
	mux.Delete("/polls/{id}", app.DeletePoll)
	mux.Delete("/answers/{id}", app.DeleteOneAnswer)
	mux.Post("/sign_up", app.CreateUser)
	mux.Post("/vote", app.Vote)

	return mux
}