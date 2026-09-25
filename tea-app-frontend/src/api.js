const TOKEN_KEY = "token";
const LAST_RECOMMENDATION_KEY = "lastRecommendationId";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function getLastRecommendationId() {
  return localStorage.getItem(LAST_RECOMMENDATION_KEY);
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const token = getToken();
  if (token) {
    headers.Authorization = token;
  }

  const response = await fetch(`/api/v1${path}`, { ...options, headers });

  if (response.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = "/login";
    throw new Error("Please log in again.");
  }
  if (!response.ok) {
    throw new Error("Something went wrong. Please try again.");
  }
  return response.json();
}

export async function login(email, password) {
  const response = await fetch("/api/v1/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ user: { email, password } }),
  });

  if (!response.ok) {
    throw new Error("Wrong email or password.");
  }
  localStorage.setItem(TOKEN_KEY, response.headers.get("Authorization"));
}

export async function logout() {
  const token = getToken();
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LAST_RECOMMENDATION_KEY);
  await fetch("/api/v1/logout", {
    method: "DELETE",
    headers: { Authorization: token },
  }).catch(() => {});
}

export function getTeas() {
  return request("/teas");
}

export function getTea(id) {
  return request(`/teas/${id}`);
}

export async function createRecommendation(preferences) {
  const recommendation = await request("/recommendations", {
    method: "POST",
    body: JSON.stringify({ preferences }),
  });
  localStorage.setItem(LAST_RECOMMENDATION_KEY, recommendation.id);
  return recommendation;
}

export function getRecommendation(id) {
  return request(`/recommendations/${id}`);
}
