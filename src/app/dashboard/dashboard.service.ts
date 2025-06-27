import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, tap, throwError } from 'rxjs';
 
@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private httpClient = inject(HttpClient);
    data = signal<string | null>(null);
  loadedData = this.data.asReadonly();
  constructor() {}

  loadData() {
    return this.httpClient
      .get<string>(
        'http://localhost:8080/api/testing'
      )
      .pipe(
        tap({
          next: (resData) => {
            console.log(resData);
            this.data.set(resData);
          },
        }),
        catchError((error) => {
          console.log(error);
          return throwError(() => new Error('somethings wrong i can feel it'));
        })
      );
  }
 
}
