/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { STAR, StarShape } from "./Star";

const LOW_TIME_MS = 4000;

// Per-question countdown, drawn as a gilt 8-point star whose outline drains
// as time runs out. Keyed by the parent, so it restarts for each question.
// mode: "" while answering, then "correct" | "wrong" | "timeout".
const QuestionTimer = ({ timeout, onTimeOut, mode }) => {
  const [remainingTime, setRemainingTime] = useState(timeout);
  const running = mode === "" && Boolean(onTimeOut);

  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(onTimeOut, timeout);
    return () => clearTimeout(timer);
  }, [timeout, onTimeOut, running]);

  useEffect(() => {
    if (!running) return;
    const startedAt = Date.now();
    const interval = setInterval(() => {
      setRemainingTime(Math.max(0, timeout - (Date.now() - startedAt)));
    }, 100);
    return () => clearInterval(interval);
  }, [timeout, running]);

  const fraction = remainingTime / timeout;
  const seconds = Math.ceil(remainingTime / 1000);
  const isLow = running && remainingTime <= LOW_TIME_MS;

  let label = `${seconds} seconds left`;
  let content = seconds;
  if (mode === "correct") {
    label = "Correct";
    content = "✓";
  } else if (mode === "wrong") {
    label = "Wrong";
    content = "✕";
  } else if (mode === "timeout") {
    label = "Time's up";
    content = "0";
  }

  return (
    <div
      className={`star-timer ${mode ? `star-timer--${mode}` : ""} ${isLow ? "star-timer--low" : ""}`}
      role="timer"
      aria-label={label}>
      <StarShape className="star-timer__svg" aria-hidden="true">
        <polygon points={STAR} className="star-timer__track" />
        <polygon
          points={STAR}
          pathLength="100"
          className="star-timer__fill"
          style={{ strokeDashoffset: mode === "" ? 100 - fraction * 100 : 0 }}
        />
      </StarShape>
      <span className="star-timer__value" aria-hidden="true">
        {content}
      </span>
    </div>
  );
};

export default QuestionTimer;
