import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { Expense, Category, Budget, ExpenseSummary, CategorySummary, Settings } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private expensesSubject = new BehaviorSubject<Expense[]>([]);
  private budgetSubject = new BehaviorSubject<Budget | null>(null);
  private settingsSubject = new BehaviorSubject<Settings>(this.getDefaultSettings());

  public expenses$ = this.expensesSubject.asObservable();
  public budget$ = this.budgetSubject.asObservable();
  public settings$ = this.settingsSubject.asObservable();

  private readonly STORAGE_KEYS = {
    EXPENSES: 'expenses',
    BUDGET: 'budget',
    SETTINGS: 'settings'
  };

  constructor(private storage: StorageService) {
    this.loadData();
  }

  private async loadData() {
    await this.storage.init();

    const expenses = await this.storage.get(this.STORAGE_KEYS.EXPENSES);
    if (expenses && expenses.length > 0) {
      this.expensesSubject.next(expenses);
    } else {

      const dummyExpenses = this.getDummyExpenses();
      await this.storage.set(this.STORAGE_KEYS.EXPENSES, dummyExpenses);
      this.expensesSubject.next(dummyExpenses);
    }

    const budget = await this.storage.get(this.STORAGE_KEYS.BUDGET);
    if (budget) {
      this.budgetSubject.next(budget);
    } else {

      const dummyBudget = this.getDummyBudget();
      await this.storage.set(this.STORAGE_KEYS.BUDGET, dummyBudget);
      this.budgetSubject.next(dummyBudget);
    }

    const settings = await this.storage.get(this.STORAGE_KEYS.SETTINGS);
    if (settings) {
      this.settingsSubject.next(settings);
    } else {
      const defaultSettings = this.getDefaultSettings();
      await this.storage.set(this.STORAGE_KEYS.SETTINGS, defaultSettings);
      this.settingsSubject.next(defaultSettings);
    }
  }

  async addExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Promise<void> {
    const newExpense: Expense = {
      ...expense,
      id: this.generateId(),
      createdAt: new Date()
    };

    const currentExpenses = this.expensesSubject.value;
    const updatedExpenses = [...currentExpenses, newExpense];
    
    await this.storage.set(this.STORAGE_KEYS.EXPENSES, updatedExpenses);
    this.expensesSubject.next(updatedExpenses);

    await this.updateBudgetSpent();
  }

  async updateExpense(id: string, updates: Partial<Expense>): Promise<void> {
    const currentExpenses = this.expensesSubject.value;
    const updatedExpenses = currentExpenses.map(expense => 
      expense.id === id ? { ...expense, ...updates } : expense
    );
    
    await this.storage.set(this.STORAGE_KEYS.EXPENSES, updatedExpenses);
    this.expensesSubject.next(updatedExpenses);
    await this.updateBudgetSpent();
  }

  async deleteExpense(id: string): Promise<void> {
    const currentExpenses = this.expensesSubject.value;
    const updatedExpenses = currentExpenses.filter(expense => expense.id !== id);
    
    await this.storage.set(this.STORAGE_KEYS.EXPENSES, updatedExpenses);
    this.expensesSubject.next(updatedExpenses);
    await this.updateBudgetSpent();
  }

  async updateBudget(budget: Partial<Budget>): Promise<void> {
    const currentBudget = this.budgetSubject.value;
    const updatedBudget: Budget = {
      ...currentBudget!,
      ...budget,
      updatedAt: new Date()
    };
    
    await this.storage.set(this.STORAGE_KEYS.BUDGET, updatedBudget);
    this.budgetSubject.next(updatedBudget);
  }

  private async updateBudgetSpent(): Promise<void> {
    const expenses = this.expensesSubject.value;
    const currentBudget = this.budgetSubject.value;
    
    if (!currentBudget) return;

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() + 1 === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    });

    const totalSpent = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remainingBalance = currentBudget.totalBudget - totalSpent;

    const updatedBudget: Budget = {
      ...currentBudget,
      totalSpent,
      remainingBalance,
      updatedAt: new Date()
    };

    await this.storage.set(this.STORAGE_KEYS.BUDGET, updatedBudget);
    this.budgetSubject.next(updatedBudget);
  }

  getExpenseSummary(): ExpenseSummary {
    const expenses = this.expensesSubject.value;
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const todayExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.toDateString() === today.toDateString();
    });

    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() + 1 === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    });

    const totalDaily = todayExpenses.filter(e => e.type === 'daily').reduce((sum, e) => sum + e.amount, 0);
    const totalOther = monthlyExpenses.filter(e => e.type === 'other').reduce((sum, e) => sum + e.amount, 0);
    const totalMonth = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

    const categoryMap = new Map<string, { total: number, count: number }>();
    monthlyExpenses.forEach(expense => {
      const existing = categoryMap.get(expense.category) || { total: 0, count: 0 };
      categoryMap.set(expense.category, {
        total: existing.total + expense.amount,
        count: existing.count + 1
      });
    });

    const categorySummary: CategorySummary[] = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      total: data.total,
      percentage: totalMonth > 0 ? (data.total / totalMonth) * 100 : 0,
      count: data.count
    }));

    const dailyAverage = monthlyExpenses.length > 0 ? totalMonth / new Date().getDate() : 0;
    const highestCategory = categorySummary.length > 0 
      ? categorySummary.reduce((max, curr) => curr.total > max.total ? curr : max).category 
      : '';

    return {
      totalDaily,
      totalOther,
      totalMonth,
      categorySummary,
      dailyAverage,
      highestCategory
    };
  }

  async updateSettings(settings: Partial<Settings>): Promise<void> {
    const currentSettings = this.settingsSubject.value;
    const updatedSettings = { ...currentSettings, ...settings };
    
    await this.storage.set(this.STORAGE_KEYS.SETTINGS, updatedSettings);
    this.settingsSubject.next(updatedSettings);
  }

  getCategories(): Category[] {
    return [
      { id: '1', name: 'Food', icon: 'restaurant', color: '#FF5722' },
      { id: '2', name: 'Transport', icon: 'car', color: '#2196F3' },
      { id: '3', name: 'Entertainment', icon: 'game-controller', color: '#9C27B0' },
      { id: '4', name: 'Shopping', icon: 'bag', color: '#FF9800' },
      { id: '5', name: 'Bills', icon: 'receipt', color: '#F44336' },
      { id: '6', name: 'Health', icon: 'medical', color: '#4CAF50' },
      { id: '7', name: 'Education', icon: 'school', color: '#3F51B5' },
      { id: '8', name: 'Travel', icon: 'airplane', color: '#00BCD4' },
      { id: '9', name: 'Other', icon: 'ellipsis-horizontal', color: '#795548' }
    ];
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getDummyExpenses(): Expense[] {
    const categories = this.getCategories();
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    return [
      {
        id: '1',
        amount: 150,
        category: 'Food',
        note: 'Lunch at restaurant',
        date: today,
        type: 'daily',
        createdAt: today
      },
      {
        id: '2',
        amount: 50,
        category: 'Transport',
        note: 'Uber ride',
        date: today,
        type: 'daily',
        createdAt: today
      },
      {
        id: '3',
        amount: 1200,
        category: 'Bills',
        note: 'Electricity bill',
        date: new Date(thisMonth.getTime() + 5 * 24 * 60 * 60 * 1000),
        type: 'other',
        isRecurring: true,
        createdAt: new Date(thisMonth.getTime() + 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: '4',
        amount: 300,
        category: 'Shopping',
        note: 'Groceries',
        date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        type: 'daily',
        createdAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: '5',
        amount: 2500,
        category: 'Other',
        note: 'Rent payment',
        date: new Date(thisMonth.getTime() + 1 * 24 * 60 * 60 * 1000),
        type: 'other',
        isRecurring: true,
        createdAt: new Date(thisMonth.getTime() + 1 * 24 * 60 * 60 * 1000)
      }
    ];
  }

  private getDummyBudget(): Budget {
    const today = new Date();
    return {
      id: '1',
      totalBudget: 10000,
      totalSpent: 4200,
      remainingBalance: 5800,
      month: today.toLocaleString('default', { month: 'long' }),
      year: today.getFullYear(),
      createdAt: today,
      updatedAt: today
    };
  }

  private getDefaultSettings(): Settings {
    return {
      currency: '₱',
      theme: 'light',
      notifications: true,
      language: 'en',
      backupEnabled: false
    };
  }
}