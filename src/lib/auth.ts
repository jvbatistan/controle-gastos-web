import { api } from "@/lib/api";

type MeResponse = { id: number; email: string };

export function login(email: string, password: string) {
  return api("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function me(): Promise<MeResponse> {
  return api("/api/me");
}

export function logout() {
  return api("/api/logout", { method: "DELETE" });
}
