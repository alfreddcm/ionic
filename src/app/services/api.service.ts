import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface User {
  id: number;
  username?: string;
  name: string;
  email: string;
  created_at: string;
}

export interface Expense {
  id?: number;
  user_id: number;
  amount: number;
  description: string;
  category_id: number;
  date: string;
  created_at?: string;
  updated_at?: string;
  category?: Category;
}

export interface Category {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Budget {
  id?: number;
  user_id: number;
  total_budget: number;
  spent: number;
  remaining: number;
  month: string;
  year: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  status: string;
  data?: T;
  message?: string;
  errors?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private walletsRefreshSubject = new BehaviorSubject<boolean>(false);
  public walletsRefresh$ = this.walletsRefreshSubject.asObservable();
  
  private transactionsRefreshSubject = new BehaviorSubject<boolean>(false);
  public transactionsRefresh$ = this.transactionsRefreshSubject.asObservable();

  constructor(private http: HttpClient) {

    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  triggerWalletsRefresh() {
    this.walletsRefreshSubject.next(true);
  }
  
  triggerTransactionsRefresh() {
    this.transactionsRefreshSubject.next(true);
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  private handleError(error: any): Observable<never> {
    console.error('=== API ERROR DEBUG ===');
    console.error('Full Error Object:', error);
    console.error('Error Status:', error.status);
    console.error('Error Status Text:', error.statusText);
    console.error('Error URL:', error.url);
    console.error('Error Headers:', error.headers);
    console.error('Error Body:', error.error);
    console.error('Error Message:', error.message);

    if (error.error) {
      console.error('Parsed Error Body:', error.error);
      if (error.error.messages) {
        console.error('Validation Messages:', error.error.messages);
      }
    }
    console.error('======================');
    return throwError(() => error);
  }

  register(fullname: string, username: string, email: string, password: string): Observable<ApiResponse<any>> {
    const body = { fullname, username, email, password };
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/auth/register`, body, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  login(emailOrName: string, password: string): Observable<ApiResponse<User>> {
    const body = { email: emailOrName, password }; // 'email' field accepts username or email
    console.log('=== LOGIN REQUEST DEBUG ===');
    console.log('Request URL:', `${this.baseUrl}/auth/login`);
    console.log('Request Body:', body);
    console.log('Request Headers:', this.getHeaders());
    console.log('===========================');
    
    return this.http.post<ApiResponse<User>>(`${this.baseUrl}/auth/login`, body, { headers: this.getHeaders() })
      .pipe(
        tap(response => {
          console.log('=== LOGIN RESPONSE DEBUG ===');
          console.log('Response:', response);
          console.log('============================');
          
          if (response.status === 'success' && response.data) {
            localStorage.setItem('currentUser', JSON.stringify(response.data));
            this.currentUserSubject.next(response.data);
          }
        }),
        catchError(this.handleError)
      );
  }

  logout(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/auth/logout`, {}, { headers: this.getHeaders() })
      .pipe(
        tap(() => {
          localStorage.clear();
          sessionStorage.clear();
          this.currentUserSubject.next(null);
        }),
        catchError(this.handleError)
      );
  }

  updateUser(userId: number, data: {username?: string, name: string, email: string}): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/users/${userId}`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  changePassword(userId: number, currentPassword: string, newPassword: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/users/${userId}/change-password`, {
      current_password: currentPassword,
      new_password: newPassword
    }, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getExpenses(userId: number, page: number = 1, limit: number = 50): Observable<ApiResponse<Expense[]>> {
    const params = new HttpParams()
      .set('user_id', userId.toString())
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    return this.http.get<ApiResponse<Expense[]>>(`${this.baseUrl}/expenses`, { 
      headers: this.getHeaders(), 
      params 
    }).pipe(catchError(this.handleError));
  }

  getTodayExpenses(userId: number): Observable<ApiResponse<Expense[]>> {
    const params = new HttpParams().set('user_id', userId.toString());
    
    return this.http.get<ApiResponse<Expense[]>>(`${this.baseUrl}/expenses/today`, { 
      headers: this.getHeaders(), 
      params 
    }).pipe(catchError(this.handleError));
  }

  getMonthlyExpenses(userId: number, month?: string, year?: string): Observable<ApiResponse<Expense[]>> {
    let params = new HttpParams().set('user_id', userId.toString());
    if (month) params = params.set('month', month);
    if (year) params = params.set('year', year);
    
    return this.http.get<ApiResponse<Expense[]>>(`${this.baseUrl}/expenses/monthly`, { 
      headers: this.getHeaders(), 
      params 
    }).pipe(catchError(this.handleError));
  }

  getExpenseSummary(userId: number): Observable<ApiResponse<any>> {
    const params = new HttpParams().set('user_id', userId.toString());
    
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/expenses/summary`, { 
      headers: this.getHeaders(), 
      params 
    }).pipe(catchError(this.handleError));
  }

  createExpense(expense: Omit<Expense, 'id'>): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/expenses`, expense, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateExpense(id: number, expense: Partial<Expense>): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/expenses/${id}`, expense, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteExpense(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/expenses/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getBudget(userId: number, month?: string, year?: string): Observable<ApiResponse<Budget>> {
    let params = new HttpParams().set('user_id', userId.toString());
    if (month) params = params.set('month', month);
    if (year) params = params.set('year', year);
    
    return this.http.get<ApiResponse<Budget>>(`${this.baseUrl}/budgets`, { 
      headers: this.getHeaders(), 
      params 
    }).pipe(catchError(this.handleError));
  }

  createOrUpdateBudget(userId: number, totalBudget: number, month?: string, year?: string): Observable<ApiResponse<any>> {
    const body: any = { user_id: userId, total_budget: totalBudget };
    if (month) body.month = month;
    if (year) body.year = year;
    
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/budgets`, body, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateBudgetSpent(userId: number, month?: string, year?: string): Observable<ApiResponse<any>> {
    const body: any = { user_id: userId };
    if (month) body.month = month;
    if (year) body.year = year;
    
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/budgets/update-spent`, body, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${this.baseUrl}/categories`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createCategory(category: Omit<Category, 'id'>): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/categories`, category, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateCategory(id: number, category: Partial<Category>): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/categories/${id}`, category, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteCategory(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/categories/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  testConnection(): Observable<any> {
    return this.http.get(`${this.baseUrl}/`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getWallets(userId: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/wallets?user_id=${userId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createWallet(userId: number, wallet: any): Observable<ApiResponse<any>> {
    const body = { ...wallet, user_id: userId };
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/wallets`, body, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateWallet(walletId: number, wallet: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/wallets/${walletId}`, wallet, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteWallet(walletId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/wallets/${walletId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  addTransaction(transaction: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/transactions`, transaction, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getTransactions(userId: number, filters?: any): Observable<ApiResponse<any[]>> {
    let params = new HttpParams().set('user_id', userId.toString());
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          params = params.set(key, filters[key].toString());
        }
      });
    }
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/transactions`, { headers: this.getHeaders(), params })
      .pipe(catchError(this.handleError));
  }

  getTodaysExpenses(userId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/transactions/today?user_id=${userId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getUserSettings(userId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/user-settings?user_id=${userId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateDailyBudget(userId: number, dailyBudget: number): Observable<ApiResponse<any>> {
    const body = { user_id: userId, daily_budget: dailyBudget };
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/user-settings/daily-budget`, body, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }
}