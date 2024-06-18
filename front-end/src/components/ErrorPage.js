import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-6 offset-md-3">
          <h1>Ooops</h1>
          <p>Sorry, an unexpected error has occurred.</p>
          <p>
            <em>{error.statusTexe || error.message}</em>
          </p>
        </div>
      </div>
    </div>
  );
}
