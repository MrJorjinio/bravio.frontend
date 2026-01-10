'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services';
import { ArrowLeft, Eye, EyeOff, ArrowRight, Gift } from 'lucide-react';
import styles from './register.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const { register, googleLogin } = useAuth();

  const [step, setStep] = useState<'email' | 'otp'>('email');

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
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

    if (!username || username.length < 3 || username.length > 20) {
      setError('Username must be between 3 and 20 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
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
        username,
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

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('');
      setIsGoogleLoading(true);
      try {
        await googleLogin({ credential: tokenResponse.access_token });
        router.push('/dashboard');
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Google sign-up failed. Please try again.';
        setError(errorMessage);
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      setError('Google sign-up failed. Please try again.');
    },
  });

  return (
    <div className={styles.container}>
      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} />
            Back to home
          </Link>

          <div className={styles.formHeader}>
            <h1>Create Account</h1>
            <p>Already have an account? <Link href="/login">Sign in</Link></p>
          </div>

          <div className={styles.bonusBadge}>
            <span className={styles.bonusBadgeIcon}><Gift size={18} /></span>
            <span className={styles.bonusBadgeText}>Get <strong>150 free Broins</strong> when you sign up!</span>
          </div>

          {error && (
            <div className={styles.errorMessage}>{error}</div>
          )}

          {success && (
            <div className={styles.successMessage}>{success}</div>
          )}

          {step === 'email' ? (
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
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>
          ) : (
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
                <label className={styles.formLabel} htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  className={styles.formInput}
                  placeholder="Choose a username (3-20 characters)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20))}
                  maxLength={20}
                  required
                />
                <span className={styles.inputHint}>Letters, numbers, and underscores only</span>
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
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>
          )}

          <div className={styles.divider}>
            <span>or sign up with</span>
          </div>

          <div className={styles.socialButtons}>
            <button
              type="button"
              className={styles.btnSocial}
              onClick={() => handleGoogleLogin()}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                'Signing up...'
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
