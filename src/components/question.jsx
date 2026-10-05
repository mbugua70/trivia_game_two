/* eslint-disable react/prop-types */
import { useState } from "react";
import QuestionTimer from "./Quiztimer";
import Answers from "./answers";


const Question = ({
  onSelect,
  onSkipAnswer,
  index,
  QUESTIONS,
  COLORS,
  userAnswers,
  timeLimitMs,
}) => {
  const [answer, setAnswer] = useState({
    selectedAnswer: "",
    isCorrect: null,
  });

  let timer = timeLimitMs;

  if (answer.selectedAnswer) {
    timer = 1000;
  }

  if (answer.isCorrect !== null) {
    timer = 2000;
  }

  const handleSelectedAnswer = (answer) => {
    setAnswer({
      selectedAnswer: answer,
      isCorrect: null,
    });

    setTimeout(() => {
      setAnswer({
        selectedAnswer: answer,
        isCorrect: QUESTIONS[index].correctAnswer === answer,
      });

      setTimeout(() => {
        onSelect(answer);
      }, 2000);
    }, 0);
  };

  let answerState = "";

  if (answer.selectedAnswer && answer.isCorrect !== null) {
    answerState = answer.isCorrect ? "correct" : "wrong";
  } else if (answer.selectedAnswer) {
    answerState = "answered";
  }

  return (
    <>
      <div className="semi_header">
        <QuestionTimer
          QUESTIONS={QUESTIONS}
          userAnswers={userAnswers}
          key={timer}
          timeout={timer}
          onTimeOut={answer.selectedAnswer === "" ? onSkipAnswer : null}
          mode={answerState}
        />
      </div>
      <div id="question">
        {/* NOTES::
             KEY USE CASES OTHER THAN IN MAPPING
             -- keys can be used to reset the compfonent by react.(unmount and remount)
             */}
        <div className="question_main animate__animated animate__bounceInRight">
          <p className="question_number">
            {`Question ${userAnswers.length + 1}`}
            {` out of  ${QUESTIONS.length}`}
          </p>
          <h2 className="">{QUESTIONS[index].text}</h2>
        </div>

        <div className="quiz_answers animate__animated animate__bounceInRight">
          <Answers
            COLORS={COLORS}
            selectedAnswer={answer.selectedAnswer}
            answer={QUESTIONS[index].answers}
            onSelect={handleSelectedAnswer}
            answerState={answerState}
          />
        </div>
      </div>
    </>
  );
};

export default Question;
