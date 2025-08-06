import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { GoalsService } from '../goal.service';

@Component({
  selector: 'app-delete-dialog',
  imports: [],
  templateUrl: './delete-dialog.html',
  styleUrl: './delete-dialog.css',
})
export class DeleteDialog {
  close = output();
  goalId = input.required<number>();
  goalsService = inject(GoalsService);
  destroyRef = inject(DestroyRef);
  closeForm() {
    this.close.emit();
  }

  onSubmit() {
    const subscription = this.goalsService.deleteGoal(this.goalId()).subscribe({
      complete: () => this.closeForm(),
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
}
