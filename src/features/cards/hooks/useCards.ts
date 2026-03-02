"use client";

import { useEffect, useState } from "react";
import { fetchCards } from "@/features/cards/services/cards.service";
import { Card } from "@/features/cards/types/card.types";

type UseCardsParams = {
  enabled: boolean;
  onUnauthorized: () => void;
};

export function useCards({ enabled, onUnauthorized }: UseCardsParams) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchCards(controller.signal);

        if (result.status === 401) {
          onUnauthorized();
          return;
        }

        setCards(result.data);
      } catch (err) {
        console.error(err);
        setCards([]);
        setError("Não foi possível carregar os cartões.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [enabled, onUnauthorized]);

  return { cards, loading, error };
}
