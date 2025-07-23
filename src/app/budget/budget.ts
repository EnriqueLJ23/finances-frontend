import { Component, DestroyRef, inject } from '@angular/core';
import { BudgetService } from './budget.service';

@Component({
  selector: 'app-budget',
  imports: [],
  templateUrl: './budget.html',
  styleUrl: './budget.css',
})
export class Budget {
  budgetService = inject(BudgetService);
  budgets = this.budgetService.loadedData;
  destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    const subscription = this.budgetService.loadData().subscribe({
      error: (error) => {
        console.log('this is the error', error);
      },
      complete: () => {
        console.log('fetching is done');
      },
    });
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
}
