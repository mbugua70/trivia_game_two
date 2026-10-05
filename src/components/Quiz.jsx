/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { useState, useCallback, useEffect, useMemo, Suspense } from "react";
import Question from "./question";
import { redirect, Link } from "react-router-dom";
import Summary from "./Summary";
import Preloader from "./Preloader";
import { defer, Await, useAsyncError, useLoaderData } from "react-router-dom";
import { clearStoredUser, startSession } from "./api";
import { requireAuth } from "./utilis";
import Scoreboard from "./Scoreboard";

export const quizLoader = async ({ request }) => {
  const pathname = new URL(request.url).pathname;
  const isLoggedIn = await requireAuth();
  if (!isLoggedIn) {
    return redirect(`/?message=You must log in first!!&redirectTo=${pathname}`);
  }
  // Starts the game, or resumes it after a refresh (same session, same
  // questions).
  return defer({ game: startSession() });
};

// Shape the components below expect: answers as a list of option texts and
// the correct one by text. optionIdByText converts back for submitting.
const toQuizQuestions = (questions) =>
  questions.map((q) => ({
    id: q.id,
    text: q.text,
    answers: q.options.map((o) => o.text),
    correctAnswer: q.options.find((o) => o.id === q.correctOptionId)?.text,
    optionIdByText: Object.fromEntries(q.options.map((o) => [o.text, o.id])),
  }));

const answersKey = (sessionId) => `trivia_answers_${sessionId}`;

const loadSavedAnswers = (sessionId, questionCount) => {
  try {
    const saved = JSON.parse(localStorage.getItem(answersKey(sessionId)));
    return Array.isArray(saved) && saved.length <= questionCount ? saved : [];
  } catch {
    return [];
  }
};

const QuizGame = ({ game }) => {
  const QUESTIONS = useMemo(() => toQuizQuestions(game.questions), [game.questions]);
  const sessionId = game.session.id;

  // Saved after every answer so a refresh continues at the same question
  // instead of replaying ones the player has already seen.
  const [activeQuestion, setActiveQuestion] = useState(() =>
    loadSavedAnswers(sessionId, QUESTIONS.length)
  );

  useEffect(() => {
    localStorage.setItem(answersKey(sessionId), JSON.stringify(activeQuestion));
  }, [sessionId, activeQuestion]);

  // Overall countdown, measured from when the game really started on the
  // server, so a refresh doesn't hand the player a fresh clock.
  const allTimer = Math.max(
    0,
    game.session.totalTimeLimitMs -
      (new Date(game.serverTime).getTime() - new Date(game.session.startedAt).getTime())
  );

  const activeQuestionIndex = activeQuestion.length;

  const handleSelectedAnswer = useCallback(function handleSelectedAnswer(selectedAnswer) {
    setActiveQuestion((prevAnswer) => {
      return [...prevAnswer, selectedAnswer];
    });
  }, []);

  const handleSkipAnswer = useCallback(
    () => handleSelectedAnswer(null),
    [handleSelectedAnswer]
  );

  if (activeQuestionIndex === QUESTIONS.length) {
    return (
      <Summary
        userAnswers={activeQuestion}
        QUESTIONS={QUESTIONS}
        sessionId={sessionId}
        onFinished={() => localStorage.removeItem(answersKey(sessionId))}
      />
    );
  }

  return (
    <div className="play">
      <Scoreboard QUESTIONS={QUESTIONS} userAnswers={activeQuestion} generalTimer={allTimer} />
      <Question
        key={activeQuestionIndex}
        index={activeQuestionIndex}
        QUESTIONS={QUESTIONS}
        onSelect={handleSelectedAnswer}
        onSkipAnswer={handleSkipAnswer}
        timeLimitMs={game.config.questionTimeLimitMs}
      />
    </div>
  );
};

// Shown when the game can't start: already played, token expired, no
// questions set up, or the network is down.
const GameError = () => {
  const error = useAsyncError();
  const mustRegisterAgain = error?.status === 401 || error?.status === 409;
  if (mustRegisterAgain) {
    clearStoredUser();
  }
  let title = "The game couldn't start";
  let message = "Check the connection and try again.";
  if (error?.status === 409) {
    title = "You've already played";
    message = "Each phone number gets one game. Thanks for taking part!";
  } else if (error?.status === 401) {
    title = "Your session has expired";
    message = "Enter your details again to continue your game.";
  } else if (error?.status === 503) {
    message = error.message;
  }

  return (
    <div className="notice-card" role="alert">
      <h1 className="notice-card__title">{title}</h1>
      <p className="notice-card__text">{message}</p>
      {mustRegisterAgain ? (
        <Link to="/" className="btn btn--primary">
          Back to start
        </Link>
      ) : (
        <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
          Try again
        </button>
      )}
    </div>
  );
};

const Quiz = () => {
  const loaderData = useLoaderData();

  return (
    <Suspense fallback={<Preloader />}>
      <Await resolve={loaderData.game} errorElement={<GameError />}>
        {(game) => <QuizGame game={game} />}
      </Await>
    </Suspense>
  );
};

export default Quiz;
