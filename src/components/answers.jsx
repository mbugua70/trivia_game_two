/* eslint-disable react/prop-types */
import { useRef } from "react";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

// phase: "" while answering, then "correct" | "wrong" | "timeout". Once
// answered, the right option is always shown - so a wrong guess or a
// timeout still teaches the player the answer.
const Answers = ({ answers, correctAnswer, selectedAnswer, phase, onSelect }) => {
  // Shuffled once per question, so the right answer isn't always first.
  const shuffled = useRef();
  if (!shuffled.current) {
    shuffled.current = [...answers].sort(() => Math.random() - 0.5);
  }
  const options = shuffled.current;
  const answered = phase !== "";

  return (
    <ul className={`answers ${options.length === 2 ? "answers--pair" : ""}`}>
      {options.map((answer, index) => {
        const isPicked = selectedAnswer === answer;
        const isRight = answer === correctAnswer;
        let state = "";
        if (answered) {
          if (isRight) state = isPicked ? "is-correct" : "is-answer";
          else if (isPicked) state = "is-wrong";
          else state = "is-dim";
        }

        return (
          <li key={answer}>
            <button
              type="button"
              className={`answer ${state}`}
              onClick={() => onSelect(answer)}
              disabled={answered}
              aria-pressed={isPicked}>
              <span className="answer__letter" aria-hidden="true">
                {LETTERS[index]}
              </span>
              <span className="answer__text">{answer}</span>
              {answered && (isRight || isPicked) && (
                <span className="answer__mark" aria-hidden="true">
                  {isRight ? "✓" : "✕"}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
};

export default Answers;
