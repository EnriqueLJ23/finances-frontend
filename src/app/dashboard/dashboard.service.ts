import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, forkJoin, map, tap, throwError } from 'rxjs';
import {
  DashboardSummary,
  ExpenseCategory,
  CashflowData,
  Transaction,
  Goal,
} from './dashboard.models';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private httpClient = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api/dashboard';

  dashboardSummary = signal<DashboardSummary | null>(null);
  expenseCategories = signal<ExpenseCategory[]>([]);
  cashflowData = signal<CashflowData[]>([]);
  recentTransactions = signal<Transaction[]>([]);
  goals = signal<Goal[]>([]);

  constructor() {}

  loadAllDashboardData() {
    return forkJoin({
      summary: this.getDashboardSummary(),
      expenseCategories: this.getExpenseCategories(),
      cashflow: this.getCashflowData(),
      transactions: this.getRecentTransactions(),
      goals: this.getGoals(),
    }).pipe(
      tap((data) => {
        this.dashboardSummary.set(data.summary);
        this.expenseCategories.set(data.expenseCategories);
        this.cashflowData.set(data.cashflow);
        this.recentTransactions.set(data.transactions);
        this.goals.set(data.goals);
      }),
      catchError((error) => {
        console.error('Error loading dashboard data:', error);
        return throwError(() => new Error('Failed to load dashboard data'));
      })
    );
  }

  getDashboardSummary() {
    return this.httpClient.get<DashboardSummary>(`${this.baseUrl}/summary`);
  }

  getExpenseCategories() {
    return this.httpClient.get<ExpenseCategory[]>(
      `${this.baseUrl}/expense-categories`
    );
  }

  getCashflowData(months: number = 6) {
    return this.httpClient.get<CashflowData[]>(
      `${this.baseUrl}/cashflow?months=${months}`
    );
  }

  getRecentTransactions() {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    return this.httpClient
      .get<Transaction[]>('http://localhost:8080/api/transactions')
      .pipe(
        map((transactions) =>
          transactions
            .filter((t) => {
              const transactionDate = new Date(t.date);
              return (
                transactionDate.getMonth() + 1 === currentMonth &&
                transactionDate.getFullYear() === currentYear
              );
            })
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .slice(0, 5)
        )
      );
  }

  getGoals() {
    return this.httpClient.get<Goal[]>('http://localhost:8080/api/goals').pipe(
      map((goals) => goals.slice(0, 3)) // Show only top 3 goals on dashboard
    );
  }
}
