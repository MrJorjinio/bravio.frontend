'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authService } from '@/services';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import styles from './forgot-password.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setIsSuccess(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={styles.container}>
        <div className={styles.formPanel}>
          <div className={styles.formContainer}>
            <div className={styles.successState}>
              <div className={styles.successIcon}>
                <CheckCircle size={48} />
              </div>
              <h1>Check Your Email</h1>
              <p>
                We&apos;ve sent a password reset link to <strong>{email}</strong>.
                Click the link in the email to reset your password.
              </p>
              <p className={styles.subtext}>
                Didn&apos;t receive the email? Check your spam folder or try again.
              </p>
              <div className={styles.successActions}>
                <button
                  className={styles.btnSecondary}
                  onClick={() => setIsSuccess(false)}
                >
                  Try Different Email
                </button>
                <Link href="/login" className={styles.btnPrimary}>
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          <Link href="/login" className={styles.backLink}>
            <ArrowLeft size={16} />
            Back to login
          </Link>

          <div className={styles.formHeader}>
            <div className={styles.headerIcon}>
              <Mail size={32} />
            </div>
            <h1>Forgot Password?</h1>
            <p>No worries, we&apos;ll send you reset instructions.</p>
          </div>

          {error && (
            <div className={styles.errorMessage}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                className={styles.formInput}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className={styles.btnSubmit} disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <p className={styles.footerText}>
            Remember your password? <Link href="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
