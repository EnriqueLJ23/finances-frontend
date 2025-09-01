import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { TransactionsService } from '../transactions.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { NewTransaction } from '../new-transaction/new-transaction';
import { EditTransaction } from '../edit-transaction/edit-transaction';
import { DeleteDialog } from '../delete-dialog/delete-dialog';
import { Transaction } from './transaction.model';

@Component({
  selector: 'app-transactions',
  imports: [DatePipe, CurrencyPipe, NewTransaction, EditTransaction, DeleteDialog],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions implements OnInit {
  transactionsService = inject(TransactionsService);
  destroyRef = inject(DestroyRef);
  allTransactions = this.transactionsService.loadedData;

  // Dialog states
  isNewTransactionOpen = signal(false);
  editingTransaction = signal<Transaction | null>(null);
  deletingTransaction = signal<Transaction | null>(null);

  // Helper method to get current month in YYYY-MM-DD format
  private getCurrentMonthFirstDay(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  }

  // Filter states
  typeFilter = signal<string>('');
  categoryFilter = signal<string>('');
  dateFilter = signal<string>(this.getCurrentMonthFirstDay());

  // Filtered transactions
  transactions = computed(() => {
    let filtered = this.allTransactions();

    // Type filter
    if (this.typeFilter()) {
      filtered = filtered.filter(t => t.type.toLowerCase() === this.typeFilter().toLowerCase());
    }

    // Category filter
    if (this.categoryFilter()) {
      filtered = filtered.filter(t => t.category === this.categoryFilter());
    }

    // Month-based date filter
    if (this.dateFilter()) {
      const selectedDate = new Date(this.dateFilter());
      const selectedMonth = selectedDate.getMonth();
      const selectedYear = selectedDate.getFullYear();
      
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === selectedMonth && 
               transactionDate.getFullYear() === selectedYear;
      });
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  // Available categories for filter dropdown
  availableCategories = computed(() => {
    const categories = new Set(this.allTransactions().map(t => t.category));
    return Array.from(categories).sort();
  });
  // Calculate total income (sum of positive amounts)
  totalIncome() {
    return this.transactions()
      .filter((transaction) => transaction.type === 'income')
      .reduce((total, transaction) => total + transaction.amount, 0);
  }

  // Calculate total expenses (sum of negative amounts - make positive for display)
  totalExpenses() {
    return Math.abs(
      this.transactions()
        .filter((transaction) => transaction.type === 'expense')
        .reduce((total, transaction) => total + transaction.amount, 0)
    );
  }

  // Calculate net balance (income - expenses)
  netBalance() {
    return this.totalIncome() - this.totalExpenses();
  }

  // Get CSS classes for category badges
  getCategoryClass(category: string): string {
    const categoryClasses: { [key: string]: string } = {
      // Income categories
      Salary: 'bg-green-100 text-green-800',
      Freelance: 'bg-emerald-100 text-emerald-800',
      Investment: 'bg-teal-100 text-teal-800',
      Business: 'bg-lime-100 text-lime-800',

      // Expense categories
      Housing: 'bg-red-100 text-red-800',
      Groceries: 'bg-orange-100 text-orange-800',
      Transportation: 'bg-blue-100 text-blue-800',
      Utilities: 'bg-yellow-100 text-yellow-800',
      Entertainment: 'bg-purple-100 text-purple-800',
      'Food & Dining': 'bg-pink-100 text-pink-800',
      Healthcare: 'bg-indigo-100 text-indigo-800',
      Shopping: 'bg-rose-100 text-rose-800',
      Education: 'bg-cyan-100 text-cyan-800',
      Travel: 'bg-violet-100 text-violet-800',
      Insurance: 'bg-slate-100 text-slate-800',
    };

    return categoryClasses[category] || 'bg-gray-100 text-gray-800';
  }

  ngOnInit() {
    const subscription = this.transactionsService.loadData().subscribe();
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  // Dialog methods
  openNewTransactionDialog() {
    this.isNewTransactionOpen.set(true);
  }

  closeNewTransactionDialog() {
    this.isNewTransactionOpen.set(false);
  }

  editTransaction(transaction: Transaction) {
    this.editingTransaction.set(transaction);
  }

  closeEditTransactionDialog() {
    this.editingTransaction.set(null);
  }

  deleteTransaction(transaction: Transaction) {
    this.deletingTransaction.set(transaction);
  }

  closeDeleteDialog() {
    this.deletingTransaction.set(null);
  }

  // Filter methods
  onTypeFilterChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.typeFilter.set(value);
  }

  onCategoryFilterChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.categoryFilter.set(value);
  }

  onDateFilterChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.dateFilter.set(value);
  }

  clearFilters() {
    this.typeFilter.set('');
    this.categoryFilter.set('');
    this.dateFilter.set(this.getCurrentMonthFirstDay());
  }
}
