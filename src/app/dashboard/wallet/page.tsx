'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { walletService } from '@/services';
import type { Transaction } from '@/types';
import {
  CreditCard,
  ArrowDownRight,
  ArrowUpRight,
  Gift,
  Inbox,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import PremiumBravioCard from '@/components/PremiumBravioCard';
import styles from './wallet.module.css';

interface PurchaseOption {
  usd: number;
  broins: number;
  label: string;
  popular?: boolean;
}

const purchaseOptions: PurchaseOption[] = [
  { usd: 5, broins: 1000, label: 'Starter' },
  { usd: 10, broins: 2000, label: 'Popular', popular: true },
  { usd: 20, broins: 4000, label: 'Pro' },
];

export default function WalletPage() {
  const searchParams = useSearchParams();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'cancelled' | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [balanceRes, transactionsRes] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions(1, 20)
      ]);
      setBalance(balanceRes.balance);
      setTransactions(transactionsRes.transactions || []);
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

  const handleOptionSelect = (usd: number) => {
    setSelectedOption(usd);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    if (value) {
      setSelectedOption(null);
    }
  };

  const getSelectedBroins = () => {
    if (selectedOption) {
      const option = purchaseOptions.find(o => o.usd === selectedOption);
      return option ? option.broins : 0;
    }
    if (customAmount) {
      const amount = parseFloat(customAmount);
      return isNaN(amount) ? 0 : Math.floor(amount * 200);
    }
    return 0;
  };

  const getSelectedUsd = () => {
    if (selectedOption) return selectedOption;
    if (customAmount) {
      const amount = parseFloat(customAmount);
      return isNaN(amount) ? 0 : amount;
    }
    return 0;
  };

  const handlePurchase = async () => {
    const usd = getSelectedUsd();
    const broins = getSelectedBroins();
    if (usd <= 0 || broins <= 0) return;

    setIsPurchasing(true);
    try {
      const response = await walletService.createCheckout({
        amountUsd: usd,
        broins: broins
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
    return ['purchase', 'signupbonus', 'refund', 'levelup'].includes(type.toLowerCase());
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
      case 'refund': return 'Refund';
      default: return type;
    }
  };

  const getTransactionIconClass = (type: string) => {
    const t = type.toLowerCase();
    if (t === 'pendingpurchase') return styles.pending;
    if (t === 'spend' || t === 'usage') return styles.spent;
    if (t === 'signupbonus') return styles.bonus;
    return styles.received;
  };

  const renderTransactionIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t === 'pendingpurchase') return <Clock size={20} />;
    if (t === 'spend' || t === 'usage') return <ArrowDownRight size={20} />;
    if (t === 'signupbonus') return <Gift size={20} />;
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
          {purchaseOptions.map((option) => {
            const isSelected = selectedOption === option.usd;
            const showPopularHighlight = option.popular && selectedOption === null && !customAmount;
            return (
              <div
                key={option.usd}
                className={`${styles.purchaseOption} ${isSelected ? styles.selected : ''} ${showPopularHighlight ? styles.popular : ''}`}
                onClick={() => handleOptionSelect(option.usd)}
              >
                {option.popular && <span className={styles.bestValueBadge}>Best Value</span>}
                <p className={styles.optionLabel}>{option.label}</p>
                <p className={styles.optionPrice}>${option.usd}</p>
                <p className={styles.optionBroins}>{option.broins} Broins</p>
              </div>
            );
          })}
        </div>

        <div className={styles.customInputWrapper}>
          <span className={styles.dollarSign}>$</span>
          <input
            type="number"
            className={styles.customInput}
            placeholder="Custom amount"
            value={customAmount}
            onChange={(e) => handleCustomAmountChange(e.target.value)}
            min="1"
            step="1"
          />
        </div>

        <button
          className={styles.purchaseBtn}
          onClick={handlePurchase}
          disabled={isPurchasing || getSelectedUsd() <= 0}
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
