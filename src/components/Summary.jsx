/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import CompltedImage from "../assets/image/completedQuiz.png";
import { clearStoredUser, submitSession } from "./api";

// How long the finished screen stays up before going back to registration
// for the next player.
const RETURN_HOME_DELAY_MS = 8000;

const percent = (count, total) => (total === 0 ? 0 : Math.round((count / total) * 100));

const Summary = ({ userAnswers, QUESTIONS, sessionId, onFinished }) => {
  const navigate = useNavigate();
  // "submitting" | "done" | "error"
  const [status, setStatus] = useState("submitting");
  const [result, setResult] = useState(null);

  // Shown straight away from the player's own answers; replaced by the
  // server's numbers once the submit comes back.
  const skippedCount = userAnswers.filter((answer) => answer === null).length;
  const correctCount = userAnswers.filter(
    (answer, index) => answer === QUESTIONS[index].correctAnswer
  ).length;
  const total = result ? result.totalQuestions : userAnswers.length;

  const skippedAnswerPercent = percent(result ? result.skippedCount : skippedCount, total);
  const answeredCorrectlyPercent = result
    ? result.scorePercent
    : percent(correctCount, total);
  const answeredWronglyPercent = result
    ? percent(result.wrongCount, total)
    : 100 - (answeredCorrectlyPercent + skippedAnswerPercent);

  // Sends which option was picked for each question - never a score. Safe
  // to retry: the server returns the same result for a repeat submit.
  const submit = useCallback(async () => {
    setStatus("submitting");
    try {
      const answers = QUESTIONS.map((question, index) => {
        const answer = userAnswers[index] ?? null;
        return {
          questionId: question.id,
          selectedOptionId: answer === null ? null : question.optionIdByText[answer] ?? null,
        };
      });
      setResult(await submitSession(sessionId, answers));
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }, [QUESTIONS, userAnswers, sessionId]);

  useEffect(() => {
    submit();
  }, [submit]);

  // Back to registration for the next player once the score is saved.
  useEffect(() => {
    if (status !== "done") return;
    const timer = setTimeout(() => {
      onFinished();
      clearStoredUser();
      navigate("/");
    }, RETURN_HOME_DELAY_MS);
    return () => clearTimeout(timer);
  }, [status, navigate, onFinished]);

  return (
    <>
      <div id="summary">
        <img src={CompltedImage} alt="Completed quiz" />
        <h2>Quiz Completed</h2>
        {status === "submitting" && <p className="text">Saving your score...</p>}
        {status === "error" && (
          <p className="text">
            We couldn&apos;t save your score.{" "}
            <button className="waves-effect waves-light btn" onClick={submit}>
              Try again
            </button>
          </p>
        )}
        <div id="summary-stats">
          <p>
            <span className="number">{skippedAnswerPercent}%</span>
            <span className="text">Skipped</span>
          </p>
          <p>
            <span className="number">{answeredCorrectlyPercent}%</span>
            <span className="text">Answered Correctly</span>
          </p>
          <p>
            <span className="number">{answeredWronglyPercent}%</span>
            <span className="text">Answered Incorrectly</span>
          </p>
        </div>
        <ol>
          {userAnswers.map((answer, index) => {
            let cssClass = "user-answer";
            if (answer === QUESTIONS[index].correctAnswer) {
              cssClass += " correct";
            } else if (answer === null) {
              cssClass += " skipped";
            } else {
              cssClass += " wrong";
            }
            return (
              <li key={index}>
                <h3>{index + 1}</h3>
                <p className="question">{QUESTIONS[index].text}</p>
                <p className={cssClass}>{answer ?? "SKIPPED"}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
};

export default Summary;
