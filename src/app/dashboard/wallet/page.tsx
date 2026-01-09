'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { walletService } from '@/services';
import type { Transaction, Package } from '@/types';
import {
  CreditCard,
  ArrowDownRight,
  ArrowUpRight,
  Gift,
  Inbox,
  CheckCircle,
  XCircle,
  Clock,
  Flame,
  TrendingUp,
  Users
} from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import PremiumBravioCard from '@/components/PremiumBravioCard';
import styles from './wallet.module.css';

export default function WalletPage() {
  const searchParams = useSearchParams();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'cancelled' | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [balanceRes, transactionsRes, packagesRes] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions(1, 20),
        walletService.getPackages()
      ]);
      setBalance(balanceRes.balance);
      setTransactions(transactionsRes.transactions || []);
      setPackages(packagesRes.packages || []);
    } catch (err) {
      console.error('Failed to fetch wallet data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle payment status from URL params
  useEffect(() => {
    const payment = searchParams.get('payment');
    if (payment === 'success') {
      // Verify and complete the pending payment
      walletService.verifyPayment()
        .then(async (result) => {
          if (result.completed) {
            setPaymentStatus('success');

            // If the result includes the new balance, update it immediately
            if (result.newBalance !== undefined) {
              setBalance(result.newBalance);
              // Dispatch event to refresh balance in sidebar
              window.dispatchEvent(new CustomEvent('balanceUpdated'));
            }

            // Wait a moment for backend to process, then refetch all data
            await new Promise(resolve => setTimeout(resolve, 500));
            await fetchData();
          }
        })
        .catch((err) => {
          console.error('Payment verification failed:', err);
          // Still try to fetch data in case payment went through
          fetchData();
        })
        .finally(() => {
          // Clear status after 5 seconds
          setTimeout(() => setPaymentStatus(null), 5000);
          // Clean URL
          window.history.replaceState({}, '', '/dashboard/wallet');
        });
    } else if (payment === 'cancelled') {
      setPaymentStatus('cancelled');
      setTimeout(() => setPaymentStatus(null), 5000);
      window.history.replaceState({}, '', '/dashboard/wallet');
    }
  }, [searchParams, fetchData]);

  const handlePackageSelect = (packageName: string) => {
    setSelectedPackage(packageName);
  };

  const getSelectedPackageInfo = () => {
    if (!selectedPackage) return null;
    return packages.find(p => p.name === selectedPackage);
  };

  const handlePurchase = async () => {
    const pkg = getSelectedPackageInfo();
    if (!pkg) return;

    setIsPurchasing(true);
    try {
      const response = await walletService.createCheckout({
        amountUsd: pkg.priceUSD,
        broins: pkg.broins
      });

      // Redirect to Dodo checkout
      window.location.href = response.checkoutUrl;
    } catch (err) {
      console.error('Purchase failed:', err);
      setPaymentStatus('cancelled');
      setTimeout(() => setPaymentStatus(null), 5000);
    } finally {
      setIsPurchasing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }) + ' \u2022 ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isPositiveTransaction = (type: string) => {
    return ['purchase', 'signupbonus', 'refund', 'levelup', 'dailybonus', 'streakbonus', 'referralbonus', 'referredbonus'].includes(type.toLowerCase());
  };

  const isPendingTransaction = (type: string) => {
    return type.toLowerCase() === 'pendingpurchase';
  };

  const getTransactionLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'purchase': return 'Broins Top-up';
      case 'pendingpurchase': return 'Processing Payment';
      case 'spend': return 'Spent on Upload';
      case 'usage': return 'Spent Broins';
      case 'signupbonus': return 'Welcome Bonus';
      case 'levelup': return 'Level Up Reward';
      case 'dailybonus': return 'Daily Login Bonus';
      case 'streakbonus': return 'Streak Bonus';
      case 'referralbonus': return 'Referral Reward';
      case 'referredbonus': return 'Welcome Referral Bonus';
      case 'refund': return 'Refund';
      default: return type;
    }
  };

  const getTransactionIconClass = (type: string) => {
    const t = type.toLowerCase();
    if (t === 'pendingpurchase') return styles.pending;
    if (t === 'spend' || t === 'usage') return styles.spent;
    if (t === 'signupbonus' || t === 'referredbonus') return styles.bonus;
    if (t === 'streakbonus') return styles.streak;
    if (t === 'referralbonus') return styles.referral;
    return styles.received;
  };

  const renderTransactionIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t === 'pendingpurchase') return <Clock size={20} />;
    if (t === 'spend' || t === 'usage') return <ArrowDownRight size={20} />;
    if (t === 'signupbonus' || t === 'referredbonus') return <Gift size={20} />;
    if (t === 'streakbonus') return <Flame size={20} />;
    if (t === 'dailybonus') return <TrendingUp size={20} />;
    if (t === 'referralbonus') return <Users size={20} />;
    return <ArrowUpRight size={20} />;
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Purchasing Overlay with Wallet Animation */}
      {isPurchasing && (
        <div className={styles.purchasingOverlay}>
          <div className={styles.purchasingModal}>
            <DotLottieReact
              src="/animations/wallet.lottie"
              autoplay
              loop
              className={styles.walletLottie}
            />
            <h3 className={styles.purchasingTitle}>Opening Wallet...</h3>
            <p className={styles.purchasingText}>Redirecting to secure checkout</p>
          </div>
        </div>
      )}

      {/* Payment Status Banner */}
      {paymentStatus && (
        <div className={`${styles.paymentBanner} ${paymentStatus === 'success' ? styles.successBanner : styles.cancelledBanner}`}>
          {paymentStatus === 'success' ? (
            <>
              <CheckCircle size={20} />
              <span>Payment successful! Your Broins have been added.</span>
            </>
          ) : (
            <>
              <XCircle size={20} />
              <span>Payment was cancelled. Try again when you&apos;re ready.</span>
            </>
          )}
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Wallet</h1>
          <p className={styles.subtitle}>Manage your digital assets</p>
        </div>
      </div>

      {/* Balance Card */}
      <div className={styles.cardWrapper}>
        <PremiumBravioCard balance={balance} />
      </div>

      {/* Purchase Section */}
      <div className={styles.purchaseSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIndicator}></span>
          <h2 className={styles.sectionTitle}>Purchase Broins</h2>
        </div>

        <div className={styles.purchaseGrid}>
          {packages.map((pkg, index) => {
            const isSelected = selectedPackage === pkg.name;
            const isBestValue = pkg.name === 'Value';
            return (
              <div
                key={pkg.name}
                className={`${styles.purchaseOption} ${isSelected ? styles.selected : ''} ${isBestValue && !selectedPackage ? styles.popular : ''}`}
                onClick={() => handlePackageSelect(pkg.name)}
              >
                {isBestValue && <span className={styles.bestValueBadge}>Best Value</span>}
                <p className={styles.optionLabel}>{pkg.name}</p>
                <p className={styles.optionPrice}>${pkg.priceUSD.toFixed(2)}</p>
                <p className={styles.optionBroins}>{pkg.broins.toLocaleString()} Broins</p>
              </div>
            );
          })}
        </div>

        <button
          className={styles.purchaseBtn}
          onClick={handlePurchase}
          disabled={isPurchasing || !selectedPackage}
        >
          <CreditCard size={20} strokeWidth={3} />
          {isPurchasing ? 'Processing...' : 'Confirm Purchase'}
        </button>
      </div>

      {/* Activity Section */}
      <div className={styles.activitySection}>
        <div className={styles.activityHeader}>
          <h3 className={styles.activityTitle}>Recent Activity</h3>
          <button className={styles.viewAllBtn}>View All</button>
        </div>

        {transactions.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Inbox size={48} />
            </div>
            <p className={styles.emptyText}>No transactions yet</p>
          </div>
        ) : (
          <div className={styles.transactionList}>
            {transactions.map((tx) => (
              <div key={tx.id} className={styles.transaction}>
                <div className={styles.transactionLeft}>
                  <div className={`${styles.transactionIcon} ${getTransactionIconClass(tx.type)}`}>
                    {renderTransactionIcon(tx.type)}
                  </div>
                  <div className={styles.transactionInfo}>
                    <h4>{getTransactionLabel(tx.type)}</h4>
                    <p>{formatDate(tx.createdAt)}</p>
                  </div>
                </div>
                <span className={`${styles.transactionAmount} ${isPendingTransaction(tx.type) ? styles.pendingAmount : isPositiveTransaction(tx.type) ? styles.positive : styles.negative}`}>
                  {isPendingTransaction(tx.type) ? '' : isPositiveTransaction(tx.type) ? '+' : '-'}{Math.abs(tx.amountBroins)} B
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
