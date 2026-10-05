/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { Howl } from "howler";
import QuestionTimer from "./Quiztimer";
import Answers from "./answers";
import correctSoundFile from "../assets/audio/correct.wav";
import wrongSoundFile from "../assets/audio/wrong.wav";

// How long the result stays on screen before the next question.
const REVEAL_MS = 2200;

const correctSound = new Howl({ src: [correctSoundFile] });
const wrongSound = new Howl({ src: [wrongSoundFile] });

const celebrate = () => {
  if (typeof window.confetti !== "function") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  window.confetti({
    particleCount: 90,
    spread: 70,
    origin: { y: 0.65 },
    colors: ["#ffffff", "#D9B45A", "#45B04B", "#1A4A2E"],
  });
};

const Question = ({ onSelect, onSkipAnswer, index, QUESTIONS, timeLimitMs }) => {
  const question = QUESTIONS[index];
  // "" while answering, then "correct" | "wrong" | "timeout".
  const [phase, setPhase] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const finishTimer = useRef(null);

  useEffect(() => () => clearTimeout(finishTimer.current), []);

  const handleSelectedAnswer = (answer) => {
    if (phase !== "") return;
    const isCorrect = answer === question.correctAnswer;
    setSelectedAnswer(answer);
    setPhase(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      correctSound.play();
      celebrate();
    } else {
      wrongSound.play();
    }
    finishTimer.current = setTimeout(() => onSelect(answer), REVEAL_MS);
  };

  const handleTimeout = () => {
    setPhase("timeout");
    wrongSound.play();
    finishTimer.current = setTimeout(onSkipAnswer, REVEAL_MS);
  };

  let feedback = "";
  if (phase === "correct") feedback = "Correct!";
  if (phase === "wrong") feedback = `Not quite. The answer is "${question.correctAnswer}".`;
  if (phase === "timeout") feedback = `Time's up. The answer is "${question.correctAnswer}".`;

  return (
    <section className="question-card" aria-labelledby="question-text">
      <div className="question-card__top">
        <QuestionTimer
          timeout={timeLimitMs}
          onTimeOut={phase === "" ? handleTimeout : null}
          mode={phase}
        />
        <p className="question-card__count">
          Question {index + 1} of {QUESTIONS.length}
        </p>
      </div>

      <h1 id="question-text" className="question-card__text">
        {question.text}
      </h1>

      <Answers
        answers={question.answers}
        correctAnswer={question.correctAnswer}
        selectedAnswer={selectedAnswer}
        phase={phase}
        onSelect={handleSelectedAnswer}
      />

      <p className={`question-card__feedback question-card__feedback--${phase || "idle"}`} aria-live="polite">
        {feedback}
      </p>
    </section>
  );
};

export default Question;
