const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8787").replace(/\/$/, "");

/** ฟังก์ชันกลางสำหรับดึง Header ที่จำเป็น */
function getHeaders(extra?: Record<string, string>) {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extra,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: getHeaders(init?.headers as Record<string, string>),
    ...init,
  });
  if (r.status === 401) logout();
  if (!r.ok) {
    const errorData = await r.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${r.status}`);
  }
  return (await r.json()) as T;
}

export async function apiPost<TReq, TRes>(path: string, body: TReq, init?: RequestInit): Promise<TRes> {
  const r = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: getHeaders(init?.headers as Record<string, string>),
    body: JSON.stringify(body),
    ...init,
  });
  if (r.status === 401) logout();
  if (!r.ok) {
    const errorData = await r.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${r.status}`);
  }
  return (await r.json()) as TRes;
}

export function logout() {
  localStorage.clear();
  window.location.href = "/login";
}
