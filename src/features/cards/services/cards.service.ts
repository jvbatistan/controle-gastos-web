import { Card } from "@/features/cards/types/card.types";

export async function fetchCards(signal?: AbortSignal) {
  const res = await fetch("/api/cards", {
    cache: "no-store",
    signal,
  });

  if (res.status === 401) return { status: 401 as const, data: [] as Card[] };
  return { status: res.status, data: (await res.json()) as Card[] };
}
