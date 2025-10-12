import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonCard,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonModal,
  IonButtons,
  ToastController,
  LoadingController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  walletOutline,
  barChartOutline,
  pencilOutline,
  warningOutline,
  addOutline,
  eyeOutline,
  eyeOffOutline,
  settingsOutline,
  closeOutline,
  close,
  person,
  wallet,
  trendingDown,
  trendingUp,
  createOutline,
  warning,
  card,
  chevronForward,
  add,
  receipt,
  pricetag,
  cash,
  documentText,
  addCircle
} from 'ionicons/icons';
import { ApiService, User } from '../services/api.service';

interface Wallet {
  id?: number;
  user_id?: number;
  walletname: string;
  amount: number;
  is_enabled?: boolean;
}

interface Transaction {
  id?: number;
  user_id?: number;
  wallet_id: number;
  categoryid?: number;
  note?: string;
  amount: number;
  transaction_type: 'expense' | 'add_funds';
  transaction_date?: string;
}

interface UserSettings {
  id?: number;
  user_id?: number;
  daily_budget: number;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonModal,
    IonButtons
  ]
})
export class HomePage implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  private toastController = inject(ToastController);
  private loadingController = inject(LoadingController);
  private alertController = inject(AlertController);

  currentUser: User | null = null;
  userName: string = 'User';

  dailyBudget: number = 0;
  todaysExpenses: number = 0;
  showBudgetWarning: boolean = false;

  wallets: Wallet[] = [];
  selectedWallet: Wallet | null = null;
  selectedWalletId: number | null = null;


  private categoryMapping = {
    'food': 1,           // Food & Dining
    'transport': 2,      // Transportation  
    'shopping': 3,       // Shopping
    'entertainment': 4,  // Entertainment
    'bills': 5,         // Bills & Utilities
    'healthcare': 6,    // Healthcare
    'education': 7,     // Education
    'travel': 8,        // Travel
    'other': 9          // Other
  };

  selectedCategory: string = 'food';
  expenseAmount: number | null = null;
  displayAmount: string = '';
  expenseNote: string = '';

  showBudgetModal: boolean = false;
  showWalletModal: boolean = false;
  newBudgetAmount: number | null = null;
  walletModalMode: 'create' | 'edit' = 'create';
  editingWallet: Wallet | null = null;
  walletFormData: Wallet = {
    walletname: '',
    amount: 0
  };

  constructor() {
    addIcons({
      walletOutline,
      barChartOutline,
      pencilOutline,
      warningOutline,
      addOutline,
      eyeOutline,
      eyeOffOutline,
      settingsOutline,
      closeOutline,
      close,
      person,
      wallet,
      trendingDown,
      trendingUp,
      createOutline,
      warning,
      card,
      chevronForward,
      add,
      receipt,
      pricetag,
      cash,
      documentText,
      addCircle
    });
  }

  onAmountKeypress(event: any): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if ([46, 8, 9, 27, 13, 110, 190].indexOf(charCode) !== -1 ||
      (charCode === 65 && event.ctrlKey === true) ||
      (charCode === 67 && event.ctrlKey === true) ||
      (charCode === 86 && event.ctrlKey === true) ||
      (charCode === 88 && event.ctrlKey === true)) {
      return true;
    }
    if ((charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  onAmountInput(event: any): void {
    const input = event.target.value;
    
    let cleaned = input.replace(/[^\d.]/g, '');
    
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    
    if (parts[1] && parts[1].length > 2) {
      cleaned = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    this.expenseAmount = cleaned ? parseFloat(cleaned) : null;
    
    if (cleaned) {
      const [integerPart, decimalPart] = cleaned.split('.');
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      this.displayAmount = decimalPart !== undefined 
        ? `${formattedInteger}.${decimalPart}` 
        : formattedInteger;
    } else {
      this.displayAmount = '';
    }
  }

  async ngOnInit() {
    await this.loadUserData();
    await this.loadWallets();
    await this.loadUserSettings();
    await this.loadTodaysExpenses();
    this.checkBudgetWarning();

    this.apiService.walletsRefresh$.subscribe(async (refresh) => {
      if (refresh) {
        await this.loadWallets();
        await this.loadTodaysExpenses();
        this.checkBudgetWarning();
      }
    });

    this.apiService.transactionsRefresh$.subscribe(async (refresh) => {
      if (refresh) {
        await this.loadTodaysExpenses();
        this.checkBudgetWarning();
      }
    });
  }

  async loadUserData() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      this.currentUser = JSON.parse(userData);
      this.userName = this.currentUser?.name || 'User';
    } else {

      this.router.navigate(['/login']);
    }
  }

  async loadWallets() {
    if (!this.currentUser) return;

    try {
      const response = await this.apiService.getWallets(this.currentUser.id).toPromise();
      if (response?.status === 'success') {
        this.wallets = response.data || [];

        if (this.wallets.length > 0 && !this.selectedWallet) {
          this.selectedWallet = this.wallets[0];
          this.selectedWalletId = this.selectedWallet.id || null;
        }
      }
    } catch (error) {
      console.error('Error loading wallets:', error);
    }
  }

  onWalletChange() {
    this.selectedWallet = this.wallets.find((w: Wallet) => w.id === this.selectedWalletId) || null;
  }

  getCategoryDisplay(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'food': '🍔 Food',
      'transport': '🚗 Transport',
      'entertainment': '🎬 Entertainment',
      'shopping': '🛍️ Shopping',
      'bills': '📄 Bills',
      'other': '📌 Other'
    };
    return categoryMap[category] || category;
  }

  getWalletLogo(walletName: string): string {
    const name = walletName.toLowerCase();
    
    const walletLogos: { [key: string]: string } = {
      'gcash': 'assets/wallets/gcash.png',
      'paymaya': 'assets/wallets/paymaya.png',
      'maya': 'assets/wallets/maya.png',
      'paypal': 'assets/wallets/paypal.png',
      'grab': 'assets/wallets/grab.png',
      'grabpay': 'assets/wallets/grabpay.png',
      'bdo': 'assets/wallets/bdo.png',
      'bpi': 'assets/wallets/bpi.png',
      'metrobank': 'assets/wallets/metrobank.png',
      'unionbank': 'assets/wallets/unionbank.png',
      'landbank': 'assets/wallets/landbank.png',
      'security bank': 'assets/wallets/securitybank.png',
      'visa': 'assets/wallets/visa.png',
      'mastercard': 'assets/wallets/mastercard.png',
      'cash': 'assets/wallets/cash.png',
      'card': 'assets/wallets/card.png',
      'bank': 'assets/wallets/bank.png',
      'wallet': 'assets/wallets/wallet.png'
    };

    for (const [key, logo] of Object.entries(walletLogos)) {
      if (name.includes(key)) {
        return logo;
      }
    }

    return 'assets/wallets/default-wallet.png';
  }

  getWalletGradient(walletName: string): string {
    const name = walletName.toLowerCase();
    
    const walletGradients: { [key: string]: string } = {
      'gcash': 'linear-gradient(135deg, #007DFF, #0062CC)',
      'paymaya': 'linear-gradient(135deg, #00D632, #00A827)',
      'maya': 'linear-gradient(135deg, #00D632, #00A827)',
      'paypal': 'linear-gradient(135deg, #0070BA, #1546A0)',
      'grab': 'linear-gradient(135deg, #00B14F, #008C3E)',
      'grabpay': 'linear-gradient(135deg, #00B14F, #008C3E)',
      'bdo': 'linear-gradient(135deg, #003DA5, #002E7D)',
      'bpi': 'linear-gradient(135deg, #ED1C24, #C1161C)',
      'metrobank': 'linear-gradient(135deg, #D4292B, #A61F21)',
      'unionbank': 'linear-gradient(135deg, #008F4C, #006B39)',
      'cash': 'linear-gradient(135deg, #52ab98, #2b6777)',
      'card': 'linear-gradient(135deg, #667eea, #764ba2)',
      'visa': 'linear-gradient(135deg, #1A1F71, #0E1142)',
      'mastercard': 'linear-gradient(135deg, #EB001B, #C5000F)'
    };

    for (const [key, gradient] of Object.entries(walletGradients)) {
      if (name.includes(key)) {
        return gradient;
      }
    }

    return 'linear-gradient(135deg, #2b6777, #52ab98)';
  }

  async loadUserSettings() {
    if (!this.currentUser) return;

    try {
      const response = await this.apiService.getUserSettings(this.currentUser.id).toPromise();
      if (response?.status === 'success' && response.data) {
        this.dailyBudget = response.data.daily_budget || 0;
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  }

  async loadTodaysExpenses() {
    if (!this.currentUser) return;

    try {
      const response = await this.apiService.getTodaysExpenses(this.currentUser.id).toPromise();
      if (response?.status === 'success') {
        this.todaysExpenses = response.data?.total || 0;
      }
    } catch (error) {
      console.error('Error loading today\'s expenses:', error);
    }
  }

  checkBudgetWarning() {
    this.showBudgetWarning = this.dailyBudget > 0 && this.todaysExpenses > this.dailyBudget;
  }

  editBudget() {
    this.newBudgetAmount = this.dailyBudget;
    this.showBudgetModal = true;
  }

  async saveBudget() {
    if (!this.currentUser || !this.newBudgetAmount || this.newBudgetAmount < 0) {
      await this.showToast('Please enter a valid budget amount', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Updating budget...'
    });
    await loading.present();

    try {
      const response = await this.apiService.updateDailyBudget(this.currentUser.id, this.newBudgetAmount).toPromise();
      if (response?.status === 'success') {
        this.dailyBudget = this.newBudgetAmount;
        this.checkBudgetWarning();
        this.showBudgetModal = false;
        await this.showToast('Budget updated successfully!', 'success');
      } else {
        await this.showToast('Failed to update budget', 'danger');
      }
    } catch (error) {
      console.error('Error updating budget:', error);
      await this.showToast('Failed to update budget', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  createFirstWallet() {
    this.walletModalMode = 'create';
    this.walletFormData = {
      walletname: '',
      amount: 0
    };
    this.showWalletModal = true;
  }

  editWallet(wallet: Wallet) {
    this.walletModalMode = 'edit';
    this.editingWallet = wallet;
    this.walletFormData = { ...wallet };
    this.showWalletModal = true;
  }

  async saveWallet() {
    if (!this.currentUser || !this.walletFormData.walletname.trim()) {
      await this.showToast('Please enter a wallet name', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: this.walletModalMode === 'create' ? 'Creating wallet...' : 'Updating wallet...'
    });
    await loading.present();

    try {
      let response;
      if (this.walletModalMode === 'create') {
        response = await this.apiService.createWallet(this.currentUser.id, this.walletFormData).toPromise();
      } else {
        response = await this.apiService.updateWallet(this.editingWallet!.id!, this.walletFormData).toPromise();
      }

      if (response?.status === 'success') {
        await this.loadWallets();
        this.showWalletModal = false;
        await this.showToast(
          this.walletModalMode === 'create' ? 'Wallet created successfully!' : 'Wallet updated successfully!', 
          'success'
        );
      } else {
        await this.showToast('Failed to save wallet', 'danger');
      }
    } catch (error) {
      console.error('Error saving wallet:', error);
      await this.showToast('Failed to save wallet', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  manageWallets() {

    this.router.navigate(['/tabs/wallets']);
  }

  async addExpense() {
    if (!this.currentUser || !this.selectedWallet || !this.expenseAmount || this.expenseAmount <= 0) {
      await this.showToast('Please fill in all required fields', 'warning');
      return;
    }

    if (this.expenseAmount > this.selectedWallet.amount) {
      await this.showToast('Insufficient wallet balance', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Adding expense...'
    });
    await loading.present();

    try {
      const transaction: Transaction = {
        user_id: this.currentUser.id,
        wallet_id: this.selectedWallet.id!,
        categoryid: this.categoryMapping[this.selectedCategory as keyof typeof this.categoryMapping],
        note: this.expenseNote || `${this.selectedCategory} expense`,
        amount: this.expenseAmount,
        transaction_type: 'expense',
        transaction_date: new Date().toISOString()
      };

      const response = await this.apiService.addTransaction(transaction).toPromise();
      
      if (response?.status === 'success') {
        await this.showToast('Expense added successfully!', 'success');

        this.expenseAmount = null;
        this.displayAmount = '';
        this.expenseNote = '';
        this.selectedCategory = 'food';

        this.apiService.triggerWalletsRefresh();
        this.apiService.triggerTransactionsRefresh();

        await this.loadWallets();
        await this.loadTodaysExpenses();
        this.checkBudgetWarning();
      } else {
        await this.showToast('Failed to add expense', 'danger');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      await this.showToast('Failed to add expense. Please try again.', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}