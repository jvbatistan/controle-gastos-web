export type AccountKind = "checking" | "savings" | "wallet" | "digital_wallet" | "other";

export type Account = {
  id: number;
  name: string;
  kind: AccountKind;
  initial_balance: number | string;
  initial_balance_date: string;
  current_balance: number | string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AccountPayload = {
  name: string;
  kind: AccountKind;
  initial_balance?: number;
  initial_balance_date: string;
};
