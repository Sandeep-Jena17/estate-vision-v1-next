'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AuthMode } from '@/types/auth.types';
import LoginForm          from '@/components/auth/LoginForm';
import RegisterForm       from '@/components/auth/RegisterForm';
import OTPForm            from '@/components/auth/OTPForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import ResetPasswordForm  from '@/components/auth/ResetPasswordForm';

const FEATURES = [
  { icon: '🏠', title: '10,000+ Verified Listings',  sub: 'Across Bhubaneswar & Odisha'          },
  { icon: '🗺️', title: 'Interactive Maps',            sub: 'Distances to schools, hospitals, IT'  },
  { icon: '🤖', title: 'AI Property Assistant',       sub: 'Instant valuations & recommendations' },
  { icon: '📅', title: 'Book Instant Visits',         sub: 'Confirmed by agent within the hour'   },
];

const AuthPage: React.FC = () => {
  const router        = useRouter();
  const params        = useSearchParams();
  const { isLoggedIn, user } = useAuth();

  const initialMode = (params.get('mode') as AuthMode) || 'login';
  const [mode,         setMode]        = useState<AuthMode>(initialMode);
  const [otpEmail,     setOtpEmail]    = useState('');
  const [resetEmail,   setResetEmail]  = useState('');

  /* Redirect already-logged-in users to their role dashboard */
  useEffect(() => {
    if (isLoggedIn && user) {
      const saved = localStorage.getItem('ev_redirect');
      localStorage.removeItem('ev_redirect');
      const roleFallback =
        user.role === 'admin' ? '/admin' :
        user.role === 'agent' ? '/agent' :
        '/dashboard';
      router.replace(saved || roleFallback);
    }
  }, [isLoggedIn, user, router]);

  /* Sync URL param → mode */
  useEffect(() => {
    const m = params.get('mode') as AuthMode;
    if (m) setMode(m);
  }, [params]);

  /* After login/register success — route by role */
  const handleSuccess = (role: string) => {
    const saved = localStorage.getItem('ev_redirect');
    localStorage.removeItem('ev_redirect');
    if (role === 'admin') {
      router.replace(saved?.startsWith('/admin') ? saved : '/admin');
    } else if (role === 'agent') {
      router.replace(saved?.startsWith('/agent') ? saved : '/agent');
    } else {
      router.replace(saved || '/dashboard');
    }
  };

  const handleModeChange = (next: AuthMode, email?: string) => {
    if (next === 'resetPassword' && email) setResetEmail(email);
    setMode(next);
  };

  const handleNeedsOTP = (email: string) => {
    setOtpEmail(email);
    setMode('confirmOTP');
  };

  return (
    <div className="auth-page">
      {/* ── Left panel ──────────────────────────────── */}
      <div className="auth-left">
        <div className="auth-left-bg" />
        <div className="auth-left-content">
          {/* Logo */}
          <button className="auth-logo" onClick={() => router.push('/')}> 
            <span className="dot" />
            EstateVision
          </button>

          {/* Headline */}
          <div className="auth-headline">
            <h1>Find Your<br /><span className="auth-headline-gold">Dream Home</span><br />in Odisha</h1>
            <p>Premium real estate. Trusted agents. AI-powered search.</p>
          </div>

          {/* Features */}
          <ul className="auth-features">
            {FEATURES.map(f => (
              <li key={f.title} className="auth-feature-item">
                <span className="auth-feature-icon">{f.icon}</span>
                <div>
                  <div className="auth-feature-title">{f.title}</div>
                  <div className="auth-feature-sub">{f.sub}</div>
                </div>
              </li>
            ))}
          </ul>

          {/* Trust badges */}
          <div className="auth-trust">
            <span className="auth-trust-badge">🔒 SSL Secured</span>
            <span className="auth-trust-badge">✅ RERA Verified</span>
            <span className="auth-trust-badge">⭐ 4.9 Rating</span>
          </div>
        </div>
      </div>

      {/* ── Right panel ───────────────────────────── */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          {/* Back to home (mobile visible) */}
          <button
            className="auth-back-home"
            onClick={() => router.push('/')}
          >
            ← EstateVision
          </button>

          {/* Render active form */}
          {mode === 'login' && (
            <LoginForm
              onModeChange={handleModeChange}
              onSuccess={handleSuccess}
            />
          )}
          {mode === 'register' && (
            <RegisterForm
              onModeChange={handleModeChange}
              onNeedsOTP={handleNeedsOTP}
            />
          )}
          {mode === 'confirmOTP' && (
            <OTPForm
              email={otpEmail}
              onSuccess={handleSuccess}
              onBack={() => setMode('login')}
            />
          )}
          {mode === 'forgotPassword' && (
            <ForgotPasswordForm onModeChange={handleModeChange} />
          )}
          {mode === 'resetPassword' && (
            <ResetPasswordForm
              email={resetEmail || localStorage.getItem('ev_reset_email') || ''}
              onModeChange={handleModeChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
