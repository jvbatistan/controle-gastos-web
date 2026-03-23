import { api } from "@/lib/api";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  active: boolean;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

type UpdateProfilePayload = {
  name: string;
  email: string;
};

export function login(email: string, password: string) {
  return api("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(payload: RegisterPayload): Promise<AuthUser> {
  return api("/api/register", {
    method: "POST",
    body: JSON.stringify({ user: payload }),
  });
}

export function me(): Promise<AuthUser> {
  return api("/api/me");
}

export function updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
  return api("/api/me", {
    method: "PATCH",
    body: JSON.stringify({ user: payload }),
  });
}

export function logout() {
  return api("/api/logout", { method: "DELETE" });
}
