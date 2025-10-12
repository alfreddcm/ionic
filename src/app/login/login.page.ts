import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, personCircleOutline, mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, walletOutline } from 'ionicons/icons';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonText
  ]
})
export class LoginPage {
  private apiService = inject(ApiService);
  private router = inject(Router);
  private toastController = inject(ToastController);
  private loadingController = inject(LoadingController);

  isLoginMode = true;
  showPassword = false;

  loginForm = {
    email: '',
    password: ''
  };

  registerForm = {
    fullname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  constructor() {
    addIcons({
      personOutline,
      personCircleOutline,
      mailOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
      walletOutline
    });
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.clearForms();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  clearForms() {
    this.loginForm = { email: '', password: '' };
    this.registerForm = { fullname: '', username: '', email: '', password: '', confirmPassword: '' };
  }

  async onLogin() {
    console.log('=== LOGIN FORM DEBUG ===');
    console.log('Login Form Data:', this.loginForm);
    console.log('Email:', this.loginForm.email);
    console.log('Password Length:', this.loginForm.password?.length);
    console.log('========================');
    
    if (!this.loginForm.email || !this.loginForm.password) {
      await this.showToast('Please fill in all fields', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Signing in...'
    });
    await loading.present();

    try {
      console.log('Making login API call...');
      const response = await this.apiService.login(this.loginForm.email, this.loginForm.password).toPromise();
      
      console.log('=== LOGIN RESULT DEBUG ===');
      console.log('API Response:', response);
      console.log('==========================');
      
      if (response?.status === 'success') {
        await this.showToast('Login successful!', 'success');
        this.router.navigate(['/tabs']);
      } else {
        await this.showToast('Invalid credentials', 'danger');
      }
    } catch (error: any) {
      console.error('=== LOGIN ERROR DEBUG ===');
      console.error('Error in onLogin:', error);
      console.error('Error Type:', typeof error);
      console.error('Error Constructor:', error?.constructor?.name);
      console.error('=========================');

      if (error?.error && error?.error?.messages) {
        const messages = error.error.messages;
        const errorMessages = Object.values(messages).join('\n');
        await this.showToast(errorMessages, 'danger');
      } else if (error?.error && typeof error.error === 'string') {
        await this.showToast(error.error, 'danger');
      } else {
        await this.showToast('Login failed. Please check your credentials.', 'danger');
      }
    } finally {
      await loading.dismiss();
    }
  }

  async onRegister() {
    if (!this.registerForm.fullname || !this.registerForm.username || !this.registerForm.email || !this.registerForm.password) {
      await this.showToast('Please fill in all fields', 'warning');
      return;
    }

    if (this.registerForm.password !== this.registerForm.confirmPassword) {
      await this.showToast('Passwords do not match', 'warning');
      return;
    }

    if (this.registerForm.password.length < 6) {
      await this.showToast('Password must be at least 6 characters long', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Creating account...'
    });
    await loading.present();

    try {
      const response = await this.apiService.register(
        this.registerForm.fullname,
        this.registerForm.username,
        this.registerForm.email,
        this.registerForm.password
      ).toPromise();
      
      if (response?.status === 'success') {
        await this.showToast('Account created successfully!', 'success');
        this.isLoginMode = true;
        this.loginForm.email = this.registerForm.email;
        this.clearForms();
      } else {
        await this.showToast('Registration failed. Please try again.', 'danger');
      }
    } catch (error: any) {
      console.error('Registration error:', error);

      if (error?.error && error?.error?.messages) {
        const messages = error.error.messages;
        const errorMessages = Object.values(messages).join('\n');
        await this.showToast(errorMessages, 'danger');
      } else if (error?.error && typeof error.error === 'string') {
        await this.showToast(error.error, 'danger');
      } else {
        await this.showToast('Registration failed. Please check your information.', 'danger');
      }
    } finally {
      await loading.dismiss();
    }
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}