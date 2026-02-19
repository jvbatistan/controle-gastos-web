"use client";

import { useEffect, useState } from "react";
import { fetchCategories } from "@/features/categories/services/categories.service";
import { Category } from "@/features/categories/types/category.types";

type UseCategoriesParams = {
  enabled: boolean;
  onUnauthorized: () => void;
};

export function useCategories({ enabled, onUnauthorized }: UseCategoriesParams) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchCategories(controller.signal);

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
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [enabled, onUnauthorized]);

  return { categories, loading, error };
}
