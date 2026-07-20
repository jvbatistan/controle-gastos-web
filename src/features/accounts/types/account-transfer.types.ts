export type AccountTransferStatus = "completed" | "reversed";

export type AccountTransferAccount = {
  id: number;
  name: string;
};

export type AccountTransfer = {
  id: number;
  from_account: AccountTransferAccount;
  to_account: AccountTransferAccount;
  amount: string;
  transferred_on: string;
  description: string | null;
  note: string | null;
  status: AccountTransferStatus;
  created_at: string;
  updated_at: string;
};

export type CreateAccountTransferPayload = {
  from_account_id: number;
  to_account_id: number;
  amount: string;
  transferred_on: string;
  description?: string;
  note?: string;
};
