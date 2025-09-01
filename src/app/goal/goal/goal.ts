import { Component, input, output, signal } from '@angular/core';
import { Goal as GoalI } from '../goal.model';
import { Contribute } from '../contribute/contribute';
import { DeleteDialog } from '../delete-dialog/delete-dialog';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-goal',
  imports: [Contribute, DeleteDialog, DatePipe],
  templateUrl: './goal.html',
  styleUrl: './goal.css',
})
export class Goal {
  goal = input.required<GoalI>();
  contribute = signal(false);
  delete = signal(false);

  onContributeClick() {
    this.contribute.set(true);
  }

  onDeleteClick() {
    this.delete.set(true);
  }

  closeFormContribute() {
    this.contribute.set(false);
  }

  closeDelete() {
    this.delete.set(false);
  }

  getProgressPercentage(): number {
    const current = this.goal().current_amount;
    const target = this.goal().target_amount;

    if (target === 0) return 0;

    const percentage = Math.round((current / target) * 100);
    return Math.min(percentage, 100); // Cap at 100%
  }
}
