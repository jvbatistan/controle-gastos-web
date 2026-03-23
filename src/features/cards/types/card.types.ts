export type Card = {
  id: number;
  name: string;
  due_day: number;
  closing_day: number;
  limit: number | null;
};

export type CardPayload = {
  name: string;
  due_day: number;
  closing_day: number;
  limit?: number;
};
