import { Outlet, useLocation } from "react-router-dom";
import bgImage from "../assets/brand/ziidi-bg.jpg";

// The brand background sits behind every screen. On the welcome screen it
// shows as-is; during play it's dimmed so the question card reads clearly.
const Layout = () => {
  const { pathname } = useLocation();
  const isPlaying = pathname !== "/";

  return (
    <div className={`stage ${isPlaying ? "stage--play" : "stage--welcome"}`}>
      <div className="stage__bg" style={{ backgroundImage: `url(${bgImage})` }} aria-hidden="true" />
      <div className="stage__content">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
