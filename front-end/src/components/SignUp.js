import { useState } from "react";
import Input from "./form/Input";
import { useNavigate, useOutletContext } from "react-router-dom";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const { setAlertMessage } = useOutletContext();
  const { setAlertClassName } = useOutletContext();
  const { toggleRefresh } = useOutletContext();

  const navigate = useNavigate();

  // we need to authenticate user against backend
  const handleSubmit = (event) => {
    event.preventDefault();

    // build request payload
    let payload = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: password,
    };

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };

    fetch(`${process.env.REACT_APP_BACKEND}/sign_up`, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setAlertClassName("alert-danger");
          setAlertMessage(data.message);
        } else {
          setAlertClassName("d-none");
          setAlertMessage("");
          toggleRefresh(true);
          navigate("/");
        }
      })
      .catch((error) => {
        setAlertClassName("alert-danger");
        setAlertMessage(error);
      });
  };

  return (
    <div className="col-md-6 offset-md-3">
      <h2>Sign Up</h2>
      <hr />

      <form onSubmit={handleSubmit}>
        <Input
          title="First name"
          type="text"
          className="form-control"
          name="firstName"
          onChange={(event) => setFirstName(event.target.value)}
        />
        <Input
          title="Last name"
          type="text"
          className="form-control"
          name="lastName"
          onChange={(event) => setLastName(event.target.value)}
        />
        <Input
          title="Email address"
          type="email"
          className="form-control"
          name="email"
          autoComplete="email-new"
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          title="Password"
          type="password"
          className="form-control"
          name="password"
          autoComplete="password-new"
          onChange={(event) => setPassword(event.target.value)}
        />
        <hr />
        <input type="submit" className="btn btn-primary" value="Sign up" />
      </form>
    </div>
  );
};

export default SignUp;
