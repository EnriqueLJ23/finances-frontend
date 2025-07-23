import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, tap, throwError } from 'rxjs';
import { Budget } from './budget.model';

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  private httpClient = inject(HttpClient);
  private data = signal<Budget[] | null>(null);
  loadedData = this.data.asReadonly();
  constructor() {}

  loadData() {
    return this.httpClient
      .get<Budget[]>('http://localhost:8080/api/budgets')
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
}
