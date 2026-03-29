'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface OTPFormProps {
  email:     string;
  onSuccess: (role: string) => void;
  onBack:    () => void;
}

const OTP_LENGTH = 6;
const RESEND_SECONDS = 59;

const OTPForm: React.FC<OTPFormProps> = ({ email, onSuccess, onBack }) => {
  const { confirmOTP, resendOTP, isLoading } = useAuth();

  const [digits,    setDigits]    = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [timer,     setTimer]     = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [formError, setFormError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* Countdown timer */
  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  /* Focus first box on mount */
  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  const submit = useCallback(async (otp: string) => {
    setFormError('');
    const result = await confirmOTP(email, otp);
    if (result.success) {
      onSuccess(result.role ?? 'buyer');
    } else {
      setFormError(result.error || 'Invalid OTP. Please try again.');
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }
  }, [confirmOTP, email, onSuccess]);

  const handleChange = (idx: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next  = [...digits];
    next[idx]   = digit;
    setDigits(next);
    setFormError('');

    if (digit && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
    if (next.every(d => d !== '')) {
      submit(next.join(''));
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text   = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const filled = Array(OTP_LENGTH).fill('');
    text.split('').forEach((d, i) => { filled[i] = d; });
    setDigits(filled);
    const focusIdx = Math.min(text.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
    if (text.length === OTP_LENGTH) submit(text);
  };

  const handleResend = async () => {
    setTimer(RESEND_SECONDS);
    setCanResend(false);
    setDigits(Array(OTP_LENGTH).fill(''));
    setFormError('');
    inputRefs.current[0]?.focus();
    const result = await resendOTP(email);
    if (!result.success) setFormError(result.error || 'Failed to resend code.');
  };

  const maskedEmail = email.replace(/(.{2}).+(@.+)/, '$1•••$2');

  return (
    <div className="auth-form">
      <div className="otp-icon">📬</div>
      <h2 className="auth-title">Check your email</h2>
      <p className="auth-subtitle">
        We sent a 6-digit code to <strong>{maskedEmail}</strong>
      </p>

      {formError && <div className="auth-error-banner">{formError}</div>}

      <div className="otp-grid" onPaste={handlePaste}>
        {digits.map((d, idx) => (
          <input
            key={idx}
            ref={el => { inputRefs.current[idx] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            className={`otp-box ${d ? 'filled' : ''}`}
            value={d}
            onChange={e => handleChange(idx, e.target.value)}
            onKeyDown={e => handleKeyDown(idx, e)}
            aria-label={`OTP digit ${idx + 1}`}
            disabled={isLoading}
          />
        ))}
      </div>

      {isLoading && (
        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>
          Verifying…
        </p>
      )}

      {/* Resend */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        {canResend ? (
          <button type="button" className="auth-link" onClick={handleResend}>
            Resend Code
          </button>
        ) : (
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>
            Resend in {timer}s
          </span>
        )}
      </div>

      <button type="button" className="auth-link" onClick={onBack}
        style={{ display: 'block', textAlign: 'center', width: '100%' }}
      >
        ← Back to login
      </button>
    </div>
  );
};

export default OTPForm;
