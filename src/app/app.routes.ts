import { CanMatchFn, RedirectCommand, Router, Routes } from '@angular/router';
import { Auth } from './auth/auth';
import { Dashboard } from './dashboard/dashboard';
import { inject } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { NotFound } from './not-found/not-found';
import { Goal } from './goal/goal';
import { Budget } from './budget/budget';

const authGuard: CanMatchFn = (route, segments) => {
  const authService = inject(AuthService);
  const user = authService.loadedUser();
  const router = inject(Router);

  if (user) {
    return true;
  }
  return new RedirectCommand(router.parseUrl('/unauthorized'));
};

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    component: Auth,
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canMatch: [authGuard],
  },
  {
    path: 'goals',
    component: Goal,
    canMatch: [authGuard],
  },
  {
    path: 'budgets',
    component: Budget,
    canMatch: [authGuard],
  },
  {
    path: '**',
    component: NotFound,
  },
];
