import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { GoalsService } from '../goal.service';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-contribute',
  imports: [FormsModule],
  templateUrl: './contribute.html',
  styleUrl: './contribute.css',
})
export class Contribute {
  close = output();
  goalsService = inject(GoalsService);
  destroyRef = inject(DestroyRef);
  goalId = input.required<number>();

  closeForm() {
    this.close.emit();
  }

  onSubmit(form: NgForm) {
    if (form.form.invalid) {
      return;
    }

    const new_current_amount = {
      current_amount: form.form.value.contribution,
    };

    const subscription = this.goalsService
      .editGoal(this.goalId(), new_current_amount)
      .subscribe({
        next: (response) => {
          console.log(response);
        },
      });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
}
