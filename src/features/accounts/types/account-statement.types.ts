import type { AccountKind } from "@/features/accounts/types/account.types";

export type StatementDirection = "credit" | "debit";

export type StatementMovementType =
  | "initial_balance"
  | "income"
  | "expense"
  | "card_statement_payment"
  | "transfer_in"
  | "transfer_out";

export type StatementEntryMetadata = {
  category?: { id: number; name: string } | null;
  source?: string | null;
  responsible?: string | null;
  card?: { id: number; name: string } | null;
  billing_statement?: string | null;
  counterparty_account?: { id: number; name: string } | null;
  note?: string | null;
};

export type StatementEntry = {
  id: string;
  source_type: string;
  source_id: number;
  movement_type: StatementMovementType;
  direction: StatementDirection;
  amount: string;
  occurred_on: string;
  title: string;
  description: string | null;
  status: string;
  metadata: StatementEntryMetadata;
  created_at?: string;
};

export type AccountStatementBalances = {
  opening_balance: string;
  closing_balance: string;
};

export type AccountStatementResponse = {
  account: {
    id: number;
    name: string;
    kind: AccountKind;
    initial_balance?: string;
    initial_balance_date?: string;
    archived_at: string | null;
    current_balance: string;
    created_at?: string;
    updated_at?: string;
  };
  period: {
    start_date: string | null;
    end_date: string | null;
  };
  filters: {
    movement_type: StatementMovementType | null;
    direction: StatementDirection | null;
  };
  summary: {
    credits_total: string;
    debits_total: string;
    net_total: string;
  };
  balances: AccountStatementBalances;
  pagination: {
    page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
  };
  items: StatementEntry[];
};

export type FetchAccountStatementParams = {
  startDate?: string;
  endDate?: string;
  movementType?: StatementMovementType;
  direction?: StatementDirection;
  page?: number;
  perPage?: number;
  signal?: AbortSignal;
};
