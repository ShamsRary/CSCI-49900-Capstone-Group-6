const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://192.168.1.104:8000").replace(/\/+$/, "");

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${res.statusText}${text ? `: ${text}` : ""}`);
  }

  const contentType = res.headers.get("content-type") || "";
  return contentType.includes("application/json") ? res.json() : res.text();
}

export const api = {
  baseUrl: API_BASE_URL,

  health: () => request("/health"),

  getPuzzleQuestions: (puzzleId) => request(`/puzzles/${puzzleId}/questions`),

  createPuzzle: ({ creator_id, title, visibility = "public", group_id = null, questions }) =>
    request("/puzzles", {
      method: "POST",
      body: JSON.stringify({
        creator_id,
        title,
        visibility,
        group_id,
        questions,
      }),
    }),

  startSession: ({ puzzle_id, host_id, player_ids = null }) =>
    request("/sessions/start", {
      method: "POST",
      body: JSON.stringify({
        puzzle_id,
        host_id,
        player_ids,
      }),
    }),

  saveLayout: (sessionId, { seed, question_ids, cells, default_weight = 1.0 }) =>
    request(`/sessions/${sessionId}/layout`, {
      method: "POST",
      body: JSON.stringify({
        seed,
        question_ids,
        cells,
        default_weight,
      }),
    }),

  submitGuess: (sessionId, { user_id, question_id, is_correct, time_ms, score_delta = 0 }) =>
    request(`/sessions/${sessionId}/guess`, {
      method: "POST",
      body: JSON.stringify({
        user_id,
        question_id,
        is_correct,
        time_ms,
        score_delta,
      }),
    }),

  scheduleReview: (sessionId, { user_id, question_id, delay_hours = 24 }) =>
    request(`/sessions/${sessionId}/review`, {
      method: "POST",
      body: JSON.stringify({
        user_id,
        question_id,
        delay_hours,
      }),
    }),

  completeSession: (sessionId, { xp_awarded = 0, user_id = null } = {}) =>
    request(`/sessions/${sessionId}/complete`, {
      method: "POST",
      body: JSON.stringify({
        xp_awarded,
        user_id,
      }),
    }),
};
