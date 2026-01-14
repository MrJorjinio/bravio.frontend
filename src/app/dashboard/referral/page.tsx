'use client';

import { useState, useEffect, useCallback } from 'react';
import { referralService } from '@/services';
import type { ReferralResponse } from '@/types';
import {
  Gift,
  Copy,
  Check,
  Users,
  Coins,
  Share2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import styles from './referral.module.css';

export default function ReferralPage() {
  const [referralInfo, setReferralInfo] = useState<ReferralResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [applyCode, setApplyCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');

  const fetchReferralInfo = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const data = await referralService.getReferralInfo();
      setReferralInfo(data);
    } catch (err) {
      console.error('Failed to fetch referral info:', err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferralInfo();
  }, [fetchReferralInfo]);

  const copyToClipboard = async (text: string): Promise<boolean> => {
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fall through to fallback
      }
    }

    // Fallback for mobile and non-HTTPS
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    } catch {
      return false;
    }
  };

  const handleCopyCode = async () => {
    if (!referralInfo?.referralCode) return;

    const success = await copyToClipboard(referralInfo.referralCode);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!referralInfo?.referralCode) return;

    const shareText = `Join Bravio and get 50 free Broins! Use my referral code: ${referralInfo.referralCode}`;
    const shareUrl = `${window.location.origin}/register?ref=${referralInfo.referralCode}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Bravio',
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed, fallback to copy
        handleCopyCode();
      }
    } else {
      // Fallback: copy the full message
      const success = await copyToClipboard(`${shareText}\n${shareUrl}`);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleApplyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyCode.trim()) return;

    setIsApplying(true);
    setApplyError('');
    setApplySuccess('');

    try {
      const result = await referralService.applyReferralCode({ referralCode: applyCode.trim() });
      if (result.success) {
        setApplySuccess(result.message);
        setApplyCode('');
        // Refresh referral info without showing loading spinner
        fetchReferralInfo(false);
        // Dispatch event to refresh balance in sidebar
        window.dispatchEvent(new CustomEvent('balanceUpdated'));
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setApplyError(error.response?.data?.message || 'Failed to apply referral code');
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        {/* Skeleton Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
            <div className={`${styles.skeleton} ${styles.skeletonSubtitle}`}></div>
          </div>
        </div>

        {/* Skeleton Code Card */}
        <div className={`${styles.skeleton} ${styles.skeletonCodeCard}`}></div>

        {/* Skeleton Stats Grid */}
        <div className={styles.statsGrid}>
          {[1, 2].map((i) => (
            <div key={i} className={styles.skeletonStatCard}>
              <div className={`${styles.skeleton} ${styles.skeletonStatIcon}`}></div>
              <div className={styles.skeletonStatInfo}>
                <div className={`${styles.skeleton} ${styles.skeletonStatValue}`}></div>
                <div className={`${styles.skeleton} ${styles.skeletonStatLabel}`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Skeleton How It Works */}
        <div className={styles.howItWorks}>
          <div className={styles.skeletonSectionHeader}>
            <div className={`${styles.skeleton} ${styles.skeletonIndicator}`}></div>
            <div className={`${styles.skeleton} ${styles.skeletonSectionTitle}`}></div>
          </div>
          <div className={styles.stepsGrid}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.skeletonStep}>
                <div className={`${styles.skeleton} ${styles.skeletonStepNumber}`}></div>
                <div className={`${styles.skeleton} ${styles.skeletonStepTitle}`}></div>
                <div className={`${styles.skeleton} ${styles.skeletonStepDesc}`}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Skeleton Apply Section */}
        <div className={styles.applySection}>
          <div className={styles.skeletonSectionHeader}>
            <div className={`${styles.skeleton} ${styles.skeletonIndicator}`}></div>
            <div className={`${styles.skeleton} ${styles.skeletonSectionTitle}`}></div>
          </div>
          <div className={styles.skeletonApplyForm}>
            <div className={`${styles.skeleton} ${styles.skeletonInput}`}></div>
            <div className={`${styles.skeleton} ${styles.skeletonBtn}`}></div>
          </div>
        </div>

        {/* Skeleton Rewards */}
        <div className={`${styles.skeleton} ${styles.skeletonRewards}`}></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Referrals</h1>
          <p className={styles.subtitle}>Invite friends and earn Broins</p>
        </div>
      </div>

      {/* Referral Code Card */}
      <div className={styles.codeCard}>
        <div className={styles.codeCardGlow}></div>
        <div className={styles.codeCardContent}>
          <div className={styles.codeHeader}>
            <div className={styles.codeIcon}>
              <Gift size={24} />
            </div>
            <div className={styles.codeLabel}>Your Referral Code</div>
          </div>

          <div className={styles.codeDisplay}>
            <span className={styles.codeText}>{referralInfo?.referralCode || '---'}</span>
            <button
              className={styles.copyBtn}
              onClick={handleCopyCode}
              title={copied ? 'Copied!' : 'Copy code'}
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>

          <button className={styles.shareBtn} onClick={handleShare}>
            <Share2 size={18} />
            <span>Share with Friends</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.usersIcon}`}>
            <Users size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{referralInfo?.totalReferrals || 0}</span>
            <span className={styles.statLabel}>Friends Invited</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.coinsIcon}`}>
            <Coins size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{referralInfo?.totalEarned || 0}</span>
            <span className={styles.statLabel}>Earned from Invites</span>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className={styles.howItWorks}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIndicator}></span>
          <h2 className={styles.sectionTitle}>How It Works</h2>
        </div>

        <div className={styles.stepsGrid}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h3 className={styles.stepTitle}>Share Your Code</h3>
            <p className={styles.stepDesc}>Send your unique code to friends</p>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h3 className={styles.stepTitle}>Friend Signs Up</h3>
            <p className={styles.stepDesc}>They register and apply your code</p>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h3 className={styles.stepTitle}>Both Earn Broins</h3>
            <p className={styles.stepDesc}>You get 100, they get 50 Broins!</p>
          </div>
        </div>
      </div>

      {/* Apply Referral Code Section */}
      <div className={styles.applySection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIndicator}></span>
          <h2 className={styles.sectionTitle}>Have a Referral Code?</h2>
        </div>

        <form onSubmit={handleApplyCode} className={styles.applyForm}>
          <div className={styles.inputWrapper}>
            <Sparkles className={styles.inputIcon} size={18} />
            <input
              type="text"
              className={styles.applyInput}
              placeholder="Enter referral code"
              value={applyCode}
              onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
              maxLength={20}
            />
          </div>

          <button
            type="submit"
            className={styles.applyBtn}
            disabled={isApplying || !applyCode.trim()}
          >
            {isApplying ? 'Applying...' : 'Apply Code'}
          </button>
        </form>

        {applyError && (
          <div className={styles.errorMessage}>
            <AlertCircle size={16} />
            <span>{applyError}</span>
          </div>
        )}

        {applySuccess && (
          <div className={styles.successMessage}>
            <Check size={16} />
            <span>{applySuccess}</span>
          </div>
        )}
      </div>

      {/* Rewards Info */}
      <div className={styles.rewardsInfo}>
        <div className={styles.rewardItem}>
          <span className={styles.rewardLabel}>You earn per referral</span>
          <span className={styles.rewardValue}>+100 Broins</span>
        </div>
        <div className={styles.rewardDivider}></div>
        <div className={styles.rewardItem}>
          <span className={styles.rewardLabel}>Friend receives</span>
          <span className={styles.rewardValue}>+50 Broins</span>
        </div>
      </div>
    </div>
  );
}
