'use client';
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthMode } from '@/types/auth.types';

interface ForgotPasswordFormProps {
  onModeChange: (mode: AuthMode, email?: string) => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onModeChange }) => {
  const { forgotPassword, isLoading } = useAuth();

  const [email,     setEmail]     = useState('');
  const [emailErr,  setEmailErr]  = useState('');
  const [sent,      setSent]      = useState(false);

  const validate = (v: string) => {
    if (!v) return 'Email is required.';
    if (!v.includes('@') || !v.includes('.')) return 'Enter a valid email address.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate(email);
    setEmailErr(err);
    if (err) return;

    const result = await forgotPassword(email);
    if (result.success) setSent(true);
  };

  if (sent) {
    return (
      <div className="auth-form">
        <div className="otp-icon">✉️</div>
        <h2 className="auth-title">Check your inbox</h2>
        <p className="auth-subtitle" style={{ marginBottom: 24 }}>
          We've sent a password reset code to <strong>{email}</strong>.
          Check your spam folder if you don't see it.
        </p>
        <button
          type="button"
          className="btn btn-gold btn-full"
          onClick={() => onModeChange('resetPassword', email)}
        >
          Enter Reset Code →
        </button>
        <p className="auth-switch" style={{ marginTop: 16 }}>
          <button className="auth-link" onClick={() => onModeChange('login')}>
            ← Back to login
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="auth-form">
      <h2 className="auth-title">Forgot password?</h2>
      <p className="auth-subtitle">
        Enter your email and we'll send you a reset code.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="field" style={{ marginBottom: 20 }}>
          <label className="label" htmlFor="forgot-email">Email Address</label>
          <input
            id="forgot-email"
            type="email"
            className={`input ${emailErr ? 'input-error' : ''}`}
            placeholder="you@example.com"
            value={email}
            autoComplete="email"
            onChange={e => { setEmail(e.target.value); if (emailErr) setEmailErr(''); }}
            onBlur={e => setEmailErr(validate(e.target.value))}
          />
          {emailErr && <span className="field-error">{emailErr}</span>}
        </div>

        <button type="submit" className="btn btn-gold btn-full" disabled={isLoading}>
          {isLoading ? 'Sending…' : 'Send Reset Code →'}
        </button>
      </form>

      <p className="auth-switch">
        <button className="auth-link" onClick={() => onModeChange('login')}>
          ← Back to login
        </button>
      </p>
    </div>
  );
};

export default ForgotPasswordForm;
