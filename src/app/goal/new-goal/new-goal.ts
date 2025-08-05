import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { GoalsService } from '../goal.service';
import { AuthService } from '../../auth/auth.service';
import { New_Goal } from '../goal.model';

@Component({
  selector: 'app-new-goal',
  imports: [FormsModule],
  templateUrl: './new-goal.html',
  styleUrl: './new-goal.css',
})
export class NewGoal {
  close = output();
  authService = inject(AuthService);
  user = this.authService.loadedUser;
  goalsService = inject(GoalsService);
  destroyRef = inject(DestroyRef);

  closeForm() {
    this.close.emit();
  }

  onSubmit(form: NgForm) {
    if (form.form.invalid) {
      return;
    }

    const new_goal: New_Goal = {
      user_id: this.user()!.id,
      title: form.form.value.title,
      current_amount: form.form.value.current,
      target_amount: form.form.value.amount,
      date: form.form.value.date,
    };

    const subscription = this.goalsService.newGoal(new_goal).subscribe({
      next: (resData) => console.log(resData),
      complete: () => {
        form.form.reset();
        this.closeForm();
      },
    });
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
}
