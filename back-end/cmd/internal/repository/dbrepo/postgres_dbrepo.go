package dbrepo

import (
	"backend/cmd/internal/models"
	"context"
	"database/sql"
	"time"
)

type PostgresDBRepo struct {
	DB *sql.DB
}

const dbTimeout = time.Second * 200 // users can dissaper unexpected, lost connection, close laptop....

func (m *PostgresDBRepo) Connection ()*sql.DB {
	return m.DB
}

func (m *PostgresDBRepo) AllPolls() ([] *models.Poll, error) {
	ctx, cancel := context.WithTimeout(context.Background(), dbTimeout)
	defer cancel()

	query := `
		select
			id, question, number_of_votes, created_at, updated_at
		from
			polls
		order by
			question
	`

	rows, err := m.DB.QueryContext(ctx, query)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var polls []*models.Poll

	for rows.Next() {
		var poll models.Poll
		err := rows.Scan(
			&poll.ID,
			&poll.Question,
			&poll.NumberOfVotes,
			&poll.CreatedAt,
			&poll.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		polls = append(polls, &poll)
	}

	return polls, nil
}

func (m *PostgresDBRepo) OnePoll(id int) (*models.Poll, error) {
	ctx, cancel := context.WithTimeout(context.Background(), dbTimeout)
	defer cancel()

	query := `select id, question, number_of_votes, created_at, updated_at
			from polls where id = $1`

	row := m.DB.QueryRowContext(ctx, query, id)

	var poll models.Poll

	err := row.Scan(
		&poll.ID,
		&poll.Question,
		&poll.NumberOfVotes,
		&poll.CreatedAt,
		&poll.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	query = `select id, answer, poll_id, created_at, updated_at
		from answers
		where poll_id = $1`

	rows, err := m.DB.QueryContext(ctx, query, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var answers []*models.Answer

	for rows.Next() {
		var a models.Answer
		err := rows.Scan(
			&a.ID,
			&a.Answer,
			&a.PollId,
			&a.CreatedAt,
			&a.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		answers = append(answers, &a)
	}

	poll.Answers = answers

	return &poll, nil
}

func (m *PostgresDBRepo) InsertPollWithAnswers(poll models.Poll) (int, error) {
	ctx, cancel := context.WithTimeout(context.Background(), dbTimeout)
	defer cancel()

	stmt := `insert into polls (question, created_at, updated_at)
		values ($1, now(), now())
		returning id`

	var newID int

	err := m.DB.QueryRowContext(ctx, stmt, poll.Question).Scan(&newID)
	if err != nil {
		return 0, err
	}

	for i := 0; i < len(poll.Answers); i++ {
		stmt = `insert into answers (answer, poll_id, created_at, updated_at)
			values ($1, $2, now(), now())`

		_, err = m.DB.QueryContext(ctx, stmt, poll.Answers[i].Answer, newID)
		if err != nil {
			return 0, err
		}
	}

	return newID, nil	
}

func (m *PostgresDBRepo) UpdatePoll(payload models.Poll) error {
	ctx, cancel := context.WithTimeout(context.Background(), dbTimeout)
	defer cancel()

	stmt := `update polls set question = $1, updated_at = now()
			where id = $2`

	_, err := m.DB.ExecContext(ctx, stmt, payload.Question, payload.ID)
	if err != nil {
		return err
	}

	updateStmt := `UPDATE answers
    			   SET answer = $1, updated_at = NOW()
    			   WHERE id = $2 AND poll_id = $3;`

	insertStmt := `INSERT INTO answers (answer, poll_id, created_at, updated_at)
    			   VALUES ($1, $2, NOW(), NOW());`

	// Execute the SQL statement inside the loop
	for i := 0; i < len(payload.Answers); i++ {
    	var stmt string
    	var args []interface{}

    	// Check if the answer already exists and decide the statement
    	var count int
    	err := m.DB.QueryRowContext(ctx, "SELECT COUNT(*) FROM answers WHERE id = $1 AND poll_id = $2", payload.Answers[i].ID, payload.ID).Scan(&count)
    	if err != nil {
        	return err
    	}

    	if count > 0 {
        	stmt = updateStmt
        	args = []interface{}{payload.Answers[i].Answer, payload.Answers[i].ID, payload.ID}
    	} else {
       		stmt = insertStmt
        	args = []interface{}{payload.Answers[i].Answer, payload.ID}
    	}

    	// Execute the statement with ExecContext
    	_, err = m.DB.ExecContext(ctx, stmt, args...)
    	if err != nil {
        	return err
    	}
	}

	return nil
}

func (m *PostgresDBRepo) DeleteOneAnswer(id int) error {
	ctx, cancel := context.WithTimeout(context.Background(), dbTimeout)
	defer cancel()

	stmt := `delete from answers where id = $1`
	_, err := m.DB.ExecContext(ctx, stmt, id)
	if err != nil{
		return err
	}

	return nil
}

func (m *PostgresDBRepo) DeletePoll(id int) error {
	ctx, cancel := context.WithTimeout(context.Background(), dbTimeout)
	defer cancel()

	stmt := `delete from polls where id = $1`

	_, err := m.DB.ExecContext(ctx, stmt, id)
	if err != nil{
		return err
	}

	return nil
}

func (m *PostgresDBRepo) GetUserByEmail(email string) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), dbTimeout)
	defer cancel()

	query := `select id, email, first_name, last_name, password,
			created_at, updated_at from users where email = $1`

	var user models.User
	row := m.DB.QueryRowContext(ctx, query, email)

	err := row.Scan(
		&user.ID,
		&user.Email,
		&user.FirstName,
		&user.LastName,
		&user.Password,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (m *PostgresDBRepo) InsertUser(user *models.User) (int, error) {
	ctx, cancel := context.WithTimeout(context.Background(), dbTimeout)
	defer cancel()

	stmt := `insert into users (first_name, last_name, email, password, created_at, updated_at)
			values ($1, $2, $3, $4, $5, $6) returning id`

	
	var newID int

	err := m.DB.QueryRowContext(ctx, stmt,
		user.FirstName,
		user.LastName,
		user.Email,
		user.Password,
		user.CreatedAt, 
		user.UpdatedAt,
	).Scan(&newID)

	if err != nil {
		return 0, err
	}

	return newID, nil
}

func (m *PostgresDBRepo) GetUserByID(id int) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), dbTimeout)
	defer cancel()

	query := `select id, email, first_name, last_name, password,
			created_at, updated_at from users where id = $1`

	var user models.User
	row := m.DB.QueryRowContext(ctx, query, id)

	err := row.Scan(
		&user.ID,
		&user.Email,
		&user.FirstName,
		&user.LastName,
		&user.Password,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (m *PostgresDBRepo) InserUserVotes(userId string, answerIds []int, pollId string) ([]int, error) {
	ctx, cancel := context.WithTimeout(context.Background(), dbTimeout)
	defer cancel()

	stmt := `insert into users_answers(user_id, answer_id)
			values ($1, $2)`

	
	// TODO: chek if all answers are from same poll, does all answers exist
	// TODO: check if vote is alredy present

	
	for i := 0; i < len(answerIds); i++ {
		_, err := m.DB.ExecContext(ctx, stmt, userId, answerIds[i])
		if err != nil {
			return []int{}, err
		}
	}

	stmt = `update polls
			set number_of_votes = number_of_votes + 1
			where id = $1`

	_, err := m.DB.ExecContext(ctx, stmt, pollId)
	if err != nil {
		return []int{}, err
	}

	query := `select id from answers where poll_id = $1`
	rows, err := m.DB.QueryContext(ctx, query, pollId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var allAnswersForPollIds []int
	for rows.Next() {
		var a int
		err := rows.Scan(
			&a,
		)
		if err != nil {
			return nil, err
		}

		allAnswersForPollIds = append(allAnswersForPollIds, a)
	}

	var response []int
	query = `select count(*) from users_answers where answer_id = $1`
	for i := 0; i < len(allAnswersForPollIds); i++ {
		var count int
		err := m.DB.QueryRowContext(ctx, query, allAnswersForPollIds[i]).Scan(&count)
		if err != nil {
			return []int{}, err
		}
		response = append(response, count)
	}
	return response, nil
}