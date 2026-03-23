"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchCards } from "@/features/cards/services/cards.service";
import type { Card } from "@/features/cards/types/card.types";

type UseCardsParams = {
  enabled: boolean;
  onUnauthorized: () => void;
};

export function useCards({ enabled, onUnauthorized }: UseCardsParams) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCards = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchCards(signal);

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
      if (!signal?.aborted) setLoading(false);
    }
  }, [onUnauthorized]);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    void loadCards(controller.signal);

    return () => controller.abort();
  }, [enabled, loadCards]);

  const refetch = useCallback(async () => {
    await loadCards();
  }, [loadCards]);

  return { cards, loading, error, refetch };
}
