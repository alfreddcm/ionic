export interface Expense {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: Date;
  isRecurring?: boolean;
  type: 'daily' | 'other';
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Budget {
  id: string;
  totalBudget: number;
  totalSpent: number;
  remainingBalance: number;
  month: string;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseSummary {
  totalDaily: number;
  totalOther: number;
  totalMonth: number;
  categorySummary: CategorySummary[];
  dailyAverage: number;
  highestCategory: string;
}

export interface CategorySummary {
  category: string;
  total: number;
  percentage: number;
  count: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

export interface Settings {
  currency: string;
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
  backupEnabled: boolean;
}