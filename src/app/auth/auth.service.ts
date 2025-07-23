import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, tap, throwError } from 'rxjs';
import { User } from './user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private httpClient = inject(HttpClient);
  user = signal<User | null>(null);
  loadedUser = this.user.asReadonly();
  router = inject(Router);
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

            localStorage.setItem('userData', JSON.stringify(user));
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

  autoLogin() {
    const userData = localStorage.getItem('userData');

    if (!userData) {
      return;
    }
    const userInfo = JSON.parse(userData);
    this.user.set(userInfo);
  }

  logout() {
    this.user.set(null);
    localStorage.removeItem('userData');
    this.router.navigate(['/auth']);
  }
}
