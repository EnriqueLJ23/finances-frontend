import { Component, DestroyRef, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Budget } from '../budget.model';
import { BudgetService } from '../budget.service';

@Component({
  selector: 'app-edit-budget',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-budget.html',
  styleUrl: './edit-budget.css'
})
export class EditBudget {
  @Input({ required: true }) budget!: Budget;
  @Output() close = new EventEmitter<void>();
  
  budgetService = inject(BudgetService);
  destroyRef = inject(DestroyRef);
  isSubmitting = signal(false);
  error = signal<string | null>(null);

  form = new FormGroup({
    category: new FormControl('', {
      validators: [Validators.required]
    }),
    amount: new FormControl(0, {
      validators: [Validators.required, Validators.min(0.01)]
    })
  });

  ngOnInit() {
    this.form.patchValue({
      category: this.budget.category,
      amount: this.budget.amount
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    const formData = {
      category: this.form.value.category!,
      amount: this.form.value.amount!
    };

    const subscription = this.budgetService.updateBudget(this.budget.id, formData).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.close.emit();
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.error.set('Failed to update budget. Please try again.');
        console.error('Update budget error:', error);
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
