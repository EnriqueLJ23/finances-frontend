import { Component, input, output, signal } from '@angular/core';
import { Goal as GoalI } from '../goal.model';
import { Contribute } from '../contribute/contribute';
import { DeleteDialog } from '../delete-dialog/delete-dialog';

@Component({
  selector: 'app-goal',
  imports: [Contribute, DeleteDialog],
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
}
