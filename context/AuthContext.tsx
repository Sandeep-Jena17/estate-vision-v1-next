'use client';

/**
 * AuthContext — global auth state for EstateVision
 * Powered by AWS Cognito via amazon-cognito-identity-js
 */

import React, {
  createContext, useState, useEffect,
  useContext, useCallback, useRef,
} from 'react';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import { User, UserRole } from '@/types/auth.types';

/* ─── Cognito pool (values from .env.local) ───────────────── */
const userPool = new CognitoUserPool({
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
  ClientId:   process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
});

/* ─── Derive role from Cognito group membership ──────────── */
function groupsToRole(groups: string[]): UserRole {
  if (groups.includes('admin')) return 'admin';
  if (groups.includes('agent')) return 'agent';
  return 'buyer';
}

/* ─── Build User object from Cognito attributes ──────────── */
function buildUser(
  sub: string,
  attrs: { getName(): string; getValue(): string }[],
  groups?: string[]
): User {
  const get = (name: string) =>
    attrs.find(a => a.getName() === name)?.getValue() ?? '';
  const role: UserRole =
    groups && groups.length > 0
      ? groupsToRole(groups)
      : (get('custom:role') || 'buyer') as UserRole;
  return {
    id:            sub,
    cognitoId:     sub,
    name:          get('name'),
    email:         get('email'),
    phone:         get('phone_number') || undefined,
    role,
    agencyName:    get('custom:agencyName') || undefined,
    verified:      true,
    createdAt:     new Date().toISOString(),
    cognitoGroups: groups,
  };
}

/* ─── Friendly error messages ────────────────────────────── */
const ERROR_MESSAGES: Record<string, string> = {
  UserNotFoundException:     'No account found with this email.',
  NotAuthorizedException:    'Incorrect email or password.',
  UsernameExistsException:   'An account with this email already exists.',
  CodeMismatchException:     'Invalid OTP. Please try again.',
  ExpiredCodeException:      'OTP has expired. Please request a new one.',
  UserNotConfirmedException: 'Please verify your email before logging in.',
  LimitExceededException:    'Too many attempts. Please try again later.',
  InvalidPasswordException:  'Password does not meet the requirements.',
  InvalidParameterException: 'Please check your details and try again.',
  NetworkError:              'Network error. Please check your connection.',
};

const friendlyError = (code: string) =>
  ERROR_MESSAGES[code] ?? 'Something went wrong. Please try again.';

/* ─── Context shape ───────────────────────────────────────── */
interface AuthContextType {
  user:       User | null;
  isLoggedIn: boolean;
  isLoading:  boolean;
  error:      string | null;
  isAdmin:    boolean;
  isAgent:    boolean;
  isBuyer:    boolean;

  login: (
    email: string, password: string
  ) => Promise<{ success: boolean; role?: UserRole; needsNewPassword?: boolean; error?: string }>;

  completeNewPassword: (
    password: string
  ) => Promise<{ success: boolean; role?: UserRole; error?: string }>;

  register: (data: {
    name:        string;
    email:       string;
    password:    string;
    phone?:      string;
    role:        'buyer' | 'agent';
    agencyName?: string;
  }) => Promise<{ success: boolean; needsOTP: boolean; error?: string }>;

  confirmOTP:     (email: string, otp: string)               => Promise<{ success: boolean; role?: string; error?: string }>;
  forgotPassword: (email: string)                            => Promise<{ success: boolean; error?: string }>;
  resetPassword:  (email: string, otp: string, pwd: string)  => Promise<{ success: boolean; error?: string }>;
  resendOTP:      (email: string)                            => Promise<{ success: boolean; error?: string }>;
  logout:         () => void;
  getToken:       () => Promise<string | null>;
  clearError:     () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

/* ─── Provider ────────────────────────────────────────────── */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user,      setUser]      = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const pendingPasswordRef = useRef<string | null>(null);
  const pendingUsernameRef = useRef<string | null>(null);
  const pendingCognitoUserRef = useRef<CognitoUser | null>(null);
  const pendingUserAttributesRef = useRef<CognitoUserAttribute[] | null>(null);

  /* ── Restore session on mount ── */
  useEffect(() => {
    const currentUser = userPool.getCurrentUser();
    if (!currentUser) { setIsLoading(false); return; }
    currentUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session?.isValid()) { setIsLoading(false); return; }
      currentUser.getUserAttributes((attrErr, attrs) => {
        setIsLoading(false);
        if (attrErr || !attrs) return;
        const sub = session.getIdToken().payload.sub as string;
        const groups = session.getAccessToken().payload['cognito:groups'] as string[] | undefined;
        setUser(buildUser(sub, attrs, groups));
      });
    });
  }, []);

  /* ── LOGIN ── */
  const login = useCallback(async (
    email: string, password: string
  ): Promise<{ success: boolean; role?: UserRole; needsNewPassword?: boolean; error?: string }> => {
    setIsLoading(true); setError(null);
    return new Promise<{ success: boolean; role?: UserRole; needsNewPassword?: boolean; error?: string }>(resolve => {
      const authDetails = new AuthenticationDetails({ Username: email, Password: password });
      const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
      cognitoUser.authenticateUser(authDetails, {
        onSuccess: (session: CognitoUserSession) => {
          cognitoUser.getUserAttributes((attrErr, attrs) => {
            setIsLoading(false);
            if (attrErr || !attrs) {
              const msg = friendlyError('NetworkError');
              setError(msg); resolve({ success: false, error: msg }); return;
            }
            const sub = session.getIdToken().payload.sub as string;
            const groups = session.getAccessToken().payload['cognito:groups'] as string[] | undefined;
            const u = buildUser(sub, attrs, groups);
            setUser(u); resolve({ success: true, role: u.role });
          });
        },
        onFailure: (err: { code?: string; name?: string }) => {
          setIsLoading(false);
          const msg = friendlyError(err.code ?? err.name ?? '');
          setError(msg); resolve({ success: false, error: msg });
        },
        newPasswordRequired: (userAttributes: CognitoUserAttribute[], requiredAttributes: string[]) => {
          setIsLoading(false);
          pendingCognitoUserRef.current = cognitoUser;
          pendingUserAttributesRef.current = userAttributes || [];
          const msg = 'Please reset your password to continue.';
          setError(msg);
          resolve({ success: false, needsNewPassword: true, error: msg });
          return;
        },
      });
    });
  }, []);

  const completeNewPassword = useCallback(async (
    newPassword: string
  ): Promise<{ success: boolean; role?: UserRole; error?: string }> => {
    setIsLoading(true); setError(null);
    const cognitoUser = pendingCognitoUserRef.current;
    const userAttributes = pendingUserAttributesRef.current || [];
    if (!cognitoUser) {
      setIsLoading(false);
      const err = 'No password reset session found.';
      setError(err);
      return { success: false, error: err };
    }

    return new Promise(resolve => {
      (cognitoUser as any).completeNewPassword(newPassword, userAttributes, {
        onSuccess: (session: CognitoUserSession) => {
          cognitoUser.getUserAttributes((attrErr, attrs) => {
            setIsLoading(false);
            pendingCognitoUserRef.current = null;
            pendingUserAttributesRef.current = null;
            if (attrErr || !attrs) {
              const role = 'buyer' as UserRole;
              resolve({ success: true, role });
              return;
            }
            const sub = session.getIdToken().payload.sub as string;
            const groups = session.getAccessToken().payload['cognito:groups'] as string[] | undefined;
            const u = buildUser(sub, attrs, groups);
            setUser(u);
            resolve({ success: true, role: u.role });
          });
        },
        onFailure: (err: { code?: string; name?: string }) => {
          setIsLoading(false);
          const msg = friendlyError(err.code ?? err.name ?? '');
          setError(msg);
          resolve({ success: false, error: msg });
        },
      });
    });
  }, []);

  /* ── REGISTER ── */
  const register = useCallback(async (data: {
    name: string; email: string; password: string;
    phone?: string; role: 'buyer' | 'agent'; agencyName?: string;
  }): Promise<{ success: boolean; needsOTP: boolean; error?: string }> => {
    setIsLoading(true); setError(null);
    pendingPasswordRef.current = data.password;

    const attrs: CognitoUserAttribute[] = [
      new CognitoUserAttribute({ Name: 'name',        Value: data.name  }),
      new CognitoUserAttribute({ Name: 'email',       Value: data.email }),
      new CognitoUserAttribute({ Name: 'custom:role', Value: data.role  }),
    ];
    if (data.phone)      attrs.push(new CognitoUserAttribute({ Name: 'phone_number',      Value: data.phone       }));
    if (data.agencyName) attrs.push(new CognitoUserAttribute({ Name: 'custom:agencyName', Value: data.agencyName! }));

    const username = `ev_${data.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}`;

    return new Promise(resolve => {
      userPool.signUp(username, data.password, attrs, [], (err, result) => {
        setIsLoading(false);
        if (err) {
          const msg = friendlyError((err as { code?: string }).code ?? err.name ?? '');
          setError(msg);
          pendingPasswordRef.current = null;
          pendingUsernameRef.current = null;
          resolve({ success: false, needsOTP: false, error: msg }); return;
        }
        pendingUsernameRef.current = result?.user.getUsername() ?? username;
        resolve({ success: true, needsOTP: !(result?.userConfirmed ?? false) });
      });
    });
  }, []);

  /* ── CONFIRM OTP ── */
  const confirmOTP = useCallback(async (
    email: string, otp: string
  ): Promise<{ success: boolean; role?: string; error?: string }> => {
    setIsLoading(true); setError(null);
    const usernameForConfirm = pendingUsernameRef.current ?? email;
    const cognitoUser = new CognitoUser({ Username: usernameForConfirm, Pool: userPool });

    return new Promise(resolve => {
      cognitoUser.confirmRegistration(otp, true, err => {
        if (err) {
          pendingUsernameRef.current = null; setIsLoading(false);
          const msg = friendlyError((err as { code?: string }).code ?? err.name ?? '');
          setError(msg); resolve({ success: false, error: msg }); return;
        }
        const storedPw = pendingPasswordRef.current;
        if (!storedPw) { setIsLoading(false); resolve({ success: true, role: 'buyer' }); return; }

        const authDetails = new AuthenticationDetails({ Username: email, Password: storedPw });
        cognitoUser.authenticateUser(authDetails, {
          onSuccess: (session: CognitoUserSession) => {
            cognitoUser.getUserAttributes((attrErr, attrs) => {
              pendingPasswordRef.current = null; pendingUsernameRef.current = null; setIsLoading(false);
              if (attrErr || !attrs) { resolve({ success: true, role: 'buyer' }); return; }
              const sub = session.getIdToken().payload.sub as string;
              const groups = session.getAccessToken().payload['cognito:groups'] as string[] | undefined;
              const u = buildUser(sub, attrs, groups);
              setUser(u); resolve({ success: true, role: u.role });
            });
          },
          onFailure: () => {
            pendingPasswordRef.current = null; pendingUsernameRef.current = null; setIsLoading(false);
            resolve({ success: true, role: 'buyer' });
          },
        });
      });
    });
  }, []);

  /* ── RESEND OTP ── */
  const resendOTP = useCallback(async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    const username = pendingUsernameRef.current ?? email;
    const cognitoUser = new CognitoUser({ Username: username, Pool: userPool });
    return new Promise(resolve => {
      cognitoUser.resendConfirmationCode(err => {
        if (err) { resolve({ success: false, error: friendlyError((err as { code?: string }).code ?? err.name ?? '') }); return; }
        resolve({ success: true });
      });
    });
  }, []);

  /* ── FORGOT PASSWORD ── */
  const forgotPassword = useCallback(async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true); setError(null);
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
    return new Promise(resolve => {
      cognitoUser.forgotPassword({
        onSuccess: () => {
          localStorage.setItem('ev_reset_email', email);
          setIsLoading(false); resolve({ success: true });
        },
        onFailure: (err: { code?: string; name?: string }) => {
          setIsLoading(false);
          const msg = friendlyError(err.code ?? err.name ?? '');
          setError(msg); resolve({ success: false, error: msg });
        },
      });
    });
  }, []);

  /* ── RESET PASSWORD ── */
  const resetPassword = useCallback(async (
    email: string, otp: string, newPwd: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true); setError(null);
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
    return new Promise(resolve => {
      cognitoUser.confirmPassword(otp, newPwd, {
        onSuccess: () => {
          localStorage.removeItem('ev_reset_email');
          setIsLoading(false); resolve({ success: true });
        },
        onFailure: (err: { code?: string; name?: string }) => {
          setIsLoading(false);
          const msg = friendlyError(err.code ?? err.name ?? '');
          setError(msg); resolve({ success: false, error: msg });
        },
      });
    });
  }, []);

  /* ── LOGOUT ── */
  const logout = useCallback(() => {
    const currentUser = userPool.getCurrentUser();
    if (currentUser) currentUser.signOut();
    setUser(null);
  }, []);

  /* ── GET TOKEN ── */
  const getToken = useCallback((): Promise<string | null> => {
    return new Promise(resolve => {
      const currentUser = userPool.getCurrentUser();
      if (!currentUser) return resolve(null);
      currentUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session?.isValid()) return resolve(null);
        resolve(session.getIdToken().getJwtToken());
      });
    });
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value: AuthContextType = {
    user,
    isLoggedIn: !!user,
    isLoading,
    error,
    isAdmin: user?.role === 'admin',
    isAgent: user?.role === 'agent' || user?.role === 'admin',
    isBuyer: !!user,
    login, completeNewPassword, register, confirmOTP, forgotPassword, resetPassword,
    resendOTP, logout, getToken, clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/* ─── Hook ── */
export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
};
