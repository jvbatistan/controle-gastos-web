import { Category } from "@/features/categories/types/category.types";
import { api } from "@/lib/api";

export async function fetchCategories(signal?: AbortSignal) {
  try {
    const data = (await api("/api/categories", {
      cache: "no-store",
      signal,
    })) as Category[];

    return { status: 200 as const, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const, data: [] as Category[] };
    }
    throw err;
  }
}
