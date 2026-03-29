'use client';
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthMode } from '@/types/auth.types';

interface RegisterFormProps {
  onModeChange:  (mode: AuthMode) => void;
  onNeedsOTP:    (email: string) => void;
}

const getStrength = (pwd: string): number => {
  let score = 0;
  if (pwd.length >= 8)          score++;
  if (/[A-Z]/.test(pwd))        score++;
  if (/[0-9]/.test(pwd))        score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};
const STRENGTH_LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['#e8e0d4', '#dc2626', '#d97706', '#2563eb', '#059669'];

const RegisterForm: React.FC<RegisterFormProps> = ({ onModeChange, onNeedsOTP }) => {
  const { register, isLoading } = useAuth();

  const [role,       setRole]       = useState<'buyer' | 'agent' | null>(null);
  const [name,       setName]       = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [email,      setEmail]      = useState('');
  const [phone,      setPhone]      = useState('');
  const [reraId,     setReraId]     = useState('');
  const [password,   setPassword]   = useState('');
  const [showPwd,    setShowPwd]    = useState(false);
  const [agreed,     setAgreed]     = useState(false);
  const [errors,     setErrors]     = useState<Record<string, string>>({});
  const [formError,  setFormError]  = useState('');

  const strength = getStrength(password);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim())                              errs.name     = 'Full name is required.';
    if (role === 'agent' && !agencyName.trim())    errs.agency   = 'Agency name is required.';
    if (!email.includes('@') || !email.includes('.')) errs.email = 'Enter a valid email.';
    if (phone && !/^\d{10}$/.test(phone))          errs.phone    = 'Enter a valid 10-digit number.';
    if (password.length < 6)                       errs.password = 'Password must be at least 6 characters.';
    if (!agreed)                                   errs.terms    = 'Please accept the terms to continue.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setFormError('');
    const result = await register({
      name, email, password,
      phone: phone ? `+91${phone}` : undefined,
      role,
      agencyName: role === 'agent' ? agencyName : undefined,
    });

    if (result.success && result.needsOTP) {
      onNeedsOTP(email);
    } else {
      setFormError(result.error || 'Registration failed. Please try again.');
    }
  };

  const err = (key: string) => errors[key]
    ? <span className="field-error">{errors[key]}</span>
    : null;

  /* Step 1 — Role selector */
  if (!role) {
    return (
      <div className="auth-form">
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">How would you like to use EstateVision?</p>

        <div className="role-grid">
          <button
            type="button"
            className="role-card"
            onClick={() => setRole('buyer')}
          >
            <div className="role-card-icon">🏠</div>
            <div className="role-card-title">I'm a Buyer</div>
            <div className="role-card-sub">Looking to buy or rent</div>
          </button>
          <button
            type="button"
            className="role-card"
            onClick={() => setRole('agent')}
          >
            <div className="role-card-icon">🏢</div>
            <div className="role-card-title">I'm an Agent</div>
            <div className="role-card-sub">I represent an agency</div>
          </button>
        </div>

        <p className="auth-switch">
          Already have an account?{' '}
          <button className="auth-link" onClick={() => onModeChange('login')}>Log in</button>
        </p>
      </div>
    );
  }

  /* Step 2 — Registration form */
  return (
    <div className="auth-form">
      <div className="auth-back-row">
        <button type="button" className="auth-link" onClick={() => setRole(null)}>
          ← Back
        </button>
        <span className="auth-role-tag">
          {role === 'agent' ? '🏢 Agent' : '🏠 Buyer'}
        </span>
      </div>
      <h2 className="auth-title">Create account</h2>
      <p className="auth-subtitle">Free forever. No credit card needed.</p>

      {formError && <div className="auth-error-banner">{formError}</div>}

      <form onSubmit={handleSubmit} noValidate>
        {/* Full name */}
        <div className="field" style={{ marginBottom: 14 }}>
          <label className="label">Full Name *</label>
          <input
            type="text"
            className={`input ${errors.name ? 'input-error' : ''}`}
            placeholder="Rahul Nayak"
            value={name}
            onChange={e => { setName(e.target.value); if (errors.name) setErrors(p => ({ ...p, name: '' })); }}
          />
          {err('name')}
        </div>

        {/* Agency name (agent only) */}
        {role === 'agent' && (
          <div className="field" style={{ marginBottom: 14 }}>
            <label className="label">Agency / Company Name *</label>
            <input
              type="text"
              className={`input ${errors.agency ? 'input-error' : ''}`}
              placeholder="Sharma Realty"
              value={agencyName}
              onChange={e => { setAgencyName(e.target.value); if (errors.agency) setErrors(p => ({ ...p, agency: '' })); }}
            />
            {err('agency')}
          </div>
        )}

        {/* Email */}
        <div className="field" style={{ marginBottom: 14 }}>
          <label className="label">Email Address *</label>
          <input
            type="email"
            className={`input ${errors.email ? 'input-error' : ''}`}
            placeholder="you@example.com"
            value={email}
            autoComplete="email"
            onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: '' })); }}
          />
          {err('email')}
        </div>

        {/* Phone */}
        <div className="field" style={{ marginBottom: 14 }}>
          <label className="label">Phone {role === 'agent' ? '*' : ''}</label>
          <div className="input-prefix-wrap">
            <span className="input-prefix">+91</span>
            <input
              type="tel"
              className={`input input-prefixed ${errors.phone ? 'input-error' : ''}`}
              placeholder="9876543210"
              maxLength={10}
              value={phone}
              onChange={e => {
                const v = e.target.value.replace(/\D/g, '');
                setPhone(v);
                if (errors.phone) setErrors(p => ({ ...p, phone: '' }));
              }}
            />
          </div>
          {err('phone')}
        </div>

        {/* RERA ID (agent only, optional) */}
        {role === 'agent' && (
          <div className="field" style={{ marginBottom: 14 }}>
            <label className="label">RERA Registration ID</label>
            <input
              type="text"
              className="input"
              placeholder="RERA/AG/OD/2019/001234 — optional"
              value={reraId}
              onChange={e => setReraId(e.target.value)}
            />
            <span style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3, display: 'block' }}>
              You can add this later from your profile settings.
            </span>
          </div>
        )}

        {/* Password */}
        <div className="field" style={{ marginBottom: 14 }}>
          <label className="label">Password *</label>
          <div className="input-wrap">
            <input
              type={showPwd ? 'text' : 'password'}
              className={`input ${errors.password ? 'input-error' : ''}`}
              placeholder="Create a strong password"
              value={password}
              autoComplete="new-password"
              onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: '' })); }}
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
          {password.length > 0 && (
            <>
              <div className="strength-bar">
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="strength-seg"
                    style={{ background: i < strength ? STRENGTH_COLORS[strength] : undefined }}
                  />
                ))}
              </div>
              <span style={{ fontSize: 11, color: STRENGTH_COLORS[strength] }}>
                {STRENGTH_LABELS[strength]}
              </span>
            </>
          )}
          {err('password')}
        </div>

        {/* Terms */}
        <div className="field" style={{ marginBottom: 20 }}>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => { setAgreed(e.target.checked); if (errors.terms) setErrors(p => ({ ...p, terms: '' })); }}
            />
            <span>I agree to the <button type="button" className="auth-link">Terms of Service</button> and <button type="button" className="auth-link">Privacy Policy</button></span>
          </label>
          {err('terms')}
        </div>

        <button type="submit" className="btn btn-gold btn-full" disabled={isLoading}>
          {isLoading ? 'Creating account…' : 'Create Account →'}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account?{' '}
        <button className="auth-link" onClick={() => onModeChange('login')}>Log in</button>
      </p>
    </div>
  );
};

export default RegisterForm;
