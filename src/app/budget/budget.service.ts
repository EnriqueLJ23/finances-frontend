import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, tap, throwError } from 'rxjs';
import { Budget } from './budget.model';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  private httpClient = inject(HttpClient);
  private data = signal<Budget[]>([]);
  private authService = inject(AuthService);
  private user = this.authService.loadedUser;
  loadedData = this.data.asReadonly();
  constructor() {}

  loadData(month?: number, year?: number) {
    let url = `http://localhost:8080/api/budgets`;
    
    // Add query parameters for month/year filtering if provided
    if (month !== undefined && year !== undefined) {
      url += `?month=${month}&year=${year}`;
    }
    
    return this.httpClient
      .get<Budget[]>(url)
      .pipe(
        tap({
          next: (resData) => {
            this.data.set(resData);
          },
        }),
        catchError((error) => {
          console.log(error);
          return throwError(
            () => new Error('somethings wrong i can feel it,', error)
          );
        })
      );
  }

  newBudget(budgetInput: { category: string; amount: number }) {
    const prevBudgets = this.data();
    const currentDate = new Date();

    // Construct the complete budget object for the API
    const budgetToSend: Omit<Budget, 'id' | 'user_id'> = {
      category: budgetInput.category,
      amount: budgetInput.amount,
      used: 0,
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
    };

    const tempBudget: Budget = {
      ...budgetToSend,
      id: Math.random(),
      user_id: 0, // Temporary user_id for optimistic update
    };

    this.data.set([...prevBudgets, tempBudget]);
    return this.httpClient
      .post<Budget>('http://localhost:8080/api/budgets', budgetToSend)
      .pipe(
        tap({
          next: (resData) => {
            this.data.set([...prevBudgets, resData]);
          },
        }),
        catchError((error) => {
          this.data.set(prevBudgets);
          return throwError(
            () => new Error('Failed to create the new budget,', error)
          );
        })
      );
  }

  updateBudget(budgetId: number, budgetInput: { category: string; amount: number }) {
    const prevBudgets = this.data();
    const currentDate = new Date();

    const budgetToSend: Omit<Budget, 'id' | 'user_id'> = {
      category: budgetInput.category,
      amount: budgetInput.amount,
      used: 0,
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
    };

    return this.httpClient
      .put<Budget>(`http://localhost:8080/api/budgets/${budgetId}`, budgetToSend)
      .pipe(
        tap({
          next: (resData) => {
            const updatedBudgets = prevBudgets.map(budget => 
              budget.id === budgetId ? resData : budget
            );
            this.data.set(updatedBudgets);
          },
        }),
        catchError((error) => {
          return throwError(
            () => new Error('Failed to update the budget,', error)
          );
        })
      );
  }

  deleteBudget(budgetId: number) {
    const prevBudgets = this.data();

    return this.httpClient
      .delete(`http://localhost:8080/api/budgets/${budgetId}`)
      .pipe(
        tap({
          next: () => {
            const updatedBudgets = prevBudgets.filter(budget => budget.id !== budgetId);
            this.data.set(updatedBudgets);
          },
        }),
        catchError((error) => {
          return throwError(
            () => new Error('Failed to delete the budget,', error)
          );
        })
      );
  }
}
