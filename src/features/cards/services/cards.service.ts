import { Card } from "@/features/cards/types/card.types";
import { api } from "@/lib/api";

export async function fetchCards(signal?: AbortSignal) {
  try {
    const data = (await api("/api/cards", {
      cache: "no-store",
      signal,
    })) as Card[];

    return { status: 200 as const, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const, data: [] as Card[] };
    }
    throw err;
  }
}
