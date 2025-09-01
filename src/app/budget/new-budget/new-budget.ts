import { Component, DestroyRef, inject, output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { BudgetService } from '../budget.service';

@Component({
  selector: 'app-new-budget',
  imports: [FormsModule],
  templateUrl: './new-budget.html',
  styleUrl: './new-budget.css',
})
export class NewBudget {
  close = output();
  budgetsService = inject(BudgetService);
  destroyRef = inject(DestroyRef);
  showCustomCategory = false;

  // Predefined budget categories
  budgetCategories = [
    'Housing', 'Groceries', 'Transportation', 'Utilities', 
    'Entertainment', 'Food & Dining', 'Healthcare', 'Shopping', 
    'Education', 'Travel', 'Insurance', 'Subscriptions', 
    'Savings', 'Emergency Fund', 'Other'
  ];

  closeForm() {
    this.close.emit();
  }

  onCategoryChange(event: any) {
    this.showCustomCategory = event.target.value === 'Other';
  }

  onSubmit(form: NgForm) {
    if (form.form.invalid) {
      return;
    }

    // Use custom category if "Other" is selected
    const category = form.form.value.category === 'Other' 
      ? form.form.value.customCategory 
      : form.form.value.category;

    const subscription = this.budgetsService
      .newBudget({
        category: category,
        amount: form.form.value.amount,
      })
      .subscribe({
        complete: () => this.closeForm(),
      });
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
}
