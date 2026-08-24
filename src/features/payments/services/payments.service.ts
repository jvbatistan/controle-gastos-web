import type { LooseExpenseTransaction, PaymentsOverview, PaymentStatement } from "@/features/payments/types/payment.types";
import { api } from "@/lib/api";

function toQuery(month: number, year: number) {
  const qs = new URLSearchParams({ month: String(month), year: String(year) });
  return qs.toString();
}

export async function fetchPayments(month: number, year: number, signal?: AbortSignal) {
  try {
    const data = (await api(`/api/payments?${toQuery(month, year)}`, {
      cache: "no-store",
      signal,
    })) as PaymentsOverview;

    return { status: 200 as const, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const, data: null as PaymentsOverview | null };
    }
    throw err;
  }
}

type PayCardStatementPayload = {
  amount?: number;
  accountId: number;
};

export async function payCardStatement(statementId: number, payload: PayCardStatementPayload) {
  try {
    const data = (await api(`/api/payments/card_statements/${statementId}/pay`, {
      method: "POST",
      body: JSON.stringify({
        ...(payload.amount ? { amount: payload.amount } : {}),
        account_id: payload.accountId,
      }),
      cache: "no-store",
    })) as PaymentStatement;

    return { status: 200 as const, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const, data: null as PaymentStatement | null };
    }
    throw err;
  }
}

export async function payLooseExpenses(month: number, year: number, accountId: number, settledOn: string) {
  try {
    const data = (await api("/api/payments/loose_expenses/pay", {
      method: "POST",
      body: JSON.stringify({ month, year, account_id: accountId, settled_on: settledOn }),
      cache: "no-store",
    })) as { paid_transactions_count: number; total_amount: number };

    return { status: 200 as const, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const, data: null as { paid_transactions_count: number; total_amount: number } | null };
    }
    throw err;
  }
}

export async function payLooseExpense(transactionId: number, month: number, year: number, accountId: number, settledOn: string, settledValue: number) {
  try {
    const data = (await api(`/api/payments/loose_expenses/${transactionId}/pay`, {
      method: "POST",
      body: JSON.stringify({ month, year, account_id: accountId, settled_on: settledOn, settled_value: settledValue }),
      cache: "no-store",
    })) as LooseExpenseTransaction;

    return { status: 200 as const, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const, data: null as LooseExpenseTransaction | null };
    }
    throw err;
  }
}

export async function ignoreLooseExpense(transactionId: number, month: number, year: number) {
  try {
    const data = (await api(`/api/payments/loose_expenses/${transactionId}/ignore`, {
      method: "POST",
      body: JSON.stringify({ month, year }),
      cache: "no-store",
    })) as LooseExpenseTransaction;

    return { status: 200 as const, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const, data: null as LooseExpenseTransaction | null };
    }
    throw err;
  }
}

export async function ignoreCardStatement(statementId: number, month: number, year: number) {
  try {
    const data = (await api(`/api/payments/card_statements/${statementId}/ignore`, {
      method: "POST",
      body: JSON.stringify({ month, year }),
      cache: "no-store",
    })) as PaymentStatement;

    return { status: 200 as const, data };
  } catch (err) {
    if (err instanceof Error && err.message.includes("401")) {
      return { status: 401 as const, data: null as PaymentStatement | null };
    }
    throw err;
  }
}
