/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import logo from "../assets/brand/ziidi-shariah-logo.png";

const formatClock = (ms) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

// Top bar during play: brand, one segment per question (green = right,
// red = wrong, faded = skipped), score so far, and the overall clock.
const Scoreboard = ({ userAnswers, QUESTIONS, generalTimer }) => {
  const [remainingTime, setRemainingTime] = useState(generalTimer);

  useEffect(() => {
    if (generalTimer <= 0) return;
    const startedAt = Date.now();
    const interval = setInterval(() => {
      setRemainingTime(Math.max(0, generalTimer - (Date.now() - startedAt)));
    }, 250);
    return () => clearInterval(interval);
  }, [generalTimer]);

  const correctCount = userAnswers.filter(
    (answer, index) => answer === QUESTIONS[index].correctAnswer
  ).length;

  return (
    <header className="play-bar">
      <img className="play-bar__logo" src={logo} alt="Ziidi Shari'ah" />

      <ol className="progress" aria-label={`Question ${userAnswers.length + 1} of ${QUESTIONS.length}`}>
        {QUESTIONS.map((question, index) => {
          let state = "upcoming";
          if (index < userAnswers.length) {
            const answer = userAnswers[index];
            state =
              answer === null ? "skipped" : answer === question.correctAnswer ? "right" : "wrong";
          } else if (index === userAnswers.length) {
            state = "current";
          }
          return <li key={question.id} className={`progress__step progress__step--${state}`} />;
        })}
      </ol>

      <dl className="play-bar__stats">
        <div>
          <dt>Score</dt>
          <dd>{correctCount}</dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd className={remainingTime <= 15000 ? "is-low" : ""}>{formatClock(remainingTime)}</dd>
        </div>
      </dl>
    </header>
  );
};

export default Scoreboard;
