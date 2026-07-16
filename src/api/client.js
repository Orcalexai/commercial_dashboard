// Central HTTP client for the admin frontend.
//
// This follows the "Browser Web Login" flow from the auth guide:
//  - Login at POST /api/web-token/ sets HTTP-only `access_token` / `refresh_token`
//    cookies. The frontend never reads the JWT from JavaScript.
//  - Every protected request is sent with `credentials: "include"` so the
//    browser attaches those cookies.
//  - On a 401, we transparently try POST /api/web-token/refresh/ once and retry.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

/**
 * Low-level fetch wrapper. Always sends cookies. Attempts a single silent
 * token refresh on 401 before giving up.
 *
 * @param {string} path      Path beginning with `/api/...` (or an absolute URL).
 * @param {object} options   Standard fetch options.
 * @param {boolean} _retry   Internal flag to avoid infinite refresh loops.
 */
export async function apiFetch(path, options = {}, _retry = false) {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  if (response.status === 401 && !_retry) {
    const refreshed = await refreshToken();
    if (refreshed) {
      return apiFetch(path, options, true);
    }
  }

  return response;
}

/**
 * Parse a fetch Response as JSON, throwing an Error carrying the backend's
 * `error`/`detail` message and status code when the response is not ok.
 */
export async function parseJson(response) {
  let data = null;
  try {
    data = await response.json();
  } catch {
    // No JSON body (e.g. 204). Leave data null.
  }

  if (!response.ok) {
    const message =
      (data && (data.error || data.detail || data.message)) ||
      `Request failed with status ${response.status}`;
    const err = new Error(message);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

/** Browser web login. Sets auth cookies on success. */
export async function webLogin(username, password) {
  const response = await apiFetch("/api/web-token/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  return parseJson(response);
}

/** Refresh the access token cookie using the refresh_token cookie. */
export async function refreshToken() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/web-token/refresh/`, {
      method: "POST",
      credentials: "include",
    });
    return response.ok;
  } catch {
    return false;
  }
}

/** Clear the auth cookies on the backend. */
export async function webLogout() {
  try {
    await apiFetch("/api/web-logout/", { method: "POST" });
  } catch {
    // Best-effort: clear client state regardless.
  }
}

/**
 * Build a query string from a params object, dropping empty values.
 */
export function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      search.append(key, value);
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Fetch a page of exam correction metadata.
 * Accepts either a filter/param object OR a relative `next`/`previous`
 * pagination URL returned by the API (call those exactly as returned).
 */
export async function fetchExamMetadata(paramsOrUrl) {
  const path =
    typeof paramsOrUrl === "string"
      ? paramsOrUrl
      : `/api/exam-correction-metadata/${buildQuery(paramsOrUrl)}`;
  const response = await apiFetch(path, { method: "GET" });
  return parseJson(response);
}
