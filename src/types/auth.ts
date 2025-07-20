export interface AuthUser {
  isAuthenticated: boolean;
  loginTime: Date | null;
}

export interface LoginCredentials {
  password: string;
}