import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from './auth.service';
import { LoadingSpinner } from '../shared/loading-spinner/loading-spinner';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  imports: [FormsModule, LoadingSpinner],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  authService = inject(AuthService);
  destroyRef = inject(DestroyRef);
  router = inject(Router);

  mode = signal<'signin' | 'signup'>('signin');
  isLoading = signal(false);
  error = signal<string>('');

  switchMode(theMode: 'signup' | 'signin') {
    this.mode.set(theMode);
    console.log(this.mode());
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }

    const user = {
      username: form.value.username,
      password: form.value.password,
    };
    this.isLoading.set(true);
    if (this.mode() === 'signin') {
      const subscription = this.authService.login(user).subscribe({
        complete: () => {
          this.isLoading.set(false);
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.error.set('an error ocurred');
          this.isLoading.set(false);
        },
      });
      this.destroyRef.onDestroy(() => {
        subscription.unsubscribe();
      });
    } else {
      const subscription = this.authService.register(user).subscribe({
        next: (value) => console.log(value),
      });
      this.destroyRef.onDestroy(() => {
        subscription.unsubscribe();
      });
    }
  }
}
