const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function api(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    credentials: "include",
  });

  const contentType = res.headers.get("content-type") || "";

  if (!res.ok) {
    const payload = contentType.includes("application/json")
      ? await res.json().catch(() => ({}))
      : await res.text().catch(() => "");
    const msg =
      (typeof payload === "string" ? payload : payload?.error || payload?.message) ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return contentType.includes("application/json") ? res.json() : res.text();
}
