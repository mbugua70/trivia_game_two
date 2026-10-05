/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { clearStoredUser, submitSession } from "./api";
import { STAR, StarShape } from "./Star";

// How long the results stay up before handing over to the next player.
const RETURN_HOME_SECONDS = 15;

const headlineFor = (correct, total) => {
  const ratio = total === 0 ? 0 : correct / total;
  if (ratio === 1) return "A perfect score!";
  if (ratio >= 0.8) return "You know Ziidi Shari'ah well";
  if (ratio >= 0.5) return "Good effort";
  return "Thanks for playing";
};

const Summary = ({ userAnswers, QUESTIONS, sessionId, onFinished }) => {
  const navigate = useNavigate();
  // "submitting" | "done" | "error"
  const [status, setStatus] = useState("submitting");
  const [result, setResult] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(RETURN_HOME_SECONDS);

  // Shown straight away from the player's own answers; replaced by the
  // server's numbers once the submit comes back.
  const total = result ? result.totalQuestions : QUESTIONS.length;
  const correctCount = result
    ? result.correctCount
    : userAnswers.filter((answer, index) => answer === QUESTIONS[index].correctAnswer).length;
  const skippedCount = result
    ? result.skippedCount
    : userAnswers.filter((answer) => answer === null).length;
  const wrongCount = result ? result.wrongCount : total - correctCount - skippedCount;

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

  const finish = useCallback(() => {
    onFinished();
    clearStoredUser();
    navigate("/");
  }, [navigate, onFinished]);

  // Counts down to the next player once the score is saved.
  useEffect(() => {
    if (status !== "done") return;
    if (secondsLeft <= 0) {
      finish();
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [status, secondsLeft, finish]);

  return (
    <div className="results">
      <section className="results__card" aria-labelledby="results-title">
        <div className="score-star">
          <StarShape className="score-star__svg" aria-hidden="true">
            <polygon points={STAR} className="score-star__shape" />
          </StarShape>
          <p className="score-star__value">
            <span className="score-star__number">{correctCount}</span>
            <span className="score-star__total">out of {total}</span>
          </p>
        </div>

        <h1 id="results-title" className="results__title">
          {headlineFor(correctCount, total)}
        </h1>

        <ul className="tally">
          <li className="tally__item tally__item--right">
            <strong>{correctCount}</strong> correct
          </li>
          <li className="tally__item tally__item--wrong">
            <strong>{wrongCount}</strong> wrong
          </li>
          <li className="tally__item tally__item--skipped">
            <strong>{skippedCount}</strong> skipped
          </li>
        </ul>

        <div className="results__status" aria-live="polite">
          {status === "submitting" && (
            <p className="results__note">
              <span className="spinner spinner--dark" aria-hidden="true" /> Saving your score
            </p>
          )}
          {status === "error" && (
            <>
              <p className="form-error" role="alert">
                Your score didn&apos;t save. Check the connection and try again.
              </p>
              <button type="button" className="btn btn--primary btn--block" onClick={submit}>
                Try again
              </button>
            </>
          )}
          {status === "done" && (
            <>
              <button type="button" className="btn btn--primary btn--block" onClick={finish}>
                Next player
              </button>
              <p className="results__note">Score saved. Next player in {secondsLeft}s.</p>
            </>
          )}
        </div>
      </section>

      <section className="review" aria-labelledby="review-title">
        <h2 id="review-title" className="review__title">
          Your answers
        </h2>
        {/* Only what the player picked - never which answers were right.
            This screen stays up at a public kiosk, so the next player in
            line can see it. */}
        <ol className="review__list">
          {QUESTIONS.map((question, index) => {
            const answer = userAnswers[index] ?? null;
            return (
              <li key={question.id} className="review__item">
                <span className="review__mark" aria-hidden="true">
                  {index + 1}
                </span>
                <div>
                  <p className="review__question">{question.text}</p>
                  <p className="review__answer">
                    {answer === null ? "No answer" : `Your answer: ${answer}`}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
};

export default Summary;
