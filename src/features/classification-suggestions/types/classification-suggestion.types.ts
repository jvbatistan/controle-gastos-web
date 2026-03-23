import type { Category } from "@/features/categories/types/category.types";

export type ClassificationSuggestionTransaction = {
  id: number;
  description: string;
  date: string;
  value: number;
  kind: "income" | "expense";
  category?: Category | null;
  installment_group_id?: string | null;
  installment_number?: number | null;
  installments_count?: number | null;
  classification_status: "classified" | "suggestion_pending" | "unclassified";
};

export type ClassificationSuggestion = {
  id: number;
  confidence: number;
  source: "alias" | "rule";
  accepted_at?: string | null;
  rejected_at?: string | null;
  suggested_category?: Category | null;
  financial_transaction: ClassificationSuggestionTransaction;
};
