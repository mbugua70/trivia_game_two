/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";

const QuestionTimer = ({
  timeout,
  onTimeOut,
  mode,
  userAnswers,
  QUESTIONS,
}) => {
  const [remainingTime, setRemainingTime] = useState(timeout);

  const answeredCorrectly = userAnswers.filter(
    (answer, index) => answer === QUESTIONS[index].correctAnswer
  );

  const answeredPercent = Math.round(
    (answeredCorrectly.length / userAnswers.length) * 100
  );
  console.log(answeredPercent);
  useEffect(() => {
    console.log("TIMEOUT");
    const timer = setTimeout(onTimeOut, timeout);
    console.log("Timeout 2");
    return () => {
      clearTimeout(timer);
    };
  }, [timeout, onTimeOut]);

  // progress configuration
  useEffect(() => {
    console.log("INTERVAL");
    if (timeout <= 0) return;
    const interval = setInterval(() => {
      setRemainingTime((prevTime) => prevTime - 100);
    }, 100);

    return () => {
      console.log("Working");
      clearInterval(interval);
    };
  }, [timeout]);

  // let countDown = remainingTime / 1000;

  return (
    <>
      <progress
        value={remainingTime}
        id="question-time"
        max={timeout}
        className={mode}
      />
    </>
  );
};

export default QuestionTimer;
