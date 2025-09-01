import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { BudgetService } from './budget.service';
import { NewBudget } from './new-budget/new-budget';
import { EditBudget } from './edit-budget/edit-budget';
import { DeleteDialog } from './delete-dialog/delete-dialog';
import { Budget as BudgetModel } from './budget.model';

@Component({
  selector: 'app-budget',
  imports: [NewBudget, EditBudget, DeleteDialog],
  templateUrl: './budget.html',
  styleUrl: './budget.css',
})
export class Budget {
  budgetService = inject(BudgetService);
  budgets = this.budgetService.loadedData;
  destroyRef = inject(DestroyRef);
  isOpen = signal(false);
  editingBudget = signal<BudgetModel | null>(null);
  deletingBudget = signal<BudgetModel | null>(null);
  currentMonth = signal(new Date().getMonth() + 1);
  currentYear = signal(new Date().getFullYear());

  // Computed properties for summary cards
  totalBudget = computed(() => {
    return this.budgets().reduce((sum, budget) => sum + budget.amount, 0);
  });

  totalSpent = computed(() => {
    return this.budgets().reduce((sum, budget) => sum + budget.used, 0);
  });

  remainingBalance = computed(() => {
    return this.totalBudget() - this.totalSpent();
  });

  budgetUsedPercentage = computed(() => {
    const total = this.totalBudget();
    return total > 0 ? Math.round((this.totalSpent() / total) * 100) : 0;
  });

  ngOnInit(): void {
    // Load data filtered by current month and year
    const subscription = this.budgetService.loadData(this.currentMonth(), this.currentYear()).subscribe({
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

  openForm() {
    this.isOpen.set(true);
  }

  closeForm() {
    this.isOpen.set(false);
  }

  editBudget(budget: BudgetModel) {
    this.editingBudget.set(budget);
  }

  closeEditForm() {
    this.editingBudget.set(null);
  }

  deleteBudget(budget: BudgetModel) {
    this.deletingBudget.set(budget);
  }

  closeDeleteDialog() {
    this.deletingBudget.set(null);
  }

  previousMonth() {
    if (this.currentMonth() === 1) {
      this.currentMonth.set(12);
      this.currentYear.set(this.currentYear() - 1);
    } else {
      this.currentMonth.set(this.currentMonth() - 1);
    }
    this.loadBudgetsForCurrentPeriod();
  }

  nextMonth() {
    if (this.currentMonth() === 12) {
      this.currentMonth.set(1);
      this.currentYear.set(this.currentYear() + 1);
    } else {
      this.currentMonth.set(this.currentMonth() + 1);
    }
    this.loadBudgetsForCurrentPeriod();
  }

  private loadBudgetsForCurrentPeriod() {
    const subscription = this.budgetService.loadData(this.currentMonth(), this.currentYear()).subscribe({
      error: (error) => {
        console.error('Failed to load budgets:', error);
      }
    });
    
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  }

  getBudgetUsedPercentage(budget: BudgetModel): number {
    return budget.amount > 0 ? Math.round((budget.used / budget.amount) * 100) : 0;
  }
}
