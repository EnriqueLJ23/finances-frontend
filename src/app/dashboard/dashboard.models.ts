export interface DashboardSummary {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  budgetUtilization: number;
}

export interface ExpenseCategory {
  category: string;
  amount: number;
}

export interface CashflowData {
  month: string;
  year: number;
  income: number;
  expenses: number;
}

export interface Transaction {
  id: number;
  user_id: string;
  amount: number;
  type: string;
  category: string;
  description: string;
  date: string;
}

export interface Goal {
  id: number;
  user_id: number;
  title: string;
  target_amount: number;
  current_amount: number;
  date: string;
}