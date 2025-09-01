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
  private tokenExpirationTimer: any;
  user = signal<User | null>(null);
  loadedUser = this.user.asReadonly();
  router = inject(Router);
  constructor() {}

  login(user: { username: string; password: string }) {
    return this.httpClient
      .post<User>('http://localhost:8080/auth/login', user)
      .pipe(
        tap({
          next: (resData) => {
            const user = {
              id: resData.id,
              username: resData.username,
              token: resData.token,
              expiresAt: resData.expiresAt,
            };

            localStorage.setItem('userData', JSON.stringify(user));
            this.user.set(user);
            this.autoLogout(user.expiresAt);
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
    const expirationTime = userInfo.expiresAt;

    if (expirationTime <= new Date().getTime()) {
      this.logout();
      return;
    }

    this.user.set(userInfo);
    this.autoLogout(expirationTime);
  }

  autoLogout(expiresAt: number) {
    const currentTime = new Date().getTime();
    const timeUntilExpiration = expiresAt - currentTime;

    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, timeUntilExpiration);
  }

  logout() {
    this.user.set(null);
    localStorage.removeItem('userData');
    this.router.navigate(['/auth']);

    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    this.tokenExpirationTimer = null;
  }
}
