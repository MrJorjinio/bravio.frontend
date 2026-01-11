'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { subscriptionService } from '@/services';
import type { SubscriptionStatusResponse } from '@/types';
import { FREE_TIER_LIMITS, PRO_TIER_LIMITS } from '@/types';
import {
  Crown,
  Check,
  X,
  Zap,
  Shield,
  Infinity,
  FileText,
  Gift,
  AlertCircle,
  Loader2,
  ExternalLink,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import styles from './subscription.module.css';

export default function SubscriptionPage() {
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<SubscriptionStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const verifyCalledRef = useRef(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await subscriptionService.getStatus();
      setSubscription(data);
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
      setError('Failed to load subscription status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Verify subscription when returning from checkout
  useEffect(() => {
    const verifyCheckout = async () => {
      // Prevent duplicate calls
      if (verifyCalledRef.current) return;

      // Check for success parameter (returned from Dodo checkout)
      const success = searchParams.get('success');
      const paymentId = searchParams.get('payment_id');

      if (success === 'true' || paymentId) {
        verifyCalledRef.current = true; // Mark as called
        setIsVerifying(true);
        try {
          const result = await subscriptionService.verifySubscription();
          setSubscription(result);
          if (result.isPro) {
            setSuccessMessage('Welcome to Bravio Pro! Your subscription is now active.');
            // Notify layout to update Pro badge and balance
            window.dispatchEvent(new Event('subscriptionUpdated'));
            window.dispatchEvent(new Event('balanceUpdated'));
          }
        } catch (err) {
          console.error('Failed to verify subscription:', err);
          // Still try to fetch the status even if verify fails
          await fetchSubscription();
        } finally {
          setIsVerifying(false);
          // Clean up URL params
          window.history.replaceState({}, '', '/dashboard/subscription');
        }
      }
    };

    verifyCheckout();
  }, [searchParams, fetchSubscription]);

  const handleUpgrade = async () => {
    try {
      setIsCheckingOut(true);
      setError('');
      const result = await subscriptionService.createCheckout();
      window.location.href = result.checkoutUrl;
    } catch (err) {
      console.error('Failed to create checkout:', err);
      setError('Failed to start checkout. Please try again.');
      setIsCheckingOut(false);
    }
  };

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    setShowCancelModal(false);
    try {
      setIsCancelling(true);
      setError('');
      const result = await subscriptionService.cancelSubscription();
      setSubscription(result);
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      setError('Failed to cancel subscription. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading || isVerifying) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>{isVerifying ? 'Verifying your subscription...' : 'Loading subscription...'}</p>
        </div>
      </div>
    );
  }

  const isPro = subscription?.isPro;
  const isActive = subscription?.status === 'Active';
  const isGracePeriod = subscription?.isInGracePeriod;
  const willCancel = subscription?.willCancelAtPeriodEnd;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Subscription</h1>
          <p className={styles.subtitle}>Manage your Bravio Pro subscription</p>
        </div>
      </div>

      {/* Current Status Card */}
      <div className={`${styles.statusCard} ${isPro ? styles.proCard : ''}`}>
        <div className={styles.statusCardGlow}></div>
        <div className={styles.statusCardContent}>
          <div className={styles.statusHeader}>
            <div className={`${styles.tierBadge} ${isPro ? styles.proBadge : styles.freeBadge}`}>
              {isPro ? <Crown size={18} /> : <Zap size={18} />}
              <span>{subscription?.tier || 'Free'}</span>
            </div>
            <div className={styles.statusLabel}>
              {isActive && !willCancel && <span className={styles.activeStatus}>Active</span>}
              {isActive && willCancel && <span className={styles.cancellingStatus}>Cancelling</span>}
              {isGracePeriod && <span className={styles.graceStatus}>Grace Period</span>}
              {!isActive && !isGracePeriod && !isPro && <span className={styles.freeStatus}>Free Plan</span>}
            </div>
          </div>

          {isPro && subscription && (
            <div className={styles.billingInfo}>
              {willCancel ? (
                <p className={styles.billingText}>
                  Your subscription will end on <strong>{formatDate(subscription.currentPeriodEnd)}</strong>
                </p>
              ) : isGracePeriod ? (
                <p className={styles.billingText}>
                  Grace period ends on <strong>{formatDate(subscription.gracePeriodEnd)}</strong>
                </p>
              ) : (
                <p className={styles.billingText}>
                  Next billing date: <strong>{formatDate(subscription.currentPeriodEnd)}</strong>
                </p>
              )}
              {subscription.daysRemainingInPeriod > 0 && (
                <p className={styles.daysRemaining}>
                  {subscription.daysRemainingInPeriod} days remaining
                </p>
              )}
            </div>
          )}

          {!isPro && (
            <button
              className={styles.upgradeBtn}
              onClick={handleUpgrade}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? (
                <>
                  <Loader2 size={20} className={styles.spinIcon} />
                  <span>Redirecting...</span>
                </>
              ) : (
                <>
                  <Crown size={20} />
                  <span>Upgrade to Pro - ${subscription?.monthlyPrice || 4.99}/mo</span>
                </>
              )}
            </button>
          )}

          {isPro && isActive && !willCancel && (
            <button
              className={styles.cancelBtn}
              onClick={handleCancelClick}
              disabled={isCancelling}
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className={styles.successMessage}>
          <CheckCircle size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Comparison Section */}
      <div className={styles.comparisonSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIndicator}></span>
          <h2 className={styles.sectionTitle}>Plan Comparison</h2>
        </div>

        <div className={styles.plansGrid}>
          {/* Free Plan */}
          <div className={`${styles.planCard} ${!isPro ? styles.currentPlan : ''}`}>
            <div className={styles.planHeader}>
              <div className={styles.planIcon}>
                <Zap size={24} />
              </div>
              <h3 className={styles.planName}>Free</h3>
              <div className={styles.planPrice}>
                <span className={styles.priceAmount}>$0</span>
                <span className={styles.pricePeriod}>/month</span>
              </div>
            </div>

            <ul className={styles.featureList}>
              <li className={styles.featureItem}>
                <Check size={16} className={styles.checkIcon} />
                <span>{FREE_TIER_LIMITS.monthlyBroinCap} Broins monthly cap</span>
              </li>
              <li className={styles.featureItem}>
                <Check size={16} className={styles.checkIcon} />
                <span>{FREE_TIER_LIMITS.dailyDocumentLimit} documents per day</span>
              </li>
              <li className={styles.featureItem}>
                <Check size={16} className={styles.checkIcon} />
                <span>Up to {FREE_TIER_LIMITS.pdfMaxPages} PDF pages</span>
              </li>
              <li className={styles.featureItem}>
                <Check size={16} className={styles.checkIcon} />
                <span>{(FREE_TIER_LIMITS.textMaxChars / 1000).toFixed(0)}K characters per text</span>
              </li>
              <li className={styles.featureItem}>
                <Check size={16} className={styles.checkIcon} />
                <span>{FREE_TIER_LIMITS.historyLimit} document history</span>
              </li>
              <li className={styles.featureItemDisabled}>
                <X size={16} className={styles.xIcon} />
                <span>No streak protection</span>
              </li>
              <li className={styles.featureItemDisabled}>
                <X size={16} className={styles.xIcon} />
                <span>No priority processing</span>
              </li>
            </ul>

            {!isPro && (
              <div className={styles.currentPlanLabel}>Current Plan</div>
            )}
          </div>

          {/* Pro Plan */}
          <div className={`${styles.planCard} ${styles.proPlanCard} ${isPro ? styles.currentPlan : ''}`}>
            <div className={styles.planBadge}>Most Popular</div>
            <div className={styles.planHeader}>
              <div className={`${styles.planIcon} ${styles.proIcon}`}>
                <Crown size={24} />
              </div>
              <h3 className={styles.planName}>Pro</h3>
              <div className={styles.planPrice}>
                <span className={styles.priceAmount}>${subscription?.monthlyPrice || 4.99}</span>
                <span className={styles.pricePeriod}>/month</span>
              </div>
            </div>

            <ul className={styles.featureList}>
              <li className={styles.featureItem}>
                <Infinity size={16} className={styles.infinityIcon} />
                <span>Unlimited Broins earning</span>
              </li>
              <li className={styles.featureItem}>
                <Infinity size={16} className={styles.infinityIcon} />
                <span>Unlimited documents per day</span>
              </li>
              <li className={styles.featureItem}>
                <FileText size={16} className={styles.checkIcon} />
                <span>Up to {PRO_TIER_LIMITS.pdfMaxPages} PDF pages</span>
              </li>
              <li className={styles.featureItem}>
                <Check size={16} className={styles.checkIcon} />
                <span>{(PRO_TIER_LIMITS.textMaxChars / 1000).toFixed(0)}K characters per text</span>
              </li>
              <li className={styles.featureItem}>
                <Infinity size={16} className={styles.infinityIcon} />
                <span>Unlimited document history</span>
              </li>
              <li className={styles.featureItem}>
                <Shield size={16} className={styles.shieldIcon} />
                <span>Streak protection (1x/month)</span>
              </li>
              <li className={styles.featureItem}>
                <Zap size={16} className={styles.zapIcon} />
                <span>Priority processing queue</span>
              </li>
            </ul>

            {isPro ? (
              <div className={styles.currentPlanLabel}>Current Plan</div>
            ) : (
              <button
                className={styles.selectPlanBtn}
                onClick={handleUpgrade}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? 'Redirecting...' : 'Upgrade Now'}
                <ExternalLink size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pro Benefits */}
      <div className={styles.benefitsSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIndicator}></span>
          <h2 className={styles.sectionTitle}>Pro Benefits</h2>
        </div>

        <div className={styles.benefitsGrid}>
          <div className={styles.benefitCard}>
            <div className={`${styles.benefitIcon} ${styles.bonusIcon}`}>
              <Gift size={22} />
            </div>
            <div className={styles.benefitContent}>
              <h4 className={styles.benefitTitle}>2x Bonus Rewards</h4>
              <p className={styles.benefitDesc}>
                Double daily bonus ({PRO_TIER_LIMITS.dailyBonus} vs {FREE_TIER_LIMITS.dailyBonus}),
                level-up ({PRO_TIER_LIMITS.levelUpBonus} vs {FREE_TIER_LIMITS.levelUpBonus}),
                and streak rewards ({PRO_TIER_LIMITS.streakBonus} vs {FREE_TIER_LIMITS.streakBonus})
              </p>
            </div>
          </div>

          <div className={styles.benefitCard}>
            <div className={`${styles.benefitIcon} ${styles.shieldBenefitIcon}`}>
              <Shield size={22} />
            </div>
            <div className={styles.benefitContent}>
              <h4 className={styles.benefitTitle}>Streak Protection</h4>
              <p className={styles.benefitDesc}>
                Miss a day? Your streak is protected once per month so you never lose your progress
              </p>
            </div>
          </div>

          <div className={styles.benefitCard}>
            <div className={`${styles.benefitIcon} ${styles.priorityIcon}`}>
              <Zap size={22} />
            </div>
            <div className={styles.benefitContent}>
              <h4 className={styles.benefitTitle}>Priority Queue</h4>
              <p className={styles.benefitDesc}>
                Your documents are processed first, no waiting during peak times
              </p>
            </div>
          </div>

          <div className={styles.benefitCard}>
            <div className={`${styles.benefitIcon} ${styles.badgeIcon}`}>
              <Crown size={22} />
            </div>
            <div className={styles.benefitContent}>
              <h4 className={styles.benefitTitle}>Exclusive Badges</h4>
              <p className={styles.benefitDesc}>
                Unlock 5 Pro-exclusive badges and show off your dedication
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCancelModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>
              <AlertTriangle size={32} />
            </div>
            <h3 className={styles.modalTitle}>Cancel Subscription?</h3>
            <p className={styles.modalText}>
              Are you sure you want to cancel your Pro subscription? You will lose access to Pro benefits at the end of your current billing period.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelBtn}
                onClick={() => setShowCancelModal(false)}
              >
                Keep Subscription
              </button>
              <button
                className={styles.modalConfirmBtn}
                onClick={handleConfirmCancel}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
