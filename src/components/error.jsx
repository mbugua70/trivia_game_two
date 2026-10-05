import { Link, useRouteError } from "react-router-dom";

const ErrorHandling = () => {
  const error = useRouteError();
  console.error(error);
  return (
    <div className="stage stage--play">
      <div className="stage__content">
        <div className="notice-card" role="alert">
          <h1 className="notice-card__title">Something went wrong</h1>
          <p className="notice-card__text">Reload the page or go back to the start.</p>
          <Link to="/" className="btn btn--primary" reloadDocument>
            Back to start
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorHandling;
