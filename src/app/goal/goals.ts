import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { GoalsService } from './goal.service';
import { NewGoal } from './new-goal/new-goal';
import { Goal } from './goal/goal';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-goals',
  imports: [NewGoal, Goal, CurrencyPipe],
  templateUrl: './goals.html',
  styleUrl: './goals.css',
})
export class Goals implements OnInit {
  goalService = inject(GoalsService);
  goals = this.goalService.loadedData;
  destroyRef = inject(DestroyRef);
  isOpen = signal(false);
  currentMonth = signal(new Date().getMonth() + 1);
  currentYear = signal(new Date().getFullYear());

  totalAmount = computed(() =>
    this.goals().reduce((sum, item) => sum + item.current_amount, 0)
  );

  totalTarget = computed(() =>
    this.goals().reduce((sum, item) => sum + item.target_amount, 0)
  );

  ngOnInit(): void {
    // Load data filtered by current month and year
    const subscription = this.goalService.loadData(this.currentMonth(), this.currentYear()).subscribe({
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

  previousMonth() {
    if (this.currentMonth() === 1) {
      this.currentMonth.set(12);
      this.currentYear.set(this.currentYear() - 1);
    } else {
      this.currentMonth.set(this.currentMonth() - 1);
    }
    this.loadGoalsForCurrentPeriod();
  }

  nextMonth() {
    if (this.currentMonth() === 12) {
      this.currentMonth.set(1);
      this.currentYear.set(this.currentYear() + 1);
    } else {
      this.currentMonth.set(this.currentMonth() + 1);
    }
    this.loadGoalsForCurrentPeriod();
  }

  private loadGoalsForCurrentPeriod() {
    const subscription = this.goalService.loadData(this.currentMonth(), this.currentYear()).subscribe({
      error: (error) => {
        console.error('Failed to load goals:', error);
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
}
