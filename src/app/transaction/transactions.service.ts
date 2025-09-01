import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, tap, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Transaction } from './transactions/transaction.model';

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  private httpClient = inject(HttpClient);
  private data = signal<Transaction[]>([]);
  private authService = inject(AuthService);
  private user = this.authService.loadedUser;
  loadedData = this.data.asReadonly();
  constructor() {}

  loadData() {
    return this.httpClient
      .get<Transaction[]>('http://localhost:8080/api/transactions')
      .pipe(
        tap({
          next: (resData) => {
            this.data.set(resData);
          },
        }),
        catchError((error) => {
          console.log(error);
          return throwError(
            () => new Error('somethings wrong i can feel it,', error)
          );
        })
      );
  }

  addTransaction(transactionInput: { 
    amount: number; 
    type: string; 
    category: string; 
    description: string; 
    date: string; 
  }) {
    const prevTransactions = this.data();

    // Construct the complete transaction object for the API
    const transactionToSend: Omit<Transaction, 'id' | 'user_id'> = {
      amount: transactionInput.amount,
      type: transactionInput.type,
      category: transactionInput.category,
      description: transactionInput.description,
      date: new Date(transactionInput.date),
    };

    const tempTransaction: Transaction = {
      ...transactionToSend,
      id: Math.random(),
      user_id: 0, // Temporary user_id for optimistic update
    };

    this.data.set([...prevTransactions, tempTransaction]);
    return this.httpClient
      .post<Transaction>('http://localhost:8080/api/transactions', transactionToSend)
      .pipe(
        tap({
          next: (resData) => {
            this.data.set([...prevTransactions, resData]);
          },
        }),
        catchError((error) => {
          this.data.set(prevTransactions);
          return throwError(
            () => new Error('Failed to create the new transaction,', error)
          );
        })
      );
  }

  updateTransaction(transactionId: number, transactionInput: { 
    amount: number; 
    type: string; 
    category: string; 
    description: string; 
    date: string; 
  }) {
    const prevTransactions = this.data();

    const transactionToSend: Omit<Transaction, 'id' | 'user_id'> = {
      amount: transactionInput.amount,
      type: transactionInput.type,
      category: transactionInput.category,
      description: transactionInput.description,
      date: new Date(transactionInput.date),
    };

    return this.httpClient
      .put<Transaction>(`http://localhost:8080/api/transactions/${transactionId}`, transactionToSend)
      .pipe(
        tap({
          next: (resData) => {
            const updatedTransactions = prevTransactions.map(transaction => 
              transaction.id === transactionId ? resData : transaction
            );
            this.data.set(updatedTransactions);
          },
        }),
        catchError((error) => {
          return throwError(
            () => new Error('Failed to update the transaction,', error)
          );
        })
      );
  }

  deleteTransaction(transactionId: number) {
    const prevTransactions = this.data();

    return this.httpClient
      .delete(`http://localhost:8080/api/transactions/${transactionId}`)
      .pipe(
        tap({
          next: () => {
            const updatedTransactions = prevTransactions.filter(transaction => transaction.id !== transactionId);
            this.data.set(updatedTransactions);
          },
        }),
        catchError((error) => {
          return throwError(
            () => new Error('Failed to delete the transaction,', error)
          );
        })
      );
  }
}
