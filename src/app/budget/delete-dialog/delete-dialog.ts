import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { BudgetService } from '../budget.service';

@Component({
  selector: 'app-delete-dialog',
  imports: [],
  templateUrl: './delete-dialog.html',
  styleUrl: './delete-dialog.css',
})
export class DeleteDialog {
  close = output();
  budgetId = input.required<number>();
  budgetName = input.required<string>();
  budgetService = inject(BudgetService);
  destroyRef = inject(DestroyRef);
  
  closeForm() {
    this.close.emit();
  }

  onSubmit() {
    const subscription = this.budgetService.deleteBudget(this.budgetId()).subscribe({
      complete: () => this.closeForm(),
      error: (error) => {
        console.error('Delete budget error:', error);
        // Could add error handling here if needed
      }
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
}