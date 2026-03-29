/**
 * Auth types for EstateVision
 * Mirrors AWS Cognito group names exactly
 */

export type UserRole = 'admin' | 'agent' | 'buyer';

export interface User {
  id:              string;
  name:            string;
  email:           string;
  phone?:          string;
  role:            UserRole;
  avatar?:         string;
  verified:        boolean;
  createdAt:       string;
  // Agent-specific
  agencyName?:     string;
  reraId?:         string;
  // Cognito fields (populated when AWS is connected)
  cognitoId?:      string;
  cognitoGroups?:  string[];
}

export interface AuthState {
  user:       User | null;
  isLoggedIn: boolean;
  isLoading:  boolean;
  error:      string | null;
}

export type AuthMode =
  | 'login'
  | 'register'
  | 'confirmOTP'
  | 'forgotPassword'
  | 'resetPassword';
