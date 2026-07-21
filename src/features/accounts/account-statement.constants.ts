import { ArrowDownLeft, ArrowUpRight, CreditCard, Landmark, RefreshCcw } from "lucide-react";
import type { StatementDirection, StatementMovementType } from "@/features/accounts/types/account-statement.types";

export const MOVEMENT_TYPE_LABELS: Record<StatementMovementType, string> = {
  initial_balance: "Saldo inicial",
  income: "Entrada",
  expense: "Saída",
  card_statement_payment: "Pagamento de fatura",
  transfer_in: "Transferência recebida",
  transfer_out: "Transferência enviada",
};

export const DIRECTION_LABELS: Record<StatementDirection, string> = {
  credit: "Entrada",
  debit: "Saída",
};

export const MOVEMENT_TYPE_OPTIONS: Array<{ value: StatementMovementType | ""; label: string }> = [
  { value: "", label: "Todos os tipos" },
  { value: "initial_balance", label: MOVEMENT_TYPE_LABELS.initial_balance },
  { value: "income", label: MOVEMENT_TYPE_LABELS.income },
  { value: "expense", label: MOVEMENT_TYPE_LABELS.expense },
  { value: "card_statement_payment", label: MOVEMENT_TYPE_LABELS.card_statement_payment },
  { value: "transfer_in", label: MOVEMENT_TYPE_LABELS.transfer_in },
  { value: "transfer_out", label: MOVEMENT_TYPE_LABELS.transfer_out },
];

export const DIRECTION_OPTIONS: Array<{ value: StatementDirection | ""; label: string }> = [
  { value: "", label: "Todas" },
  { value: "credit", label: "Entradas" },
  { value: "debit", label: "Saídas" },
];

export const MOVEMENT_TYPE_ICONS = {
  initial_balance: Landmark,
  income: ArrowDownLeft,
  expense: ArrowUpRight,
  card_statement_payment: CreditCard,
  transfer_in: RefreshCcw,
  transfer_out: RefreshCcw,
} as const;
