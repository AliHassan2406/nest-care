const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:4000";


async function request(path, { method = "GET", body, token, headers } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.message || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  request,
};

