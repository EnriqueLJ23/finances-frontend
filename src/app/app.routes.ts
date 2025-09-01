import { CanMatchFn, RedirectCommand, Router, Routes } from '@angular/router';
import { Auth } from './auth/auth';
import { Dashboard } from './dashboard/dashboard';
import { inject } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { NotFound } from './not-found/not-found';
import { Goals } from './goal/goals';
import { Budget } from './budget/budget';
import { Transactions } from './transaction/transactions/transactions';

const authGuard: CanMatchFn = (route, segments) => {
  const authService = inject(AuthService);
  const user = authService.loadedUser();
  const router = inject(Router);

  if (user) {
    return true;
  }
  return new RedirectCommand(router.parseUrl('/auth'));
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
    component: Goals,
    canMatch: [authGuard],
  },
  {
    path: 'budgets',
    component: Budget,
    canMatch: [authGuard],
  },
  {
    path: 'transactions',
    component: Transactions,
    canMatch: [authGuard],
  },
  {
    path: '**',
    component: NotFound,
  },
];
