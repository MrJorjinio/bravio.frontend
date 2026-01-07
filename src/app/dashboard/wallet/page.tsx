'use client';

import { useState, useEffect, useCallback } from 'react';
import { walletService } from '@/services';
import type { Transaction } from '@/types';
import {
  Settings,
  ChevronRight,
  CreditCard,
  ArrowDownRight,
  ArrowUpRight,
  Gift,
  Inbox
} from 'lucide-react';
import styles from './wallet.module.css';

interface PurchaseOption {
  usd: number;
  broins: number;
  label: string;
  popular?: boolean;
}

const purchaseOptions: PurchaseOption[] = [
  { usd: 5, broins: 75, label: 'Starter' },
  { usd: 10, broins: 150, label: 'Popular', popular: true },
  { usd: 20, broins: 300, label: 'Pro' },
];

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(10);
  const [customAmount, setCustomAmount] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);

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
      return isNaN(amount) ? 0 : Math.floor(amount * 15);
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
    if (usd <= 0) return;

    setIsPurchasing(true);
    try {
      alert(`Payment processing for $${usd} is not yet implemented. This would add ${getSelectedBroins()} Broins to your account.`);
    } catch (err) {
      console.error('Purchase failed:', err);
      alert('Purchase failed. Please try again.');
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
    return ['purchase', 'signupbonus', 'refund'].includes(type.toLowerCase());
  };

  const getTransactionLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'purchase': return 'Broins Top-up';
      case 'usage': return 'Spent Broins';
      case 'signupbonus': return 'Welcome Bonus';
      case 'refund': return 'Refund';
      default: return type;
    }
  };

  const getTransactionIconClass = (type: string) => {
    const t = type.toLowerCase();
    if (t === 'usage') return styles.spent;
    if (t === 'signupbonus') return styles.bonus;
    return styles.received;
  };

  const renderTransactionIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t === 'usage') return <ArrowDownRight size={20} />;
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
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Wallet</h1>
          <p className={styles.subtitle}>Manage your digital assets</p>
        </div>
        <button className={styles.settingsBtn}>
          <Settings size={20} />
        </button>
      </div>

      {/* Balance Card */}
      <div className={styles.balanceCard}>
        <div className={styles.balanceGlow}></div>
        <div className={styles.balanceContent}>
          <span className={styles.accountBadge}>Personal Account</span>

          <p className={styles.balanceLabel}>Current Balance</p>
          <div className={styles.balanceValue}>
            <span className={styles.balanceAmount}>{balance}</span>
            <span className={styles.balanceCurrency}>Broins</span>
          </div>

          <div className={styles.balanceFooter}>
            <p className={styles.balanceUsd}>
              ≈ ${(balance / 15).toFixed(2)} <span>USD</span>
            </p>
            <button className={styles.historyLink}>
              Top up History <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Purchase Section */}
      <div className={styles.purchaseSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIndicator}></span>
          <h2 className={styles.sectionTitle}>Purchase Broins</h2>
        </div>

        <div className={styles.purchaseGrid}>
          {purchaseOptions.map((option) => (
            <div
              key={option.usd}
              className={`${styles.purchaseOption} ${selectedOption === option.usd ? styles.selected : ''} ${option.popular ? styles.popular : ''}`}
              onClick={() => handleOptionSelect(option.usd)}
            >
              {option.popular && <span className={styles.bestValueBadge}>Best Value</span>}
              <p className={styles.optionLabel}>{option.label}</p>
              <p className={styles.optionPrice}>${option.usd}</p>
              <p className={styles.optionBroins}>{option.broins} Broins</p>
            </div>
          ))}
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
                <span className={`${styles.transactionAmount} ${isPositiveTransaction(tx.type) ? styles.positive : styles.negative}`}>
                  {isPositiveTransaction(tx.type) ? '+' : '-'}{Math.abs(tx.amountBroins)} B
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
