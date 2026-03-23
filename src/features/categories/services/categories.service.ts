import type { Category, CategoryPayload } from "@/features/categories/types/category.types";
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

export async function createCategory(payload: CategoryPayload) {
  try {
    const data = (await api("/api/categories", {
      method: "POST",
      body: JSON.stringify({ category: payload }),
      cache: "no-store",
    })) as Category;

    return { status: 201 as const, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const, data: null as Category | null };
    }
    throw err;
  }
}

export async function updateCategory(id: number, payload: CategoryPayload) {
  try {
    const data = (await api(`/api/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ category: payload }),
      cache: "no-store",
    })) as Category;

    return { status: 200 as const, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const, data: null as Category | null };
    }
    throw err;
  }
}

export async function deleteCategory(id: number) {
  try {
    await api(`/api/categories/${id}`, {
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
