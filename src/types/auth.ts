export interface LoginRequest {
  email?: string;
  username?: string;
  password: string;
}

export interface LoginResponse {
  username: string;
  email: string;
  role: string;
  token: string;
}

export interface User {
  username: string;
  email: string;
  role: string;
}

export interface UserResponse {
  status: number;
  message: string;
  data: User;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
  message?: string;
}