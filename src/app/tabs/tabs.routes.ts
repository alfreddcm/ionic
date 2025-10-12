import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('../home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'expenses',
        loadComponent: () =>
          import('../expenses/expenses.page').then((m) => m.ExpensesPage),
      },
      {
        path: 'wallets', // Add wallets as an alias
        redirectTo: 'expenses'
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('../reports/reports.page').then((m) => m.ReportsPage),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('../settings/settings.page').then((m) => m.SettingsPage),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
];
