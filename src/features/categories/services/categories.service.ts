import { Category } from "@/features/categories/types/category.types";

export async function fetchCategories(signal?: AbortSignal) {
  const res = await fetch("/api/categories", {
    cache: "no-store",
    signal,
  });

  if (res.status === 401) return { status: 401 as const, data: [] as Category[] };
  return { status: res.status, data: (await res.json()) as Category[] };
}
