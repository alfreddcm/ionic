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
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonButtons,
  IonIcon,
  IonSpinner,
  IonModal,
  IonRadio,
  IonRadioGroup,
  IonFab,
  IonFabButton,
  ToastController,
  LoadingController,
  ModalController,
  AlertController
} from '@ionic/angular/standalone';
import { ApiService, User } from '../services/api.service';

interface Wallet {
  id: number;
  user_id: number;
  walletname: string;
  amount: number;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-expenses',
  templateUrl: 'expenses.page.html',
  styleUrls: ['expenses.page.scss'],
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
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonButtons,
    IonIcon,
    IonSpinner,
    IonModal,
    IonRadio,
    IonRadioGroup,
    IonFab,
    IonFabButton
  ]
})
export class ExpensesPage implements OnInit {
  private apiService = inject(ApiService);
  private toastController = inject(ToastController);
  private loadingController = inject(LoadingController);
  private modalController = inject(ModalController);
  private alertController = inject(AlertController);

  currentUser: User | null = null;
  wallets: Wallet[] = [];
  isLoading = false;
  isModalOpen = false;
  
  walletForm = {
    walletname: '',
    amount: ''
  };
  
  editingWallet: Wallet | null = null;
  fundAction: 'update' | 'add' | 'deduct' = 'update';

  constructor() {
    this.apiService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadWallets();
      }
    });
  }

  async ngOnInit() {
    if (this.currentUser) {
      await this.loadWallets();
    }
    
     this.apiService.walletsRefresh$.subscribe(async (refresh) => {
      if (refresh && this.currentUser) {
        await this.loadWallets();
      }
    });
  }

  async loadWallets() {
    if (!this.currentUser) return;
    
    this.isLoading = true;
    try {
      const response = await this.apiService.getWallets(this.currentUser.id).toPromise();
      if (response?.status === 'success' && response.data) {
        this.wallets = response.data;
      }
    } catch (error) {
      console.error('Error loading wallets:', error);
      await this.showToast('Error loading wallets', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async presentWalletModal(wallet?: Wallet) {
    this.editingWallet = wallet || null;
    
    if (wallet) {
      this.walletForm = {
        walletname: wallet.walletname,
        amount: ''  
      };
      this.fundAction = 'update';  
    } else {
      this.resetForm();
    }
    
    this.isModalOpen = true;
  }

  async saveWallet() {
    if (!this.currentUser) {
      await this.showToast('Please login to manage wallets', 'warning');
      return;
    }

    if (!this.walletForm.walletname || !this.walletForm.amount) {
      await this.showToast('Please fill in all required fields', 'warning');
      return;
    }

    const inputAmount = parseFloat(this.walletForm.amount);
    if (isNaN(inputAmount) || inputAmount < 0) {
      await this.showToast('Please enter a valid positive amount', 'warning');
      return;
    }
    
    if (inputAmount > 999999999) {
      await this.showToast('Amount is too large', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: this.editingWallet ? 'Updating wallet...' : 'Creating wallet...'
    });
    await loading.present();

    try {
      const inputAmount = Number(this.walletForm.amount);
      let finalAmount = inputAmount;

      if (this.editingWallet) {
        const currentBalance = Number(this.editingWallet.amount);
        
        switch (this.fundAction) {
          case 'add':
            finalAmount = currentBalance + inputAmount;
            break;
          case 'deduct':
            finalAmount = currentBalance - inputAmount;

            if (finalAmount < 0) {
              await this.showToast('Cannot deduct more than current balance', 'warning');
              await loading.dismiss();
              return;
            }
            break;
          case 'update':
            finalAmount = inputAmount;
            break;
        }

        if (this.fundAction === 'add' || this.fundAction === 'deduct' || this.fundAction === 'update') {
          const transaction = {
            user_id: this.currentUser.id,
            wallet_id: this.editingWallet.id!,
            amount: inputAmount,
            transaction_type: this.fundAction === 'add' ? 'add_funds' : 
                            this.fundAction === 'deduct' ? 'deduct_funds' : 'update_balance',
            note: `${this.fundAction === 'add' ? 'Added funds to' : 
                    this.fundAction === 'deduct' ? 'Deducted funds from' : 
                    'Updated balance for'} ${this.walletForm.walletname}`,
            transaction_date: new Date().toISOString()
          };

          await this.apiService.addTransaction(transaction).toPromise();
          
          await this.showToast(
            `${this.fundAction === 'add' ? 'Funds added' : 
               this.fundAction === 'deduct' ? 'Funds deducted' : 
               'Balance updated'} successfully!`, 
            'success'
          );
          this.isModalOpen = false;
          this.resetForm();
          await this.loadWallets();

          this.apiService.triggerWalletsRefresh();
          this.apiService.triggerTransactionsRefresh();
          await loading.dismiss();
          return;
        }
      }

      const walletData = {
        walletname: this.walletForm.walletname,
        amount: Number(this.walletForm.amount)
      };
      
      let response;
      
      if (this.editingWallet) {
        response = await this.apiService.updateWallet(this.editingWallet.id, walletData).toPromise();
      } else {
        response = await this.apiService.createWallet(this.currentUser.id, walletData).toPromise();
      }
      
      if (response?.status === 'success') {
        await this.showToast(
          this.editingWallet ? 'Wallet updated successfully!' : 'Wallet created successfully!', 
          'success'
        );
        this.isModalOpen = false;
        this.resetForm();
        await this.loadWallets();

        this.apiService.triggerWalletsRefresh();
      } else {
        await this.showToast('Failed to save wallet', 'danger');
      }
    } catch (error) {
      console.error('Error saving wallet:', error);
      await this.showToast('Error saving wallet', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  async editWallet(wallet: Wallet) {
    await this.presentWalletModal(wallet);
  }

  async deleteWallet(wallet: Wallet) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete the wallet "${wallet.walletname}"? This action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            await this.performDeleteWallet(wallet);
          }
        }
      ]
    });

    await alert.present();
  }

  async performDeleteWallet(wallet: Wallet) {
    const loading = await this.loadingController.create({
      message: 'Deleting wallet...'
    });
    await loading.present();

    try {
      const response = await this.apiService.deleteWallet(wallet.id).toPromise();
      
      if (response?.status === 'success') {
        await this.showToast('Wallet deleted successfully!', 'success');
        await this.loadWallets();
      } else {
        await this.showToast('Failed to delete wallet', 'danger');
      }
    } catch (error) {
      console.error('Error deleting wallet:', error);
      await this.showToast('Error deleting wallet', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  resetForm() {
    this.walletForm = {
      walletname: '',
      amount: ''
    };
    this.editingWallet = null;
    this.fundAction = 'update';
  }

  cancelModal() {
    this.isModalOpen = false;
    this.resetForm();
  }

  onFundActionChange() {
     this.walletForm.amount = '';
  }

  isValidAmount(amount: string): boolean {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && isFinite(num);
  }

  getNewBalancePreview(): number | null {
    if (!this.editingWallet || !this.walletForm.amount || this.walletForm.amount === '') {
      return null;
    }
    
    const currentBalance = Number(this.editingWallet.amount) || 0;
    const inputAmount = Number(this.walletForm.amount);
    
    if (isNaN(inputAmount) || inputAmount < 0) {
      return null;
    }
    
    switch (this.fundAction) {
      case 'add':
        return currentBalance + inputAmount;
      case 'deduct':
        return Math.max(0, currentBalance - inputAmount); 
      case 'update':
        return inputAmount;
      default:
        return currentBalance;
    }
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
