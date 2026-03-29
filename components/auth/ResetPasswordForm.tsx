'use client';
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthMode } from '@/types/auth.types';

interface ResetPasswordFormProps {
  email:        string;
  onModeChange: (mode: AuthMode) => void;
}

const getStrength = (pwd: string): number => {
  let s = 0;
  if (pwd.length >= 8)          s++;
  if (/[A-Z]/.test(pwd))        s++;
  if (/[0-9]/.test(pwd))        s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
};
const STRENGTH_COLORS = ['#e8e0d4', '#dc2626', '#d97706', '#2563eb', '#059669'];

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ email, onModeChange }) => {
  const { resetPassword, isLoading } = useAuth();

  const [otp,       setOtp]       = useState('');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [errors,    setErrors]    = useState<Record<string, string>>({});
  const [success,   setSuccess]   = useState(false);
  const [formError, setFormError] = useState('');

  const strength = getStrength(password);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!/^\d{6}$/.test(otp))          e.otp      = 'Enter the 6-digit code from your email.';
    if (password.length < 6)           e.password = 'Password must be at least 6 characters.';
    if (password !== confirm)          e.confirm  = 'Passwords do not match.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setFormError('');
    const result = await resetPassword(email, otp, password);
    if (result.success) {
      setSuccess(true);
    } else {
      setFormError(result.error || 'Something went wrong. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="auth-form">
        <div className="otp-icon">✅</div>
        <h2 className="auth-title">Password updated!</h2>
        <p className="auth-subtitle" style={{ marginBottom: 24 }}>
          Your password has been reset successfully. You can now log in with your new password.
        </p>
        <button
          type="button"
          className="btn btn-gold btn-full"
          onClick={() => onModeChange('login')}
        >
          Go to Login →
        </button>
      </div>
    );
  }

  return (
    <div className="auth-form">
      <h2 className="auth-title">Reset password</h2>
      <p className="auth-subtitle">
        Enter the code sent to <strong>{email}</strong> and set a new password.
      </p>

      {formError && <div className="auth-error-banner">{formError}</div>}

      <form onSubmit={handleSubmit} noValidate>
        {/* OTP */}
        <div className="field" style={{ marginBottom: 14 }}>
          <label className="label">Reset Code</label>
          <input
            type="text"
            inputMode="numeric"
            className={`input ${errors.otp ? 'input-error' : ''}`}
            placeholder="6-digit code"
            maxLength={6}
            value={otp}
            onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); if (errors.otp) setErrors(p => ({ ...p, otp: '' })); }}
          />
          {errors.otp && <span className="field-error">{errors.otp}</span>}
        </div>

        {/* New password */}
        <div className="field" style={{ marginBottom: 14 }}>
          <label className="label">New Password</label>
          <div className="input-wrap">
            <input
              type={showPwd ? 'text' : 'password'}
              className={`input ${errors.password ? 'input-error' : ''}`}
              placeholder="Create a strong password"
              value={password}
              autoComplete="new-password"
              onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: '' })); }}
            />
            <button type="button" className="input-eye" onClick={() => setShowPwd(p => !p)}>
              {showPwd ? '🙈' : '👁️'}
            </button>
          </div>
          {password.length > 0 && (
            <>
              <div className="strength-bar">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="strength-seg"
                    style={{ background: i < strength ? STRENGTH_COLORS[strength] : undefined }} />
                ))}
              </div>
            </>
          )}
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        {/* Confirm password */}
        <div className="field" style={{ marginBottom: 20 }}>
          <label className="label">Confirm New Password</label>
          <input
            type={showPwd ? 'text' : 'password'}
            className={`input ${errors.confirm ? 'input-error' : ''}`}
            placeholder="Repeat your new password"
            value={confirm}
            autoComplete="new-password"
            onChange={e => { setConfirm(e.target.value); if (errors.confirm) setErrors(p => ({ ...p, confirm: '' })); }}
          />
          {errors.confirm && <span className="field-error">{errors.confirm}</span>}
        </div>

        <button type="submit" className="btn btn-gold btn-full" disabled={isLoading}>
          {isLoading ? 'Updating…' : 'Update Password →'}
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

export default ResetPasswordForm;
