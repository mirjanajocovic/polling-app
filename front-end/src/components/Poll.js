import { useEffect, useState } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import CheckBox from "./form/Checkbox";

const Poll = () => {
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState([]);
  const [checks, setChecks] = useState([]);
  const [numberOfVotes, setnumberOfVotes] = useState(0);
  const [voted, setVoted] = useState(false);

  let { id } = useParams();

  const { jwtToken } = useOutletContext();
  const { setAlertMessage } = useOutletContext();
  const { setAlertClassName } = useOutletContext();

  useEffect(() => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const requestOptions = {
      method: "GET",
      headers: headers,
    };

    fetch(`/polls/${id}`, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        setQuestion(data.question);
        setAnswers(data.answers);
        setChecks([]);
        setnumberOfVotes(data.number_of_votes);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [id]);

  const handleCheck = (event) => {
    const isChecked = event.target.checked;
    const value = event.target.value;

    setChecks((prevChecks) => {
      if (isChecked) {
        return [...prevChecks, parseInt(value)];
      } else {
        return prevChecks.filter((el) => el !== value);
      }
    });
  };

  const handleSubmit = () => {
    // TODO: check if anything is checked

    let payload = {
      answers: checks,
      poll_id: id,
    };

    let headers = new Headers();
    headers.append("Authorization", "Bearer " + jwtToken);
    headers.append("Content-Type", "application/json");

    const requestOptions = {
      method: "POST",
      credentials: "include",
      headers: headers,
      body: JSON.stringify(payload),
    };

    fetch(`/vote`, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setAlertClassName("alert-danger");
          setAlertMessage(data.message);
        } else {
          setAlertClassName("d-none");
          setAlertMessage("");
          setnumberOfVotes((prevVotes) => prevVotes + 1);
        }
      })
      .catch((error) => {
        setAlertClassName("alert-danger");
        setAlertMessage(error);
      });

    setVoted(true);
  };

  return (
    <div className="container mt-4">
      {/* <pre>
        {JSON.stringify({
          question: question,
          numberOfVotes: numberOfVotes,
          answers: answers,
        })}
      </pre> */}
      <div className="row">
        <div className="col">
          <h2>{question}</h2>
        </div>
        <div className="col-auto text-end">
          <p className="fs-3 mb-0">{numberOfVotes} people voted</p>
        </div>
      </div>
      <hr />
      <>
        {Array.from(answers).map((a, index) => (
          <CheckBox
            title={a.answer}
            name={"answer-" + a.id}
            value={a.id}
            key={index}
            onChange={(event) => handleCheck(event)}
            disabled={voted}
          />
        ))}
      </>
      <hr />
      {!voted && (
        <button className="btn btn-primary" onClick={handleSubmit}>
          Vote
        </button>
      )}
    </div>
  );
};

export default Poll;
