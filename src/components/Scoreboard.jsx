import { useState, useEffect } from "react";

/* eslint-disable react/prop-types */
const Scoreboard = ({ userAnswers, QUESTIONS, generalTimer }) => {
  const [remainingTime, setRemainingTime] = useState(generalTimer);
  const answeredCorrectly = userAnswers.filter(
    (answer, index) => answer === QUESTIONS[index].correctAnswer
  );

  const answeredPercent = Math.round(
    (answeredCorrectly.length / userAnswers.length) * 100
  );

  // progress configuration
  useEffect(() => {
    console.log("INTERVAL");
    if (generalTimer <= 0) return;
    const interval = setInterval(() => {
      setRemainingTime((prevTime) => prevTime - 100);
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [generalTimer]);

  let countDown = remainingTime / 1000;

  return (
    <>
      <div className="scoreboard">
        <div className="scores_main">
          <h2>Scores</h2>
          <p>{isNaN(answeredPercent) ? "0" : answeredPercent}%</p>
        </div>
        <div className="timer_main">
          <h2>Timer</h2>
          <p>{remainingTime > 0 ? countDown | 0 : "0"}</p>
        </div>
      </div>
    </>
  );
};

export default Scoreboard;
