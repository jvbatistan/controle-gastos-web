import type { Card, CardPayload } from "@/features/cards/types/card.types";
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

export async function createCard(payload: CardPayload) {
  try {
    const data = (await api("/api/cards", {
      method: "POST",
      body: JSON.stringify({ card: payload }),
      cache: "no-store",
    })) as Card;

    return { status: 201 as const, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const, data: null as Card | null };
    }
    throw err;
  }
}

export async function updateCard(id: number, payload: CardPayload) {
  try {
    const data = (await api(`/api/cards/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ card: payload }),
      cache: "no-store",
    })) as Card;

    return { status: 200 as const, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const, data: null as Card | null };
    }
    throw err;
  }
}

export async function deleteCard(id: number) {
  try {
    await api(`/api/cards/${id}`, {
      method: "DELETE",
      cache: "no-store",
    });

    return { status: 204 as const };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const };
    }
    throw err;
  }
}
