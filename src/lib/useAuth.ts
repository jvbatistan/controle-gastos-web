"use client";

import { useEffect, useState } from "react";
import { me } from "@/lib/auth";

type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; user: { id: number; email: string } }
  | { status: "unauthenticated" };

export function useAuth() {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    me()
      .then((user) => setState({ status: "authenticated", user }))
      .catch(() => setState({ status: "unauthenticated" }));
  }, []);

  return state;
}