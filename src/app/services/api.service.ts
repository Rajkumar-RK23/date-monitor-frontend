import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  User,
  AuthResponse,
  LoginRequest,
  SignupRequest,
  ChangePasswordRequest,
  Period,
  CreatePeriodRequest,
  ApiResponse,
} from '../models';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ==================== Auth Endpoints ====================
  signup(data: SignupRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/signup`, data);
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, data);
  }

  changePassword(data: ChangePasswordRequest): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(
      `${this.apiUrl}/auth/change-password`,
      data,
    );
  }

  // ==================== User Endpoints ====================
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/profile`);
  }

  updateProfile(data: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/users/profile`, data);
  }

  // ==================== Period Endpoints ====================
  createPeriod(data: CreatePeriodRequest): Observable<ApiResponse<Period>> {
    return this.http.post<ApiResponse<Period>>(
      `${this.apiUrl}/periods`,
      data,
    );
  }

  getPeriods(): Observable<ApiResponse<Period[]>> {
    return this.http.get<ApiResponse<Period[]>>(`${this.apiUrl}/periods`);
  }
}
