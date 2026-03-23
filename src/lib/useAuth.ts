"use client";

import { useEffect, useState } from "react";
import { me, type AuthUser } from "@/lib/auth";

type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; user: AuthUser }
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
