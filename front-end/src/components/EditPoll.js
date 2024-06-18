import { useState, useEffect } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import Input from "./form/Input";
import Swal from "sweetalert2";

const EditPoll = () => {
  const navigate = useNavigate();
  const { jwtToken } = useOutletContext();
  const { setAlertMessage } = useOutletContext();
  const { setAlertClassName } = useOutletContext();

  const [error, setError] = useState(null);
  const [errors, setErrors] = useState([]);

  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState([{ answer: "" }]);

  const hasError = (key) => {
    return errors.indexOf(key) !== -1;
  };

  let { id } = useParams();
  if (id === undefined) {
    id = 0;
  }

  // console.log(id);

  useEffect(() => {
    // update an existing poll
    if (id !== 0) {
      // get existing values
      const headers = new Headers();
      headers.append("Content-Type", "application/json");

      const requestOptions = {
        method: "GET",
        headers: headers,
      };

      fetch(`/polls/${id}`, requestOptions)
        .then((response) => {
          if (response.status !== 200) {
            setError("Invalid response code: " + response.status);
          }
          return response.json();
        })
        .then((data) => {
          setQuestion(data.question);
          setAnswers(data.answers);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [id]);

  const handleQuestionChange = (event) => {
    setQuestion(event.target.value);
  };

  const handleAnswerChange = (index, event) => {
    const updatedAnswers = [...answers];
    if (answers[index].id) {
      updatedAnswers[index] = {
        id: answers[index].id,
        answer: event.target.value,
      };
    } else {
      updatedAnswers[index] = { answer: event.target.value };
    }
    setAnswers(updatedAnswers);
  };

  const addAnswer = () => {
    setAnswers([...answers, { answer: "" }]);
  };

  const removeAnswer = (index) => {
    if (answers[index].id) {
      let headers = new Headers();
      // headers.append("Authorization", "Bearer " + jwtToken);

      const requestOptions = {
        method: "DELETE",
        headers: headers,
      };

      let answerId = answers[index].id;
      fetch(`/answers/${answerId}`, requestOptions)
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            console.log(data.error);
          } else {
            const updatedAnswers = [...answers];
            updatedAnswers.splice(index, 1);
            setAnswers(updatedAnswers);
          }
        });
    } else {
      const updatedAnswers = [...answers];
      updatedAnswers.splice(index, 1);
      setAnswers(updatedAnswers);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // add new poll
    if (id === 0) {
      const transformedAnswers = answers.map((answer) => ({
        answer: answer.answer,
      }));
      let payload = {
        question: question,
        answers: transformedAnswers,
      };

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      };

      fetch(`/polls/create_poll`, requestOptions)
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            setAlertClassName("alert-danger");
            setAlertMessage(data.message);
          } else {
            setAlertClassName("d-none");
            setAlertMessage("");
            navigate("/polls");
          }
        })
        .catch((error) => {
          setAlertClassName("alert-danger");
          setAlertMessage(error);
        });

      // update an existing poll
    } else {
      let payload = {
        question: question,
        answers: answers,
      };

      const requestOptions = {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      };

      fetch(`/polls/${id}`, requestOptions)
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            setAlertClassName("alert-danger");
            setAlertMessage(data.message);
          } else {
            setAlertClassName("d-none");
            setAlertMessage("");
            navigate("/polls");
          }
        })
        .catch((error) => {
          setAlertClassName("alert-danger");
          setAlertMessage(error);
        });
    }
  };

  const confirmDelete = () => {
    Swal.fire({
      title: "Delete poll?",
      text: "You cannot undo this action!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        let headers = new Headers();
        // headers.append("Authorization", "Bearer " + jwtToken);

        const requestOptions = {
          method: "DELETE",
          headers: headers,
        };

        fetch(`/polls/${id}`, requestOptions)
          .then((response) => response.json())
          .then((data) => {
            if (data.error) {
              console.log(data.error);
            } else {
              navigate("/polls");
            }
          });
      }
    });
  };

  return (
    <div>
      <h2>Create Poll</h2>
      {/* <pre>{JSON.stringify({ question: question, answers: answers })}</pre> */}
      <form onSubmit={handleSubmit}>
        <input type="hidden" name="id" value={id} id="id"></input>

        <div className="mb-3">
          <Input
            title="Question:"
            name="question"
            type="text"
            className="form-control"
            value={question}
            onChange={handleQuestionChange}
            disabled={id !== 0}
          />
        </div>

        <br />
        <label>Answers:</label>
        <div className="mb-3">
          {answers.map((answer, index) => (
            <div key={index} className="row mb-2">
              <div className="col">
                <Input
                  type="text"
                  className="form-control"
                  value={answer.answer}
                  onChange={(event) => handleAnswerChange(index, event)}
                />
              </div>
              <div className="col-auto d-flex align-items-center">
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={() => removeAnswer(index)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="row mb-2">
          <div className="col">
            <button
              type="button"
              className="btn btn-outline-primary btn-block"
              onClick={addAnswer}
            >
              Add Answer
            </button>
          </div>
        </div>

        {id === 0 ? (
          <div className="row">
            <div className="col">
              <button type="submit" className="btn btn-success btn-block">
                Create Poll
              </button>
            </div>
          </div>
        ) : (
          <div className="row">
            <div className="col">
              <button type="submit" className="btn btn-success btn-block">
                Update poll
              </button>
              <a
                href="#!"
                className="btn btn-danger ms-2"
                onClick={confirmDelete}
              >
                Delete poll
              </a>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default EditPoll;
