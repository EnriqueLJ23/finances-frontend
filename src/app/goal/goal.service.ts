import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, tap, throwError } from 'rxjs';
import { Goal, New_Goal } from './goal.model';

@Injectable({
  providedIn: 'root',
})
export class GoalsService {
  private httpClient = inject(HttpClient);
  private data = signal<Goal[] | null>(null);
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
    return this.httpClient.post('http://localhost:8080/api/goals', goal);
  }

  editGoal(goalId: number, updates: Partial<Goal>) {
    return this.httpClient.patch(
      `http://localhost:8080/api/goals/${goalId}`,
      updates
    );
  }

  deleteGoal(goalId: number) {
    return this.httpClient.delete(`http://localhost:8080/api/goals/${goalId}`);
  }
}
