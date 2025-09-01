import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, tap, throwError } from 'rxjs';
import { Goal, New_Goal } from './goal.model';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class GoalsService {
  private httpClient = inject(HttpClient);
  private authService = inject(AuthService);
  private user = this.authService.loadedUser;
  private data = signal<Goal[]>([]);
  loadedData = this.data.asReadonly();
  constructor() {}

  loadData(month?: number, year?: number) {
    let url = `http://localhost:8080/api/goals`;
    
    // Add query parameters for month/year filtering if provided
    if (month !== undefined && year !== undefined) {
      url += `?month=${month}&year=${year}`;
    }
    
    return this.httpClient
      .get<Goal[]>(url)
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

  newGoal(goal: New_Goal) {
    const prevGoals = this.data();
    const tempGoal: Goal = {
      ...goal,
      id: Date.now(),
      user_id: 0, // Temporary user_id for optimistic update
    };

    this.data.set([...prevGoals, tempGoal]);
    return this.httpClient
      .post<Goal>('http://localhost:8080/api/goals', goal)
      .pipe(
        tap({
          next: (resData) => {
            this.data.set([...prevGoals, resData]);
          },
        }),
        catchError((error) => {
          this.data.set(prevGoals);
          return throwError(
            () => new Error('Failed to create the new goal,', error)
          );
        })
      );
  }

  editGoal(goalId: number, updates: Partial<Goal>) {
    const prevGoals = this.data();

    const goalToUpdate = prevGoals.find((goal) => goal.id === goalId);

    if (!goalToUpdate) {
      return throwError(() => new Error('Goal not found'));
    }

    const newCurrentAmount =
      goalToUpdate.current_amount + updates.current_amount!;

    const updatedGoals = prevGoals.map((goal) =>
      goal.id === goalId
        ? {
            ...goal,
            current_amount: newCurrentAmount,
          }
        : goal
    );

    this.data.set(updatedGoals);

    // Send the total amount to the server
    const patchData = {
      current_amount: newCurrentAmount,
    };
    this.data.set(updatedGoals);
    return this.httpClient
      .patch(`http://localhost:8080/api/goals/${goalId}`, patchData)
      .pipe(
        catchError((error) => {
          this.data.set(prevGoals);
          return throwError(
            () => new Error('Failed to edit the current amount', error)
          );
        })
      );
  }

  deleteGoal(goalId: number) {
    const prevGoals = this.data();
    return this.httpClient
      .delete(`http://localhost:8080/api/goals/${goalId}`)
      .pipe(
        tap(() => {
          this.data.set(prevGoals.filter((goal) => goal.id !== goalId));
        }),
        catchError((error) => {
          return throwError(() => new Error('Failed to delete goal', error));
        })
      );
  }
}
