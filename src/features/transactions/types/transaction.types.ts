export type Transaction = {
  id: number;
  description: string;
  value: number;
  date: string;
  kind: "income" | "expense";
  paid: boolean;
  note?: string | null;
  category?: { id: number; name: string } | null;
  card?: { id: number; name: string } | null;
  installment_number?: number | null;
  installments_count?: number | null;
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
};

export const defaultTransactionFilters: TransactionFilters = {
  cardId: "all",
  month: "all",
  year: "all",
  limit: "50",
};
