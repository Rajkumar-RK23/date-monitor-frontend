import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
  User,
  LoginRequest,
  SignupRequest,
  ChangePasswordRequest,
} from '../models';
import { ApiService } from './api.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // private currentUserSubject = new BehaviorSubject<User | null>(null);
  // public currentUser$ = this.currentUserSubject.asObservable();

  // private isAuthenticatedSubject = new BehaviorSubject<boolean>(
  //   this.hasToken(),
  // );
  // public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // private tokenKey = 'auth_token';

  // constructor(private apiService: ApiService, private router: Router) {
  //   this.loadUser();
  // }

  // /**
  //  * Check if token exists in localStorage
  //  */
  // hasToken(): boolean {
  //   return !!localStorage.getItem(this.tokenKey);
  // }

  // /**
  //  * Get token from localStorage
  //  */
  // getToken(): string | null {
  //   return localStorage.getItem(this.tokenKey);
  // }

  // /**
  //  * Set token in localStorage
  //  */
  // setToken(token: string): void {
  //   localStorage.setItem(this.tokenKey, token);
  //   this.isAuthenticatedSubject.next(true);
  // }

  // /**
  //  * Remove token from localStorage
  //  */
  // clearToken(): void {
  //   localStorage.removeItem(this.tokenKey);
  //   this.currentUserSubject.next(null);
  //   this.isAuthenticatedSubject.next(false);
  // }

  // /**
  //  * Load user from localStorage (for page refresh)
  //  */
  // private loadUser(): void {
  //   if (this.hasToken()) {
  //     this.fetchProfile();
  //   }
  // }
  private platformId = inject(PLATFORM_ID);

  private tokenKey = 'auth_token';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    this.initAuthState();
  }

  // ✅ SAFE INIT
  private initAuthState(): void {
    if (this.isBrowser()) {
      const token = this.getToken();
      this.isAuthenticatedSubject.next(!!token);

      if (token) {
        this.loadUser();
      }
    }
  }

  // ✅ CHECK BROWSER
  private isBrowser(): boolean {
    console.log('this.platformId:', this.platformId)
    return isPlatformBrowser(this.platformId);
  }

  // -------------------------
  // TOKEN METHODS (SAFE)
  // -------------------------

  hasToken(): boolean {
    if (!this.isBrowser()) return false;
    return !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    console.log('this.isBrowser():', this.isBrowser())
    if (!this.isBrowser()) return null;
    console.log('this.tokenKey:', this.tokenKey)
    console.log('localStorage.getItem(this.tokenKey):', localStorage.getItem(this.tokenKey))
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    console.log('setToken:', token)
    if (this.isBrowser()) {
      console.log('this.tokenKey:', this.tokenKey)
      localStorage.setItem(this.tokenKey, token);
    }
    this.isAuthenticatedSubject.next(true);
  }

  clearToken(): void {
    console.log('clearToken:')
    if (this.isBrowser()) {
      localStorage.removeItem(this.tokenKey);
    }
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  // -------------------------
  // USER
  // -------------------------

  private loadUser(): void {
    this.fetchProfile();
  }
  /**
   * Fetch user profile from backend
   */
  fetchProfile(): void {
    console.log('fetchProfile:')
    this.apiService.getProfile().subscribe({
      next: (user) => {
        console.log('user:', user)
        this.currentUserSubject.next(user);
      },
      error: () => {
        this.clearToken();
        this.router.navigate(['/login']);
      },
    });
  }

  /**
   * User signup
   */
  signup(data: SignupRequest): Observable<any> {
    return this.apiService.signup(data).pipe(
      tap((response) => {
        this.setToken(response.access_token);
        this.currentUserSubject.next(response.user);
      }),
    );
  }

  /**
   * User login
   */
  login(data: LoginRequest): Observable<any> {
    return this.apiService.login(data).pipe(
      tap((response) => {
        this.setToken(response.access_token);
        this.currentUserSubject.next(response.user);
      }),
    );
  }

  /**
   * User logout
   */
  logout(): void {
    console.log('logout:')
    this.clearToken();
    this.router.navigate(['/login']);
  }

  /**
   * Change password
   */
  changePassword(data: ChangePasswordRequest): Observable<any> {
    return this.apiService.changePassword(data);
  }

  updateProfile(data: Partial<User>): Observable<any> {
    return this.apiService.updateProfile(data).pipe(
      tap((response:any) => {
        // update local user
        const user = response.data;
        if (user) this.currentUserSubject.next(user);
      }),
    );
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}
