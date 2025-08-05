import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { GoalsService } from './goal.service';
import { NewGoal } from './new-goal/new-goal';
import { Goal } from './goal/goal';

@Component({
  selector: 'app-goals',
  imports: [NewGoal, Goal],
  templateUrl: './goals.html',
  styleUrl: './goals.css',
})
export class Goals implements OnInit {
  goalService = inject(GoalsService);
  goals = this.goalService.loadedData;
  destroyRef = inject(DestroyRef);
  isOpen = signal(false);

  ngOnInit(): void {
    const subscription = this.goalService.loadData().subscribe({
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
}
