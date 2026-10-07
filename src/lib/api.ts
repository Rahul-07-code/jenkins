export const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("praja_sathi_token");
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

export function saveSession(payload: { token: string; user: unknown }) {
  localStorage.setItem("praja_sathi_token", payload.token);
  localStorage.setItem("praja_sathi_user", JSON.stringify(payload.user));
  window.dispatchEvent(new Event("praja-sathi-auth-change"));
}

export function clearSession() {
  localStorage.removeItem("praja_sathi_token");
  localStorage.removeItem("praja_sathi_user");
  window.dispatchEvent(new Event("praja-sathi-auth-change"));
}

export function getStoredUser<T = any>(): T | null {
  try {
    const raw = localStorage.getItem("praja_sathi_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
