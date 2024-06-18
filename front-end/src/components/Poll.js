import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CheckBox from "./form/Checkbox";

const Poll = () => {
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState([{}]);
  let { id } = useParams();

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
      })
      .catch((err) => {
        console.log(err);
      });
  }, [id]);

  const handleCheck = (event, position) => {
    console.log("handleCheck called");
    console.log("value in handleCheck:", event.target.value);
    console.log("checked is", event.target.checked);
    console.log("position is", position);

    let tmpArr = answers;
    answers[position].checked = !tmpArr[position].checked;
  };

  const handleSubmit = () => (event) => {
    // TODO: check if anything is checked
    let answersCheckedIds = answers
      .filter((answ) => answ.checked)
      .map((answ) => answ.id);
  };

  return (
    <div>
      <pre>{JSON.stringify({ question: question, answers: answers })}</pre>
      <h2>{question}</h2>
      <hr />
      <>
        {Array.from(answers).map((a, index) => (
          <CheckBox
            title={a.answer}
            name={"answer-" + a.id}
            value={a.id}
            key={a.id}
            onChange={(event) => handleCheck(event, index)}
          />
        ))}
      </>
      <hr />
      <button className="btn btn-primary" onClick={handleSubmit}>
        Vote
      </button>
    </div>
  );
};

export default Poll;
