import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, tap, throwError } from 'rxjs';
import { Goal, New_Goal } from './goal.model';

@Injectable({
  providedIn: 'root',
})
export class GoalsService {
  private httpClient = inject(HttpClient);
  private data = signal<Goal[]>([]);
  loadedData = this.data.asReadonly();
  constructor() {}

  loadData() {
    return this.httpClient.get<Goal[]>('http://localhost:8080/api/goals').pipe(
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
    const tempGoal = {
      ...goal,
      id: Date.now(),
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
    const updatedGoals = prevGoals.map((goal) =>
      goal.id === goalId ? { ...goal, ...updates } : goal
    );

    this.data.set(updatedGoals);
    return this.httpClient
      .patch(`http://localhost:8080/api/goals/${goalId}`, updates)
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
