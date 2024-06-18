import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Polls = () => {
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    const headers = new Headers();
    headers.append("Content-type", "application/json");

    const requestOptions = {
      method: "GET",
      headers: headers,
    };

    fetch(`http://localhost:8080/polls`, requestOptions)
      .then((response) => response.json())
      .then((data) => setPolls(data))
      .catch((err) => {
        console.log(err);
      });

    //console.log(polls);
  }, []);

  return (
    <div>
      <h2>All Polls</h2>
      <hr />
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>Question</th>
            <th>People voted</th>
          </tr>
        </thead>
        <tbody>
          {polls.map((p) => (
            <tr key={p.id}>
              <td>
                <Link
                  to={`/polls/${p.id}`}
                  className="list-group-item list-group-item-action"
                >
                  {p.question}
                </Link>
              </td>
              <td>{p.number_of_votes}</td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Polls;
