// ClientApp/src/api/client.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}
