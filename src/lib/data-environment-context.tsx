"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { fetchDataEnvironment, type DataEnvironment } from "@/lib/data-environment";
import { useAuth } from "@/lib/useAuth";

type DataEnvironmentState =
  | { status: "idle"; data: null }
  | { status: "loading"; data: null }
  | { status: "ready"; data: DataEnvironment }
  | { status: "error"; data: null };

type DataEnvironmentContextValue = DataEnvironmentState & {
  refresh: () => Promise<void>;
  reset: () => void;
};

const DataEnvironmentContext = createContext<DataEnvironmentContextValue | null>(null);

export function DataEnvironmentProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [state, setState] = useState<DataEnvironmentState>({ status: "idle", data: null });
  const requestVersion = useRef(0);

  const refresh = useCallback(async () => {
    const version = ++requestVersion.current;
    setState({ status: "loading", data: null });
    try {
      const data = await fetchDataEnvironment();
      if (requestVersion.current === version) setState({ status: "ready", data });
    } catch {
      if (requestVersion.current === version) setState({ status: "error", data: null });
    }
  }, []);

  const reset = useCallback(() => {
    requestVersion.current += 1;
    setState({ status: "idle", data: null });
  }, []);

  useEffect(() => {
    let active = true;

    if (auth.status === "authenticated") {
      queueMicrotask(() => {
        if (active) void refresh();
      });
    } else {
      queueMicrotask(() => {
        if (active) reset();
      });
    }

    return () => {
      active = false;
    };
  }, [auth.status, refresh, reset]);

  const value = useMemo<DataEnvironmentContextValue>(() => ({
    ...state,
    refresh,
    reset,
  }), [refresh, reset, state]);

  return <DataEnvironmentContext.Provider value={value}>{children}</DataEnvironmentContext.Provider>;
}

export function useDataEnvironment() {
  const context = useContext(DataEnvironmentContext);

  if (!context) {
    throw new Error("useDataEnvironment must be used within DataEnvironmentProvider.");
  }

  return context;
}
