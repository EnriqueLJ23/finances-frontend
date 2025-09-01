export type Transaction = {
  id: number;
  user_id: number;
  amount: number;
  type: string;
  category: string;
  description: string;
  date: Date;
};
