'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { login, googleLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid email or password. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setError('');
    setIsGoogleLoading(true);
    try {
      console.log('Google credential received, calling backend...');
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }
      await googleLogin({ credential: credentialResponse.credential });
      router.push('/dashboard');
    } catch (err: unknown) {
      console.error('Backend Google auth error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Google sign-in failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Google login failed');
    setError('Google sign-in failed. Please try again.');
  };

  return (
    <div className={styles.container}>
      {/* Left Panel - Branding */}
      <div className={styles.brandPanel}>
        <div className={styles.brandContent}>
          <div className={styles.brandLogo}>
            <div className={styles.logoIcon}>
              <Image src="/images/bravio-logo.png" alt="Bravio" width={70} height={70} />
            </div>
            <span className={styles.logoText}>Bravio</span>
          </div>
          <h2 className={styles.brandTagline}>Learn Smarter,<br />Not Harder</h2>
          <p className={styles.brandDescription}>Transform complex content into clear summaries, key points, and interactive flashcards with AI. Master any subject faster.</p>

          <div className={styles.floatingCards}>
            <div className={`${styles.mockCard} ${styles.mockCard3}`}>
              <div className={styles.mockCardLabel}>Key Points</div>
              <div className={styles.mockCardText}>3 main concepts extracted</div>
            </div>
            <div className={`${styles.mockCard} ${styles.mockCard2}`}>
              <div className={styles.mockCardLabel}>Summary</div>
              <div className={styles.mockCardText}>Concise overview generated...</div>
            </div>
            <div className={`${styles.mockCard} ${styles.mockCard1}`}>
              <div className={styles.mockCardLabel}>Flashcard 1 of 5</div>
              <div className={styles.mockCardText}>What is the primary function of mitochondria in a cell?</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          <Link href="/" className={styles.backLink}>
            <span>←</span> Back to home
          </Link>

          <div className={styles.formHeader}>
            <h1>Welcome Back</h1>
            <p>Don&apos;t have an account? <Link href="/register">Sign up free</Link></p>
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

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="password">Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={styles.formInput}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span>{showPassword ? '👁' : '👁‍🗨'}</span>
                </button>
              </div>
            </div>

            <div className={styles.formRow}>
              <label className={styles.checkboxWrapper}>
                <input
                  type="checkbox"
                  className={styles.checkboxInput}
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className={styles.checkboxCustom}></span>
                <span className={styles.checkboxLabel}>Remember me</span>
              </label>
              <Link href="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
            </div>

            <button type="submit" className={styles.btnSubmit} disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
              {!isLoading && <span>→</span>}
            </button>
          </form>

          <div className={styles.divider}>
            <span>or continue with</span>
          </div>

          <div className={styles.socialButtons}>
            {isGoogleLoading ? (
              <div className={styles.btnSocial} style={{ justifyContent: 'center' }}>
                Signing in...
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                size="large"
                width="100%"
                text="signin_with"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
