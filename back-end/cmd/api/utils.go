package main

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
)

type JSONResponse struct {
	Error bool `json:"error"`
	Message string `json:"message"`
	Data interface{} `json:"data,omitempty"`
}

func (app *application) writeJSON(w http.ResponseWriter, status int, data interface{}, headers ...http.Header) error{
	out, err := json.Marshal(data)

	if err != nil{
		return err
	}

	if len(headers) > 0{
		for key, value := range headers[0]{
			w.Header()[key] = value
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_, err = w.Write(out)
	if err != nil {
		return err
	}

	return nil
}

// data is some kind of pointer in this point
func (app *application) readJSON(w http.ResponseWriter, r *http.Request, data interface{}) error {
	// i dont want to accept request bigger then one megabyte
	maxBytes := 1024*1024
	r.Body = http.MaxBytesReader(w, r.Body, int64(maxBytes))

	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields() // i dont allow json that have field that i dont know about

	err := dec.Decode(data) 
	if err != nil { // domething went wrong in decoding
		return err
	}

	err = dec.Decode(&struct{}{})
	if err != io.EOF { // this means that there is more then one json sent to us
		return errors.New("body must only contain single JSON value")
	}

	return nil
}

func (app *application) errorJSON(w http.ResponseWriter, err error, status ...int) error {
	statusCode := http.StatusBadRequest

	if len(status) > 0 {
		statusCode = status[0]
	}

	var payload JSONResponse
	payload.Error = true
	payload.Message = err.Error()

	return app.writeJSON(w, statusCode, payload)
}
