# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev`: Vite dev server with HMR
- `npm run build`: production build into `dist/` (note: `dist/` is committed to git)
- `npm run preview`: serve the built `dist/`
- `npm run lint`: currently **fails**, because the repo has no ESLint config file (`.eslintrc*`). Source files still carry `eslint-disable` comments for `react/prop-types`, `react-refresh/only-export-components` and `react-hooks/exhaustive-deps`, so keep those conventions if a config is added back.

There is no test framework.

## Architecture

This is a React 18 + Vite single-page frontend for a timed trivia quiz. It is plain JSX, not TypeScript. Its backend is the `safaricom_trivia` game in the sibling `backend_games` repo (see that repo's CLAUDE.md). The base URL comes from `API_URL` (`.env.development` locally, a Vercel environment variable in production; injected by a `define` in `vite.config.js`, since Vite only exposes `VITE_`-prefixed variables by default), e.g. `http://localhost:5000/api/safaricom_trivia/v1`. The `"proxy"` field in `package.json` is a leftover and Vite ignores it. `vercel.json` rewrites every path to `index.html` so client-side routing works on Vercel.

### Routing and data flow (React Router v6 data APIs)

`main.jsx` → `App.jsx` → `parentrouter.jsx` (`RouterProvider`) → `childparentrouter.jsx` defines the routes:

- `/` (index) uses `registration.jsx`. Its `loginLoader` reads `?message=` and its `loginAction` calls `POST /players` with name and phone, stores `{ player, token }` in `localStorage["user"]` and redirects to `?redirectTo` or `/trivia`. It opens on a welcome screen; "Start the quiz" reveals the form. Errors (empty fields are checked client-side first, then the backend's `message`, e.g. "You have already played") show inline in the form via `useActionData`, not in a pop-up.
- `/trivia` uses `Quiz.jsx`. Its `quizLoader` checks `requireAuth()` (`utilis.js`) and returns `defer({ game: startSession() })`. `POST /sessions` starts the player's one game or resumes it, returning the questions, the game config (timers, `answerColors`) and timing info in one response. Errors (already played, expired token, no questions) render `GameError` via `<Await errorElement>`.
- `Layout` wraps all routes, and `error.jsx` is the route `errorElement`.

### Quiz mechanics

- **No request per answer, by design** (unreliable event wifi). Each question from the API includes `correctOptionId`, so right/wrong is revealed locally. `toQuizQuestions` in `Quiz.jsx` reshapes questions for the components: `answers` (option texts), `correctAnswer` (text of the correct option) and `optionIdByText`. Everything compares the chosen text with `QUESTIONS[i].correctAnswer`.
- `QuizGame` holds the answers given so far (`activeQuestion`; `null` = skipped). The current question index is that array's length. The array is also saved to `localStorage["trivia_answers_<sessionId>"]`, so a refresh resumes at the same question instead of replaying seen ones.
- `answers.jsx` shuffles options once per question (kept in a `useRef`) and labels them A–D by position. After answering, the right option is always highlighted, so a wrong answer or timeout still shows it. The config's `answerColors` is no longer used by the UI.
- `Question` is keyed by question index, so its state resets for each question. Its `phase` is `""` while answering, then `"correct"`, `"wrong"` or `"timeout"`; the result shows for `REVEAL_MS` (2.2s) before moving on, and a timeout is recorded as skipped (`null`). Sounds and confetti fire once from the answer handler, not from render.
- `Quiztimer.jsx` draws the countdown as the 8-point star (`Star.jsx`), counting `questionTimeLimitMs` (default 13s); the same star frames the score in `Summary`.
- `Scoreboard`'s overall countdown starts from the server's `startedAt`/`serverTime`, so a refresh doesn't reset it. It's display-only.
- `Summary` (results) shows the score and, per question, only the answer the player picked: never which were right or the correct answers, because the screen stays up at a public kiosk where the next player can read it. It submits `POST /sessions/:id/submit` with the option id picked per question, **never a score**. The server scores it and the summary shows the server's numbers. A retry button covers network failures (submit is idempotent). After success it clears the stored user and saved answers and returns to `/` for the next player.
- `confetti` is a **global** loaded from a CDN `<script>` in `index.html`, not an npm import.

### Styling

One hand-written stylesheet, `src/index.css`, light theme only (the client rejected a dark look). Tokens live in `:root`: the Ziidi Shari'ah brand greens (`--field`, `--forest`), white surfaces, a sparing gilt accent, and one typeface, Archivo (Google Fonts in `index.html`), set wide (`font-stretch: 125%`) for display text. Materialize, Bootstrap and animate.css are no longer loaded; their npm packages and SweetAlert2 are still in `package.json` but unused.

Brand assets in `src/assets/brand/` were cut from the client's slide: `ziidi-bg.jpg` is the background with the logo and footer painted out, and the logo, tagline and Safaricom | M-PESA mark are separate images, so the layout can place them at any size. `Layout` puts the background behind every screen and fades it slightly during play.

The welcome screen is also the kiosk's idle attract screen. `Lattice.jsx` draws a full-screen lattice of interlocking 8-point stars behind it. The lattice builds itself from the centre outward (stroke-dash animation, delay per tile), then single outer tiles catch a gilt glint, chosen away from the CSS-masked quiet centre so they never sit behind the text. On "Start the quiz" it un-draws while the content leaves (`LEAVE_MS`). The logo reveal, headline and button timings are one orchestrated sequence in the "Welcome motion" block of `index.css`. If the form sits untouched for `FORM_IDLE_MS` (60s), it returns to the welcome screen. With `prefers-reduced-motion`, everything appears complete and still.

Layouts, by media query at the end of `index.css`: phone (≤640px), desktop, large landscape (≥1600px), and **portrait kiosk** (`orientation: portrait` and ≥900px wide; the 1080×1920 event screen). The kiosk layout scales everything up, fills the full height, and puts the answers in the lower half. Hover styles are only applied under `(hover: hover)`, so touchscreens don't show a stuck highlight.
