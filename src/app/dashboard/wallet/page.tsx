'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { walletService } from '@/services';
import type { Transaction } from '@/types';
import styles from './wallet.module.css';

interface PurchaseOption {
  usd: number;
  broins: number;
  popular?: boolean;
}

const purchaseOptions: PurchaseOption[] = [
  { usd: 5, broins: 75 },
  { usd: 10, broins: 150, popular: true },
  { usd: 20, broins: 300 },
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
      // In a real app, this would integrate with Stripe or another payment processor
      // For now, we'll just show a message
      alert(`Payment processing for $${usd} is not yet implemented. This would add ${getSelectedBroins()} Broins to your account.`);
      // await walletService.purchase({ amount: usd });
      // await fetchData();
    } catch (err) {
      console.error('Purchase failed:', err);
      alert('Purchase failed. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'purchase': return '💰';
      case 'usage': return '📤';
      case 'signupbonus': return '🎁';
      case 'refund': return '↩️';
      default: return '💎';
    }
  };

  const getTransactionIconClass = (type: string) => {
    switch (type.toLowerCase()) {
      case 'purchase': return styles.purchase;
      case 'usage': return styles.usage;
      case 'signupbonus': return styles.bonus;
      case 'refund': return styles.refund;
      default: return '';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isPositiveTransaction = (type: string) => {
    return ['purchase', 'signupbonus', 'refund'].includes(type.toLowerCase());
  };

  const getTransactionLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'purchase': return 'Broins Purchase';
      case 'usage': return 'Content Processing';
      case 'signupbonus': return 'Welcome Bonus';
      case 'refund': return 'Refund';
      default: return type;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Wallet</h1>
        <p className={styles.subtitle}>Manage your Broins and view transaction history</p>
      </div>

      {/* Balance Card */}
      <div className={styles.balanceCard}>
        <div className={styles.balanceContent}>
          <div className={styles.balanceLabel}>Current Balance</div>
          <div className={styles.balanceValue}>
            <Image src="/images/broin-coin.png" alt="Broins" width={48} height={48} />
            <span className={styles.balanceAmount}>{balance}</span>
            <span className={styles.balanceUsd}>Broins</span>
          </div>
          <div className={styles.balanceUsd}>
            ≈ ${(balance / 15).toFixed(2)} USD value
          </div>
        </div>
      </div>

      {/* Purchase Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>💳</span>
          <h2 className={styles.sectionTitle}>Buy Broins</h2>
        </div>

        <div className={styles.purchaseGrid}>
          {purchaseOptions.map((option) => (
            <div
              key={option.usd}
              className={`${styles.purchaseOption} ${selectedOption === option.usd ? styles.selected : ''} ${option.popular ? styles.popular : ''}`}
              onClick={() => handleOptionSelect(option.usd)}
            >
              <div className={styles.purchasePrice}>${option.usd}</div>
              <div className={styles.purchaseBroins}>
                <Image src="/images/broin-coin.png" alt="Broins" width={18} height={18} />
                {option.broins} Broins
              </div>
            </div>
          ))}
        </div>

        <div className={styles.customAmount}>
          <input
            type="number"
            className={styles.customInput}
            placeholder="Custom amount (USD)"
            value={customAmount}
            onChange={(e) => handleCustomAmountChange(e.target.value)}
            min="1"
            step="1"
          />
          {customAmount && (
            <div className={styles.applyBtn}>
              = {getSelectedBroins()} Broins
            </div>
          )}
        </div>

        <button
          className={styles.purchaseBtn}
          onClick={handlePurchase}
          disabled={isPurchasing || getSelectedUsd() <= 0}
        >
          {isPurchasing ? (
            'Processing...'
          ) : (
            <>
              <span>💳</span>
              Purchase {getSelectedBroins()} Broins for ${getSelectedUsd()}
            </>
          )}
        </button>

        <div className={styles.exchangeRate}>
          <span className={styles.exchangeText}>
            Exchange Rate: <span className={styles.exchangeValue}>$1 = 15 Broins</span>
          </span>
        </div>
      </div>

      {/* Transaction History */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📜</span>
          <h2 className={styles.sectionTitle}>Transaction History</h2>
        </div>

        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <span>Loading transactions...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className={styles.emptyTransactions}>
            <div className={styles.emptyIcon}>📭</div>
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className={styles.transactionList}>
            {transactions.map((tx) => (
              <div key={tx.id} className={styles.transaction}>
                <div className={styles.transactionLeft}>
                  <div className={`${styles.transactionIcon} ${getTransactionIconClass(tx.type)}`}>
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div className={styles.transactionInfo}>
                    <h4>{getTransactionLabel(tx.type)}</h4>
                    <p>{tx.type}</p>
                  </div>
                </div>
                <div className={styles.transactionAmount}>
                  <div className={`${styles.transactionBroins} ${isPositiveTransaction(tx.type) ? styles.positive : styles.negative}`}>
                    {isPositiveTransaction(tx.type) ? '+' : '-'}{Math.abs(tx.amountBroins)} Broins
                  </div>
                  <div className={styles.transactionDate}>{formatDate(tx.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
