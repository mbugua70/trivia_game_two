# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev`: Vite dev server with HMR
- `npm run build`: production build into `dist/` (note: `dist/` is committed to git)
- `npm run preview`: serve the built `dist/`
- `npm run lint`: currently **fails**, because the repo has no ESLint config file (`.eslintrc*`). Source files still carry `eslint-disable` comments for `react/prop-types`, `react-refresh/only-export-components` and `react-hooks/exhaustive-deps`, so keep those conventions if a config is added back.

There is no test framework.

## Architecture

This is a React 18 + Vite single-page frontend for a timed trivia quiz. It is plain JSX, not TypeScript. Its backend is the `safaricom_trivia` game in the sibling `backend_games` repo (see that repo's CLAUDE.md). The base URL comes from `VITE_API_URL` (`.env.development` locally, a Vercel environment variable in production), e.g. `http://localhost:5000/api/safaricom_trivia/v1`. The `"proxy"` field in `package.json` is a leftover and Vite ignores it. `vercel.json` rewrites every path to `index.html` so client-side routing works on Vercel.

### Routing and data flow (React Router v6 data APIs)

`main.jsx` → `App.jsx` → `parentrouter.jsx` (`RouterProvider`) → `childparentrouter.jsx` defines the routes:

- `/` (index) uses `registration.jsx`. Its `loginLoader` reads `?message=` and its `loginAction` calls `POST /players` with name and phone, stores `{ player, token }` in `localStorage["user"]` and redirects to `?redirectTo` or `/trivia`. Backend errors arrive as one readable `message` (e.g. "You have already played") and are shown with SweetAlert2.
- `/trivia` uses `Quiz.jsx`. Its `quizLoader` checks `requireAuth()` (`utilis.js`) and returns `defer({ game: startSession() })`. `POST /sessions` starts the player's one game or resumes it, returning the questions, the game config (timers, `answerColors`) and timing info in one response. Errors (already played, expired token, no questions) render `GameError` via `<Await errorElement>`.
- `Layout` wraps all routes, and `error.jsx` is the route `errorElement`.

### Quiz mechanics

- **No request per answer, by design** (unreliable event wifi). Each question from the API includes `correctOptionId`, so right/wrong is revealed locally. `toQuizQuestions` in `Quiz.jsx` reshapes questions for the components: `answers` (option texts), `correctAnswer` (text of the correct option) and `optionIdByText`. Everything compares the chosen text with `QUESTIONS[i].correctAnswer`.
- `QuizGame` holds the answers given so far (`activeQuestion`; `null` = skipped). The current question index is that array's length. The array is also saved to `localStorage["trivia_answers_<sessionId>"]`, so a refresh resumes at the same question instead of replaying seen ones.
- `answers.jsx` shuffles options once per question (kept in a `useRef`) and colours button `i` with `answerColors[i % length]`.
- `Question` is keyed by question index, so its state resets for each question. `QuestionTimer` is keyed by its `timeout`, so it remounts whenever the phase changes: `questionTimeLimitMs` (default 13s) to answer, then 1s for "answered", then 2s for "correct"/"wrong". When time runs out, the answer is recorded as skipped (`null`).
- `Scoreboard`'s overall countdown starts from the server's `startedAt`/`serverTime`, so a refresh doesn't reset it. It's display-only.
- `Summary` submits `POST /sessions/:id/submit` with the option id picked per question, **never a score**. The server scores it and the summary shows the server's numbers. A retry button covers network failures (submit is idempotent). After success it clears the stored user and saved answers and returns to `/` for the next player.
- Correct and wrong answers play sounds through `howler` and fire confetti. `confetti` is a **global** loaded from a CDN `<script>` in `index.html`, not an npm import.

### Styling

The styling mixes several systems: Materialize CSS and material-icons (imported in `App.jsx`), Bootstrap 4 from a CDN in `index.html`, global styles in `src/index.css` and `src/App.css`, a CSS module (`form.module.css`) for the login form, and `animate.css` classes. MUI, emotion and styled-components are installed, but only `error.jsx` imports any of them.
