import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import {
  Chart,
  ChartConfiguration,
  ChartData,
  ChartType,
  registerables,
} from 'chart.js';
import { DashboardService } from './dashboard.service';
import {
  DashboardSummary,
  ExpenseCategory,
  CashflowData,
  Transaction,
  Goal,
} from './dashboard.models';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  dashboardService = inject(DashboardService);
  router = inject(Router);

  dashboardSummary = this.dashboardService.dashboardSummary;
  expenseCategories = this.dashboardService.expenseCategories;
  cashflowData = this.dashboardService.cashflowData;
  recentTransactions = this.dashboardService.recentTransactions;
  goals = this.dashboardService.goals;

  // Doughnut Chart Configuration for Expense Categories
  doughnutChartType: ChartType = 'doughnut';
  doughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#ef4444', // red
          '#f97316', // orange
          '#eab308', // yellow
          '#22c55e', // green
          '#3b82f6', // blue
          '#8b5cf6', // purple
          '#ec4899', // pink
          '#06b6d4', // cyan
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
    },
  };

  // Line Chart Configuration for Cashflow
  lineChartType: ChartType = 'line';
  lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'Income',
        data: [],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: [],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return '$' + value;
          },
        },
      },
    },
  };

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.dashboardService.loadAllDashboardData().subscribe({
      next: () => {
        this.updateCharts();
      },
      error: (error) => {
        console.error('Failed to load dashboard data:', error);
      },
    });
  }

  private updateCharts() {
    this.updateDoughnutChart();
    this.updateLineChart();
  }

  private updateDoughnutChart() {
    const categories = this.expenseCategories();
    if (categories.length > 0) {
      this.doughnutChartData.labels = categories.map((cat) => cat.category);
      this.doughnutChartData.datasets[0].data = categories.map(
        (cat) => cat.amount
      );
    }
  }

  private updateLineChart() {
    const cashflow = this.cashflowData();
    if (cashflow.length > 0) {
      this.lineChartData.labels = cashflow.map(
        (data) => `${data.month} ${data.year}`
      );
      this.lineChartData.datasets[0].data = cashflow.map((data) => data.income);
      this.lineChartData.datasets[1].data = cashflow.map(
        (data) => data.expenses
      );
    }
  }

  getCurrentMonthName(): string {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return monthNames[new Date().getMonth()];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  getCategoryInitial(category: string): string {
    return category.charAt(0).toUpperCase();
  }

  getCategoryColor(category: string, transactionType?: string): string {
    // Handle both capitalized and lowercase versions
    if (transactionType?.toLowerCase() === 'income') {
      return 'bg-green-500/20 text-green-600';
    }

    // For expenses, use varied colors based on category
    const colors = [
      'bg-red-500/20 text-red-600',
      'bg-orange-500/20 text-orange-600',
      'bg-yellow-500/20 text-yellow-600',
      'bg-blue-500/20 text-blue-600',
      'bg-purple-500/20 text-purple-600',
      'bg-pink-500/20 text-pink-600',
      'bg-cyan-500/20 text-cyan-600',
      'bg-gray-500/20 text-gray-600',
    ];
    const index = category.length % colors.length;
    return colors[index];
  }

  calculateGoalProgress(goal: Goal): number {
    if (goal.target_amount === 0) return 0;
    return Math.round((goal.current_amount / goal.target_amount) * 100);
  }

  getRemainingAmount(goal: Goal): number {
    return Math.max(0, goal.target_amount - goal.current_amount);
  }

  getProgressBarColor(percentage: number): string {
    if (percentage >= 80) return 'bg-gradient-to-r from-success to-primary';
    if (percentage >= 60) return 'bg-gradient-to-r from-warning to-secondary';
    return 'bg-gradient-to-r from-info to-accent';
  }

  getProgressTextColor(percentage: number): string {
    if (percentage >= 80) return 'text-success';
    if (percentage >= 60) return 'text-warning';
    return 'text-info';
  }

  formatDueDate(dateString: string): string {
    const dueDate = new Date(dateString);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));

    if (diffMonths <= 0) return 'Past due';
    if (diffMonths === 1) return '1 month left';
    return `${diffMonths} months left`;
  }

  navigateToTransactions() {
    this.router.navigate(['/transactions']);
  }

  navigateToGoals() {
    this.router.navigate(['/goals']);
  }
}
