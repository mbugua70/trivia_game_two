// Base URL of the safaricom_trivia game in backend_games, e.g.
// http://localhost:5000/api/safaricom_trivia/v1 - set in .env.development
// locally and as an environment variable on Vercel.
const API_URL = import.meta.env.VITE_API_URL;

// The backend always answers { success, message, data }.
async function request(path, { method = "GET", body, token } = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw { message: "Failed to fetch", status: 0 };
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw { message: json.message || "Something went wrong", status: res.status };
  }
  return json.data;
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

export function clearStoredUser() {
  localStorage.removeItem("user");
}

// Returns { player: { id, name }, token }.
export function registerPlayer({ name, phone }) {
  return request("/players", { method: "POST", body: { name, phone } });
}

// Starts the player's game, or resumes it after a refresh. Returns
// { session, serverTime, config, questions } - every question includes
// correctOptionId, so the game needs no further requests until submit.
export function startSession() {
  const user = getStoredUser();
  return request("/sessions", { method: "POST", token: user?.token });
}

// answers: [{ questionId, selectedOptionId | null }]. The server works out
// the score; retrying after a dropped response returns the same result.
export function submitSession(sessionId, answers) {
  const user = getStoredUser();
  return request(`/sessions/${sessionId}/submit`, {
    method: "POST",
    token: user?.token,
    body: { answers },
  });
}
