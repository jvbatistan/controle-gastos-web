export type PaymentStatement = {
  id: number;
  card: {
    id: number;
    name: string;
  };
  billing_statement: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  paid: boolean;
  paid_at?: string | null;
  due_day: number;
  closing_day: number;
  transactions_count: number;
};

export type LooseExpenseTransaction = {
  id: number;
  description: string;
  value: number;
  date: string;
  source: "card" | "cash" | "bank";
  category_id?: number | null;
  paid: boolean;
};

export type PaymentsOverview = {
  period: {
    month: number;
    year: number;
  };
  statements: PaymentStatement[];
  loose_expenses: {
    period_label: string;
    transactions_count: number;
    total_amount: number;
    paid: boolean;
    transactions: LooseExpenseTransaction[];
  };
};
