export interface User {
  id: number;
  email: string;
  husbandEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  husbandEmail: string;
  startDate?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface Period {
  id: number;
  userId: number;
  startDate: string;
  endDate?: string;
  nextPeriodDate: string;
  reminderDate: string;
  isNotified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePeriodRequest {
  startDate: string;
  endDate?: string;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
}
