export type Goal = {
  id: number;
  user_id: number;
  title: string;
  target_amount: number;
  current_amount: number;
  date: Date;
};

export type New_Goal = {
  title: string;
  target_amount: number;
  current_amount: number;
  date: Date;
};
