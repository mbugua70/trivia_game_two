import { Link } from "react-router-dom";

const PageNotFound = () => {
  return (
    <div className="notice-card">
      <h1 className="notice-card__title">This page doesn&apos;t exist</h1>
      <p className="notice-card__text">Head back to the start to play the Ziidi Shari&apos;ah quiz.</p>
      <Link to="/" className="btn btn--primary">
        Back to start
      </Link>
    </div>
  );
};

export default PageNotFound;
