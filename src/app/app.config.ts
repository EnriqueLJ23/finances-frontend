import {
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withRouterConfig,
} from '@angular/router';

import { routes } from './app.routes';
import {
  HttpHandlerFn,
  HttpRequest,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { AuthService } from './auth/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withRouterConfig({ paramsInheritanceStrategy: 'always' })
    ),
  ],
};

function authInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn) {

  const authService = inject(AuthService);
  const user = authService.user();

   // Skip auth for login/register endpoints
   if (request.url.includes('/login') || request.url.includes('/register')) {
    return next(request);
  }

  if (user && user.token) {
    const req = request.clone({ setHeaders: {
      Authorization: `Bearer ${user.token}`
    }})

    return next(req);
  }
 
  return next(request);
  

}
