import { Component, DestroyRef, EventEmitter, inject, Output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransactionsService } from '../transactions.service';

@Component({
  selector: 'app-new-transaction',
  imports: [ReactiveFormsModule],
  templateUrl: './new-transaction.html',
  styleUrl: './new-transaction.css'
})
export class NewTransaction {
  @Output() close = new EventEmitter<void>();
  
  transactionsService = inject(TransactionsService);
  destroyRef = inject(DestroyRef);
  isSubmitting = signal(false);
  error = signal<string | null>(null);

  form = new FormGroup({
    type: new FormControl('Expense', {
      validators: [Validators.required]
    }),
    amount: new FormControl(0, {
      validators: [Validators.required, Validators.min(0.01)]
    }),
    category: new FormControl('', {
      validators: [Validators.required]
    }),
    description: new FormControl('', {
      validators: [Validators.required]
    }),
    date: new FormControl(new Date().toISOString().split('T')[0], {
      validators: [Validators.required]
    })
  });

  // Category options based on transaction type
  expenseCategories = [
    'Housing', 'Groceries', 'Transportation', 'Utilities', 
    'Entertainment', 'Food & Dining', 'Healthcare', 'Shopping', 
    'Education', 'Travel', 'Insurance', 'Other'
  ];

  incomeCategories = [
    'Salary', 'Freelance', 'Investment', 'Business', 'Bonus', 'Other'
  ];

  get availableCategories() {
    return this.form.value.type === 'Income' ? this.incomeCategories : this.expenseCategories;
  }

  onTypeChange() {
    // Reset category when type changes
    this.form.patchValue({ category: '' });
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    const formData = {
      type: this.form.value.type!,
      amount: this.form.value.amount!,
      category: this.form.value.category!,
      description: this.form.value.description!,
      date: this.form.value.date!
    };

    const subscription = this.transactionsService.addTransaction(formData).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.close.emit();
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.error.set('Failed to create transaction. Please try again.');
        console.error('Create transaction error:', error);
      }
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  onCancel() {
    this.close.emit();
  }
}