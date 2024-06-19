package main

import (
	"backend/cmd/internal/models"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt"
)

func (app *application) Home(w http.ResponseWriter, r *http.Request){
	var payload = struct {
		Status string `json:"status"`
		Message string `json:"message"`
		Version string `json:"version"`
	}{
		Status: "active",
		Message: "Polls app up and runing",
		Version: "1.0.0",
	}

	_ = app.writeJSON(w, http.StatusOK, payload)
}

func (app *application) GetAllPolls(w http.ResponseWriter, r *http.Request) {
	polls, err := app.DB.AllPolls()
	if err != nil {
		app.errorJSON(w, err) // user get meaningfull message back
		return 
	}

	_ = app.writeJSON(w, http.StatusOK, polls)
}

func (app *application) Authenticate(w http.ResponseWriter, r *http.Request){
	// read json payload
	var requestPayload struct {
		Email string `json:"email"`
		Password string `json:"password"`
	}

	err := app.readJSON(w, r, &requestPayload)
	if err != nil {
		app.errorJSON(w, err, http.StatusBadRequest)
		return
	}

	// validate user against database
	user, err := app.DB.GetUserByEmail(requestPayload.Email)
	if err != nil {
		app.errorJSON(w, errors.New("invalid credentials"), http.StatusBadRequest)
		return
	}

	// check password
	valid, err := user.PasswordMatches(requestPayload.Password)
	if err != nil || ! valid {
		app.errorJSON(w, errors.New("invalid credentials"), http.StatusBadRequest)
	}

	// create jwt user
	u := jwtUser{
		ID: user.ID,
		FirstName: user.FirstName,
		LastName: user.LastName,
	}

	// generate tokens
	tokens, err := app.auth.GenerateTokenPair(&u)
	if err != nil {
		app.errorJSON(w, err)
		return
	}

	refreshCookie := app.auth.GetRefreshCookie(tokens.RefreshToken)
	http.SetCookie(w, refreshCookie)

	app.writeJSON(w, http.StatusAccepted, tokens)
}

func (app *application) refreshToken(w http.ResponseWriter, r *http.Request) {
	for _, cookie := range r.Cookies() {
		if cookie.Name == app.auth.CookieName {
			claims := &Claims{}
			refreshToken := cookie.Value

			// parse the token to get the claims
			_, err := jwt.ParseWithClaims(refreshToken, claims, func(token *jwt.Token) (interface{}, error) {
				return []byte(app.JWTSecret), nil
			})
			if err != nil {
				app.errorJSON(w, errors.New("unauthorized"), http.StatusUnauthorized)
				return
			}

			// get the user id from the token claims
			userID, err := strconv.Atoi(claims.Subject)
			if err != nil {
				app.errorJSON(w, errors.New("unknown user"), http.StatusUnauthorized)
				return
			}

			user, err := app.DB.GetUserByID(userID)
			if err != nil {
				app.errorJSON(w, errors.New("unknown user"), http.StatusUnauthorized)
				return
			}

			u := jwtUser{
				ID: user.ID,
				FirstName: user.FirstName,
				LastName: user.LastName,
			}

			tokenPairs, err := app.auth.GenerateTokenPair(&u)
			if err != nil {
				app.errorJSON(w, errors.New("error generating tokens"), http.StatusUnauthorized)
				return
			}

			http.SetCookie(w, app.auth.GetRefreshCookie(tokenPairs.RefreshToken))

			app.writeJSON(w, http.StatusOK, tokenPairs)
		}
	}
}

func (app *application) logout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, app.auth.GetExpiredRefreshCookie())
	w.WriteHeader(http.StatusAccepted)
}

func (app *application) GetPoll(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	pollID, err := strconv.Atoi(id)
	if err != nil {
		app.errorJSON(w, err)
		return
	}

	poll, err := app.DB.OnePoll(pollID)
	if err != nil {
		app.errorJSON(w, err)
		return
	}

	_ = app.writeJSON(w, http.StatusOK, poll)
}

func (app *application) InsertPollWithAnswers(w http.ResponseWriter, r *http.Request) {
	var poll models.Poll

	err := app.readJSON(w, r, &poll)
	if err != nil {
		app.errorJSON(w, err)
		return
	}

	newId, err := app.DB.InsertPollWithAnswers(poll)
	if err != nil {
		app.errorJSON(w, err)
		return
	}

	app.writeJSON(w, http.StatusAccepted, newId)
}

func (app *application) UpdatePoll(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	pollID, err := strconv.Atoi(id)
	if err != nil {
		app.errorJSON(w, err)
		return
	}

	var payload models.Poll

	err = app.readJSON(w, r, &payload)
	if err != nil {
		app.errorJSON(w, err)
		return
	}

	payload.ID = pollID

	// number of votes can not be updated in this handler
	err = app.DB.UpdatePoll(payload)
	if err != nil {
		app.errorJSON(w, err)
		return
	}

	resp := JSONResponse{
		Error: false,
		Message: "poll updated",
	}

	app.writeJSON(w, http.StatusAccepted, resp)
}

func (app *application) DeleteOneAnswer(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		app.errorJSON(w, err)
		return
	}

	err = app.DB.DeleteOneAnswer(id)
	if err != nil {
		app.errorJSON(w, err)
		return
	}

	resp := JSONResponse{
		Error: false,
		Message: "answer deleted",
	}

	app.writeJSON(w, http.StatusAccepted, resp)
}

func (app *application) DeletePoll(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		app.errorJSON(w, err)
		return
	}

	err = app.DB.DeletePoll(id)
	if err != nil {
		app.errorJSON(w, err)
		return
	}

	resp := JSONResponse{
		Error: false,
		Message: "poll deleted",
	}

	app.writeJSON(w, http.StatusAccepted, resp)
}

func (app *application) CreateUser(w http.ResponseWriter, r *http.Request) {
	var user models.User

	err := app.readJSON(w, r, &user)
	if err != nil {
		app.errorJSON(w, err, http.StatusBadRequest)
		return
	}

	hashedPassword, err := user.GeneratePasswordHash(user.Password)
	if err != nil {
		app.errorJSON(w, err)
		return
	}

	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()
	user.Password = hashedPassword

	newID, err := app.DB.InsertUser(&user)
	if err != nil {
		app.errorJSON(w, err)
		return
	}
	app.writeJSON(w, http.StatusAccepted, newID)
}

func (app *application) Vote(w http.ResponseWriter, r *http.Request) {
	var requestPayload struct {
		Answers []int `json:"answers"`
		PollId string `json:"poll_id"`
	}

	err := app.readJSON(w, r, &requestPayload)
	if err != nil {
		app.errorJSON(w, err, http.StatusBadRequest)
		return
	}

	_, claims, err := app.auth.GetTokenFromHeaderAndVerify(w, r)
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

	newID, err := app.DB.InserUserVotes(claims.Subject, requestPayload.Answers, requestPayload.PollId)
	if err != nil {
		app.errorJSON(w, err)
		return
	}
	app.writeJSON(w, http.StatusAccepted, newID)
}