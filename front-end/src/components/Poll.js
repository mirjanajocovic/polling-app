import { useEffect, useState } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import CheckBox from "./form/Checkbox";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const Poll = () => {
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState([]);
  const [checks, setChecks] = useState([]);
  const [databaseChecks, setDatabaseChecks] = useState([]);
  const [numberOfVotes, setNumberOfVotes] = useState(0);
  const [voted, setVoted] = useState(false);
  const [statistics, setStatistics] = useState([]);

  let { id } = useParams();

  const { jwtToken } = useOutletContext();
  const { setAlertMessage } = useOutletContext();
  const { setAlertClassName } = useOutletContext();

  const data = {
    labels: answers.map((answer) => answer.answer),
    datasets: [
      {
        label: "Voting results",
        data: statistics,
        backgroundColor: [
          "rgb(22, 114, 136)",
          "rgb(140, 218, 236)",
          "rgb(180, 82, 72)",
          "rgb(212, 140, 132)",
          "rgb(168, 154, 73)",
          "rgb(214, 207, 162)",
          "rgb(60, 180, 100)",
          "rgb(155, 221, 177)",
          "rgb(100, 60, 106)",
          "rgb(131, 99, 148)",
        ],
      },
    ],
  };

  useEffect(() => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + jwtToken);

    const requestOptions = {
      method: "GET",
      headers: headers,
    };

    fetch(`${process.env.REACT_APP_BACKEND}/polls/${id}`, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        setQuestion(data.question);
        setAnswers(data.answers);
        let newChecks = data.answers.map((answ) => answ.ckecked_by_user);
        setDatabaseChecks(newChecks);
        setChecks([]);
        let newChecksByUser = data.answers.map((answ) => answ.number_of_votes);
        setStatistics(newChecksByUser);
        setNumberOfVotes(data.number_of_votes);
        setVoted(data.voted);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [id, jwtToken]);

  const handleCheck = (event, index) => {
    const isChecked = event.target.checked;
    const value = event.target.value;

    // console.log("checked: ", isChecked);
    // console.log("value: ", value);

    databaseChecks[index] = isChecked;
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

    fetch(`${process.env.REACT_APP_BACKEND}/vote`, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setAlertClassName("alert-danger");
          setAlertMessage(data.message);
        } else {
          setAlertClassName("d-none");
          setAlertMessage("");
          setNumberOfVotes((prevVotes) => prevVotes + 1);
          setStatistics(data);
          setVoted(true);
        }
      })
      .catch((error) => {
        setAlertClassName("alert-danger");
        setAlertMessage(error);
      });
  };

  return (
    <div className="container mt-4">
      {/* <pre>
        {JSON.stringify({
          question: question,
          voted: voted,
          numberOfVotes: numberOfVotes,
          answers: answers,
          checks: checks,
          statistics: statistics,
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
            checked={databaseChecks[index]}
            onChange={(event) => handleCheck(event, index)}
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

      {voted && (
        <div
          className="chart-container"
          style={{ position: "relative", width: "40%", height: "40%" }}
        >
          <Doughnut data={data} />
        </div>
      )}
    </div>
  );
};

export default Poll;
