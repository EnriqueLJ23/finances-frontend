import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, tap, throwError } from 'rxjs';
import { User } from './user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private httpClient = inject(HttpClient);
  user = signal<User | null>(null);
  loadedUser = this.user.asReadonly();
  constructor() {}

  login(user: { username: string; password: string }) {
    return this.httpClient
      .post<{ username: string; token: string }>(
        'http://localhost:8080/auth/login',
        user
      )
      .pipe(
        tap({
          next: (resData) => {
            const user = {
              username: resData.username,
              token: resData.token,
            };
            this.user.set(user);
          },
        }),
        catchError((error) => {
          console.log(error);
          return throwError(() => new Error('somethings wrong i can feel it'));
        })
      );
  }

  register(user: { username: string; password: string }) {
    return this.httpClient
      .post<{ token: string }>('http://localhost:8080/auth/register', user)
      .pipe(
        map((resData) => resData.token),
        catchError((error) => {
          console.log(error);
          return throwError(() => new Error('somethings wrong i can feel it'));
        })
      );
  }
}
