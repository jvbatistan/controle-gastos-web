export type Category = {
  id: number;
  name: string;
  icon: string | null;
};

export type CategoryPayload = {
  name: string;
  icon?: string;
};
