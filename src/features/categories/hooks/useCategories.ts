"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchCategories } from "@/features/categories/services/categories.service";
import type { Category } from "@/features/categories/types/category.types";

type UseCategoriesParams = {
  enabled: boolean;
  onUnauthorized: () => void;
};

export function useCategories({ enabled, onUnauthorized }: UseCategoriesParams) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchCategories(signal);

      if (result.status === 401) {
        onUnauthorized();
        return;
      }

      setCategories(result.data);
    } catch (err) {
      console.error(err);
      setCategories([]);
      setError("Não foi possível carregar as categorias.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [onUnauthorized]);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    void loadCategories(controller.signal);

    return () => controller.abort();
  }, [enabled, loadCategories]);

  const refetch = useCallback(async () => {
    await loadCategories();
  }, [loadCategories]);

  return { categories, loading, error, refetch };
}
