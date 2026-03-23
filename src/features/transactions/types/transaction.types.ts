export type TransactionCategory = {
  id: number;
  name: string;
};

export type TransactionSuggestion = {
  id: number;
  confidence: number;
  source: "alias" | "rule";
  suggested_category?: TransactionCategory | null;
};

export type TransactionClassificationStatus = "classified" | "suggestion_pending" | "unclassified";

export type TransactionClassification = {
  status: TransactionClassificationStatus;
  category?: TransactionCategory | null;
  suggestion?: TransactionSuggestion | null;
};

export type Transaction = {
  id: number;
  description: string;
  value: number;
  date: string;
  kind: "income" | "expense";
  source?: "card" | "cash" | "bank";
  paid: boolean;
  note?: string | null;
  category?: TransactionCategory | null;
  card?: { id: number; name: string } | null;
  installment_group_id?: string | null;
  installment_number?: number | null;
  installments_count?: number | null;
  classification?: TransactionClassification | null;
};

export type TransactionFilters = {
  cardId: "all" | "none" | string;
  month: "all" | string;
  year: "all" | string;
  limit: "50" | "100" | "200";
};

export type TransactionPayload = {
  description: string;
  value: number;
  date: string;
  kind: "income" | "expense";
  source: "card" | "cash" | "bank";
  paid: boolean;
  note?: string;
  responsible?: string;
  category_id?: number | null;
  card_id?: number | null;
  billing_statement?: string | null;
  installment_number?: number | null;
  installments_count?: number | null;
};

export type CreateTransactionResponse =
  | { kind: "single"; transaction: Transaction }
  | { kind: "installment_group"; installment_group_id: string; transactions: Transaction[] };

export const defaultTransactionFilters: TransactionFilters = {
  cardId: "all",
  month: "all",
  year: "all",
  limit: "50",
};
