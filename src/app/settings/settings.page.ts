import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonList,
  IonAvatar,
  IonModal,
  IonButtons,
  IonInput,
  IonText,
  AlertController,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { ApiService, User } from '../services/api.service';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
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
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonList,
    IonAvatar,
    IonModal,
    IonButtons,
    IonInput,
    IonText
  ]
})
export class SettingsPage {
  private apiService = inject(ApiService);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private loadingController = inject(LoadingController);

  currentUser: User | null = null;
  
  showEditProfileModal = false;
  showChangePasswordModal = false;
  
  editForm = {
    username: '',
    name: '',
    email: ''
  };
  
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  
  passwordError = '';

  constructor() {
    this.apiService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  async onLogout() {
    const alert = await this.alertController.create({
      header: 'Confirm Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Logout',
          role: 'destructive',
          handler: async () => {
            try {
              await this.apiService.logout().toPromise();
              await this.showToast('Logged out successfully', 'success');
              
              localStorage.clear();
              sessionStorage.clear();
              
              window.location.href = '/login';
            } catch (error) {
              console.error('Logout error:', error);

              localStorage.clear();
              sessionStorage.clear();
              
              window.location.href = '/login';
            }
          }
        }
      ]
    });

    await alert.present();
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

  onEditProfile() {
    if (this.currentUser) {
      this.editForm.username = this.currentUser.username || '';
      this.editForm.name = this.currentUser.name;
      this.editForm.email = this.currentUser.email;
    }
    this.showEditProfileModal = true;
  }

  async saveProfile() {
    if (!this.currentUser || !this.editForm.username || !this.editForm.name || !this.editForm.email) {
      await this.showToast('Please fill in all fields', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Updating profile...'
    });
    await loading.present();

    try {
      const response = await this.apiService.updateUser(this.currentUser.id, {
        username: this.editForm.username,
        name: this.editForm.name,
        email: this.editForm.email
      }).toPromise();

      if (response?.status === 'success') {
        this.currentUser.username = this.editForm.username;
        this.currentUser.name = this.editForm.name;
        this.currentUser.email = this.editForm.email;
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        await this.showToast('Profile updated successfully!', 'success');
        this.showEditProfileModal = false;
      } else {
        await this.showToast('Failed to update profile', 'danger');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      await this.showToast('Failed to update profile', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  cancelEditProfile() {
    this.showEditProfileModal = false;
    this.editForm = { username: '', name: '', email: '' };
  }

  onChangePassword() {
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.showChangePasswordModal = true;
  }

  async savePassword() {
    this.passwordError = '';
    
    if (!this.currentUser || !this.passwordForm.currentPassword || 
        !this.passwordForm.newPassword || !this.passwordForm.confirmPassword) {
      this.passwordError = 'Please fill in all fields';
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordError = 'New passwords do not match';
      return;
    }

    if (this.passwordForm.newPassword.length < 6) {
      this.passwordError = 'Password must be at least 6 characters';
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Changing password...'
    });
    await loading.present();

    try {
      const response = await this.apiService.changePassword(
        this.currentUser.id,
        this.passwordForm.currentPassword,
        this.passwordForm.newPassword
      ).toPromise();

      if (response?.status === 'success') {
        await this.showToast('Password changed successfully!', 'success');
        this.showChangePasswordModal = false;
        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        this.passwordError = '';
      } else {
        this.passwordError = response?.message || 'Failed to change password';
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      this.passwordError = error?.error?.message || 'Incorrect current password or server error';
    } finally {
      await loading.dismiss();
    }
  }

  cancelChangePassword() {
    this.showChangePasswordModal = false;
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.passwordError = '';
  }

  onNotificationSettings() {

    this.showToast('Notification settings coming soon!', 'warning');
  }
}