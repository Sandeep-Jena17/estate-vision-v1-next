'use client';
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthMode } from '@/types/auth.types';

interface LoginFormProps {
  onModeChange: (mode: AuthMode) => void;
  onSuccess:    (role: string) => void;
}

const DEMO_ACCOUNTS = [
  { icon: '👑', label: 'Admin',  email: 'jenasandeep595@gmail.com' },
  { icon: '🏢', label: 'Agent',  email: 'agent@demo.com'           },
  { icon: '🏠', label: 'Buyer',  email: 'buyer@demo.com'           },
];

const LoginForm: React.FC<LoginFormProps> = ({ onModeChange, onSuccess }) => {
  const { login, completeNewPassword, isLoading } = useAuth();

  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPwd,     setShowPwd]     = useState(false);
  const [showDemo,    setShowDemo]    = useState(false);
  const [emailErr,    setEmailErr]    = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [formError,   setFormError]   = useState('');

  // For new password prompt
  const [showNewPasswordPrompt, setShowNewPasswordPrompt] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordErr, setNewPasswordErr] = useState('');

  const validateEmail = (v: string) => {
    if (!v) return 'Email is required.';
    if (!v.includes('@') || !v.includes('.')) return 'Enter a valid email address.';
    return '';
  };

  const validatePassword = (v: string) => {
    if (!v) return 'Password is required.';
    return '';
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123');
    setEmailErr('');
    setPasswordErr('');
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailErr(eErr);
    setPasswordErr(pErr);
    if (eErr || pErr) return;

    setFormError('');
    const result = await login(email, password);
    if (result.needsNewPassword) {
      setShowNewPasswordPrompt(true);
      return;
    }
    if (result.success && result.role) {
      onSuccess(result.role);
    } else {
      setFormError(result.error || 'Login failed. Please try again.');
    }
  };

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validatePassword(newPassword);
    setNewPasswordErr(err);
    if (err) return;

    setFormError('');
    const result = await completeNewPassword(newPassword);
    if (result.success && result.role) {
      onSuccess(result.role);
    } else {
      setFormError(result.error || 'Failed to set password. Please try again.');
    }
  };

  if (showNewPasswordPrompt) {
    return (
      <div className="auth-form">
        <h2 className="auth-title">Set New Password</h2>
        <p className="auth-subtitle">Your account requires a new password to continue.</p>

        {formError && <div className="auth-error-banner">{formError}</div>}

        <form onSubmit={handleNewPasswordSubmit} noValidate>
          <div className="field">
            <label className="label" htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              type="password"
              className={`input ${newPasswordErr ? 'input-error' : ''}`}
              placeholder="Enter new password"
              value={newPassword}
              onChange={e => { setNewPassword(e.target.value); if (newPasswordErr) setNewPasswordErr(''); }}
            />
            {newPasswordErr && <span className="field-error">{newPasswordErr}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-gold btn-full"
            disabled={isLoading}
          >
            {isLoading ? 'Setting password…' : 'Set Password →'}
          </button>
        </form>

        <p className="auth-switch">
          <button className="auth-link" onClick={() => setShowNewPasswordPrompt(false)}>
            Back to login
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="auth-form">
      <h2 className="auth-title">Welcome back</h2>
      <p className="auth-subtitle">Sign in to your EstateVision account</p>

      {/* Google login (coming soon) */}
      <button
        type="button"
        className="btn btn-outline btn-full google-btn"
        disabled
        title="Coming soon — Google OAuth via Cognito"
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google"
          width={18}
          height={18}
        />
        Continue with Google
        <span className="coming-soon-tag">Soon</span>
      </button>

      <div className="auth-divider"><span>or continue with email</span></div>

      {formError && <div className="auth-error-banner">{formError}</div>}

      <form onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div className="field" style={{ marginBottom: 16 }}>
          <label className="label" htmlFor="login-email">Email Address</label>
          <input
            id="login-email"
            type="email"
            className={`input ${emailErr ? 'input-error' : ''}`}
            placeholder="you@example.com"
            value={email}
            autoComplete="email"
            onChange={e => { setEmail(e.target.value); if (emailErr) setEmailErr(''); }}
            onBlur={e => setEmailErr(validateEmail(e.target.value))}
          />
          {emailErr && <span className="field-error">{emailErr}</span>}
        </div>

        {/* Password */}
        <div className="field" style={{ marginBottom: 8 }}>
          <label className="label" htmlFor="login-password">Password</label>
          <div className="input-wrap">
            <input
              id="login-password"
              type={showPwd ? 'text' : 'password'}
              className={`input ${passwordErr ? 'input-error' : ''}`}
              placeholder="Enter your password"
              value={password}
              autoComplete="current-password"
              onChange={e => { setPassword(e.target.value); if (passwordErr) setPasswordErr(''); }}
              onBlur={e => setPasswordErr(validatePassword(e.target.value))}
            />
            <button
              type="button"
              className="input-eye"
              onClick={() => setShowPwd(p => !p)}
              aria-label={showPwd ? 'Hide password' : 'Show password'}
            >
              {showPwd ? '🙈' : '👁️'}
            </button>
          </div>
          {passwordErr && <span className="field-error">{passwordErr}</span>}
        </div>

        {/* Forgot password */}
        <div style={{ textAlign: 'right', marginBottom: 20 }}>
          <button
            type="button"
            className="auth-link"
            onClick={() => onModeChange('forgotPassword')}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          className="btn btn-gold btn-full"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in…' : 'Log In →'}
        </button>
      </form>

      <p className="auth-switch">
        Don't have an account?{' '}
        <button className="auth-link" onClick={() => onModeChange('register')}>
          Create one free
        </button>
      </p>

      {/* Demo accounts */}
      <div className="demo-accounts">
        <button
          type="button"
          className="demo-accounts-header"
          onClick={() => setShowDemo(d => !d)}
        >
          <span>🔑 Demo Accounts (click to fill)</span>
          <span>{showDemo ? '▲' : '▼'}</span>
        </button>
        {showDemo && (
          <>
            {DEMO_ACCOUNTS.map(acc => (
              <div
                key={acc.email}
                className="demo-account-row"
                onClick={() => fillDemo(acc.email)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && fillDemo(acc.email)}
              >
                <span>{acc.icon}</span>
                <span className="demo-role">{acc.label}</span>
                <span className="demo-email">{acc.email}</span>
              </div>
            ))}
            <div style={{ padding: '6px 14px 10px', fontSize: 11, color: 'var(--muted)' }}>
              Password: any text works
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
