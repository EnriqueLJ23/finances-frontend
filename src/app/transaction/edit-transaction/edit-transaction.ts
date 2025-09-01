import { Component, DestroyRef, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Transaction } from '../transactions/transaction.model';
import { TransactionsService } from '../transactions.service';

@Component({
  selector: 'app-edit-transaction',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-transaction.html',
  styleUrl: './edit-transaction.css'
})
export class EditTransaction {
  @Input({ required: true }) transaction!: Transaction;
  @Output() close = new EventEmitter<void>();
  
  transactionsService = inject(TransactionsService);
  destroyRef = inject(DestroyRef);
  isSubmitting = signal(false);
  error = signal<string | null>(null);

  form = new FormGroup({
    type: new FormControl('', {
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
    date: new FormControl('', {
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

  ngOnInit() {
    // Convert date to YYYY-MM-DD format for date input
    const dateStr = new Date(this.transaction.date).toISOString().split('T')[0];
    
    this.form.patchValue({
      type: this.transaction.type,
      amount: this.transaction.amount,
      category: this.transaction.category,
      description: this.transaction.description,
      date: dateStr
    });
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

    const subscription = this.transactionsService.updateTransaction(this.transaction.id, formData).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.close.emit();
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.error.set('Failed to update transaction. Please try again.');
        console.error('Update transaction error:', error);
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