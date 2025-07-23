import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { GoalsService } from './goal.service';

@Component({
  selector: 'app-goal',
  imports: [],
  templateUrl: './goal.html',
  styleUrl: './goal.css',
})
export class Goal implements OnInit {
  goalService = inject(GoalsService);
  goals = this.goalService.loadedData;
  destroyRef = inject(DestroyRef);

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
}
