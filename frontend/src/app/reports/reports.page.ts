import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonIcon,
  IonBadge,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { ApiService, User } from '../services/api.service';

interface Transaction {
  id: number;
  user_id: number;
  wallet_id: number;
  categoryid?: number;
  amount: number;
  balance_before?: number;
  balance_after?: number;
  transaction_type: 'expense' | 'add_funds' | 'deduct_funds' | 'update_balance';
  note?: string;
  created_at: string;
  updated_at?: string;
  walletname?: string;
  category_name?: string;
  current_wallet_balance?: number;
}

@Component({
  selector: 'app-reports',
  templateUrl: 'reports.page.html',
  styleUrls: ['reports.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonIcon,
    IonBadge,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonSegment,
    IonSegmentButton,
    IonSelect,
    IonSelectOption
  ]
})
export class ReportsPage implements OnInit {
  private apiService = inject(ApiService);
  private toastController = inject(ToastController);
  private loadingController = inject(LoadingController);

  currentUser: User | null = null;
  transactions: Transaction[] = [];
  wallets: any[] = [];
  
  isLoading = false;
  selectedSegment = 'all';
  selectedWallet: string = 'all';

  constructor() {
    this.apiService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadTransactions();
        this.loadWallets();
      }
    });
  }

  async ngOnInit() {
    if (this.currentUser) {
      await this.loadTransactions();
      await this.loadWallets();
    }

    this.apiService.transactionsRefresh$.subscribe(async (refresh) => {
      if (refresh) {
        await this.loadTransactions();
      }
    });
    
    this.apiService.walletsRefresh$.subscribe(async (refresh) => {
      if (refresh) {
        await this.loadWallets();
      }
    });
  }

  async loadTransactions() {
    if (!this.currentUser) return;
    
    this.isLoading = true;
    try {
      const filters: any = {};

      if (this.selectedWallet !== 'all') {
        filters.wallet_id = this.selectedWallet;
      }

      const response = await this.apiService.getTransactions(this.currentUser.id, filters).toPromise();
      if (response?.status === 'success' && response.data) {
        this.transactions = response.data;
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      await this.showToast('Error loading transactions', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async loadWallets() {
    if (!this.currentUser) return;
    
    try {
      const response = await this.apiService.getWallets(this.currentUser.id).toPromise();
      if (response?.status === 'success' && response.data) {
        this.wallets = response.data;
      }
    } catch (error) {
      console.error('Error loading wallets:', error);
    }
  }

  async onSegmentChange(event: any) {
    this.selectedSegment = event.detail.value;


  }

  async onWalletFilterChange(event: any) {
    this.selectedWallet = event.detail.value;
    await this.loadTransactions();
  }

  async handleRefresh(event: any) {
    await this.loadTransactions();
    event.target.complete();
  }

  getTransactionIcon(transaction: Transaction): string {
    return transaction.transaction_type === 'expense' ? 'remove-circle' : 'add-circle';
  }

  getTransactionColor(transaction: Transaction): string {
    return transaction.transaction_type === 'expense' ? 'danger' : 'success';
  }

  getTransactionTypeLabel(type: string): string {
    switch (type) {
      case 'expense':
        return 'Expense';
      case 'add_funds':
      case 'deduct_funds':
      case 'update_balance':
        return 'Wallet Update';
      default:
        return 'Transaction';
    }
  }

  getWalletUpdateLabel(transaction: Transaction): string {
    switch (transaction.transaction_type) {
      case 'add_funds':
        return 'Added Funds';
      case 'deduct_funds':
        return 'Deducted Funds';
      case 'update_balance':
        return 'Balance Set';
      default:
        return '';
    }
  }

  formatAmount(amount: number, type: string): string {
    const prefix = type === 'expense' ? '-' : '+';
    const formattedAmount = amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `${prefix}₱${formattedAmount}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getFilteredTransactions(): Transaction[] {
    return this.transactions.filter(transaction => {
      if (this.selectedSegment === 'all') return true;
      if (this.selectedSegment === 'wallet_update') {
        return ['add_funds', 'deduct_funds', 'update_balance'].includes(transaction.transaction_type);
      }
      return transaction.transaction_type === this.selectedSegment;
    });
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}