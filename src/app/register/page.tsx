'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services';
import styles from './register.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const { register, googleLogin } = useAuth();

  // Step: 'email' | 'otp'
  const [step, setStep] = useState<'email' | 'otp'>('email');

  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [strengthText, setStrengthText] = useState('Use 8+ characters with letters, numbers & symbols');

  const checkPasswordStrength = useCallback((pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    setPasswordStrength(strength);

    const texts = [
      'Use 8+ characters with letters, numbers & symbols',
      'Weak - Add more character types',
      'Medium - Getting better!',
      'Strong - Looking good!',
      'Very Strong - Excellent!'
    ];
    setStrengthText(texts[strength]);
  }, []);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      await authService.sendOtp({ email });
      setStep('otp');
      setSuccess('Verification code sent to your email!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send verification code. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await authService.sendOtp({ email });
      setSuccess('New verification code sent!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend code. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    if (passwordStrength < 2) {
      setError('Please choose a stronger password');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email,
        password,
        confirmPassword,
        otpCode
      });
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = (barIndex: number) => {
    if (barIndex >= passwordStrength) return '';
    if (passwordStrength <= 1) return styles.weak;
    if (passwordStrength === 2) return styles.medium;
    return styles.strong;
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
      const errorMessage = err instanceof Error ? err.message : 'Google sign-up failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Google signup failed');
    setError('Google sign-up failed. Please try again.');
  };

  return (
    <div className={styles.container}>
      {/* Left Panel - Registration Form */}
      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          <Link href="/" className={styles.backLink}>
            <span>←</span> Back to home
          </Link>

          <div className={styles.formHeader}>
            <h1>Create Account</h1>
            <p>Already have an account? <Link href="/login">Sign in</Link></p>
          </div>

          <div className={styles.bonusBadge}>
            <span className={styles.bonusBadgeIcon}>🎁</span>
            <span className={styles.bonusBadgeText}>Get <strong>150 free Broins</strong> when you sign up!</span>
          </div>

          {error && (
            <div className={styles.errorMessage}>{error}</div>
          )}

          {success && (
            <div className={styles.successMessage}>{success}</div>
          )}

          {step === 'email' ? (
            // Step 1: Email Input
            <form onSubmit={handleSendOtp}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  className={styles.formInput}
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className={styles.btnSubmit} disabled={isLoading}>
                {isLoading ? 'Sending Code...' : 'Send Verification Code'}
                {!isLoading && <span>→</span>}
              </button>
            </form>
          ) : (
            // Step 2: OTP + Password
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email Address</label>
                <div className={styles.emailDisplay}>
                  <span>{email}</span>
                  <button
                    type="button"
                    className={styles.changeEmailBtn}
                    onClick={() => { setStep('email'); setOtpCode(''); setError(''); setSuccess(''); }}
                  >
                    Change
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="otpCode">Verification Code</label>
                <input
                  type="text"
                  id="otpCode"
                  className={styles.formInput}
                  placeholder="Enter 6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                />
                <button
                  type="button"
                  className={styles.resendBtn}
                  onClick={handleResendOtp}
                  disabled={isLoading}
                >
                  Resend Code
                </button>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="password">Password</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className={styles.formInput}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={handlePasswordChange}
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
                <div className={styles.passwordStrength}>
                  <div className={`${styles.strengthBar} ${getStrengthColor(0)}`}></div>
                  <div className={`${styles.strengthBar} ${getStrengthColor(1)}`}></div>
                  <div className={`${styles.strengthBar} ${getStrengthColor(2)}`}></div>
                  <div className={`${styles.strengthBar} ${getStrengthColor(3)}`}></div>
                </div>
                <div className={styles.strengthText}>{strengthText}</div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="confirmPassword">Confirm Password</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    className={styles.formInput}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <span>{showConfirmPassword ? '👁' : '👁‍🗨'}</span>
                  </button>
                </div>
              </div>

              <div className={styles.termsWrapper}>
                <label className={styles.checkboxWrapper}>
                  <input
                    type="checkbox"
                    className={styles.checkboxInput}
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                  />
                  <span className={styles.checkboxCustom}></span>
                  <span className={styles.checkboxLabel}>
                    I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>. I also consent to receive product updates and marketing communications.
                  </span>
                </label>
              </div>

              <button type="submit" className={styles.btnSubmit} disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
                {!isLoading && <span>→</span>}
              </button>
            </form>
          )}

          <div className={styles.divider}>
            <span>or sign up with</span>
          </div>

          <div className={styles.socialButtons}>
            {isGoogleLoading ? (
              <div className={styles.btnSocial} style={{ justifyContent: 'center' }}>
                Signing up...
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                size="large"
                width="100%"
                text="signup_with"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
