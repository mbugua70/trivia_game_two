import { STAR, StarShape } from "./Star";

const Preloader = () => {
  return (
    <div className="preloader" role="status">
      <StarShape className="preloader__star" aria-hidden="true">
        <polygon points={STAR} pathLength="100" />
      </StarShape>
      <p>Getting your questions ready</p>
    </div>
  );
};

export default Preloader;
