import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { TransactionsService } from '../transactions.service';

@Component({
  selector: 'app-delete-dialog',
  imports: [],
  templateUrl: './delete-dialog.html',
  styleUrl: './delete-dialog.css',
})
export class DeleteDialog {
  close = output();
  transactionId = input.required<number>();
  transactionDescription = input.required<string>();
  transactionsService = inject(TransactionsService);
  destroyRef = inject(DestroyRef);
  
  closeForm() {
    this.close.emit();
  }

  onSubmit() {
    const subscription = this.transactionsService.deleteTransaction(this.transactionId()).subscribe({
      complete: () => this.closeForm(),
      error: (error) => {
        console.error('Delete transaction error:', error);
        // Could add error handling here if needed
      }
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
}