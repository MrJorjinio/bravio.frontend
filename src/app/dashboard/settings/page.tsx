'use client';

import { useState, useEffect, useCallback } from 'react';
import { userService, subscriptionService } from '@/services';
import type { ProfileResponse, SubscriptionHistoryEntry } from '@/types';
import {
  User,
  Crown,
  Zap,
  Mail,
  Calendar,
  Coins,
  TrendingUp,
  Flame,
  FileText,
  Users,
  Award,
  Clock,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import styles from './settings.module.css';

export default function SettingsPage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [history, setHistory] = useState<SubscriptionHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [profileData, historyData] = await Promise.all([
        userService.getProfile(),
        subscriptionService.getHistory()
      ]);
      setProfile(profileData);
      setHistory(historyData.history);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle size={16} className={styles.iconActive} />;
      case 'Cancelled':
      case 'Expired':
        return <XCircle size={16} className={styles.iconCancelled} />;
      case 'GracePeriod':
        return <AlertCircle size={16} className={styles.iconGrace} />;
      default:
        return <Clock size={16} className={styles.iconPending} />;
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <AlertCircle size={48} />
          <p>{error || 'Failed to load profile'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Profile Settings</h1>
        <p className={styles.subtitle}>Manage your account and view your stats</p>
      </div>

      {/* Profile Card */}
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" />
              ) : (
                <User size={40} />
              )}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.nameRow}>
                <h2 className={styles.email}>{profile.email}</h2>
                <div className={`${styles.tierBadge} ${profile.isPro ? styles.proBadge : styles.freeBadge}`}>
                  {profile.isPro ? <Crown size={14} /> : <Zap size={14} />}
                  <span>{profile.tier}</span>
                </div>
              </div>
              <p className={styles.memberSince}>
                <Calendar size={14} />
                Member since {formatDate(profile.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Subscription Status */}
        {profile.isPro && (
          <div className={styles.subscriptionStatus}>
            <div className={styles.subscriptionInfo}>
              <Crown size={20} className={styles.proIcon} />
              <div>
                <p className={styles.subscriptionTitle}>Pro Subscription</p>
                <p className={styles.subscriptionDetail}>
                  {profile.subscriptionStatus === 'Active'
                    ? `Renews on ${formatDate(profile.subscriptionExpiresAt)}`
                    : profile.subscriptionStatus === 'Cancelled'
                    ? `Access until ${formatDate(profile.subscriptionExpiresAt)}`
                    : profile.subscriptionStatus
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIndicator}></span>
        <h2 className={styles.sectionTitle}>Your Stats</h2>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.balanceIcon}`}>
            <Coins size={20} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statValue}>{profile.balance}</p>
            <p className={styles.statLabel}>Broins Balance</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.levelIcon}`}>
            <TrendingUp size={20} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statValue}>Level {profile.level}</p>
            <p className={styles.statLabel}>{profile.experience} XP</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.streakIcon}`}>
            <Flame size={20} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statValue}>{profile.currentStreak} days</p>
            <p className={styles.statLabel}>Current Streak</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.longestIcon}`}>
            <Flame size={20} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statValue}>{profile.longestStreak} days</p>
            <p className={styles.statLabel}>Longest Streak</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.docsIcon}`}>
            <FileText size={20} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statValue}>{profile.totalDocuments}</p>
            <p className={styles.statLabel}>Documents</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.referralsIcon}`}>
            <Users size={20} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statValue}>{profile.totalReferrals}</p>
            <p className={styles.statLabel}>Referrals</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.badgesIcon}`}>
            <Award size={20} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statValue}>{profile.badgesEarned}</p>
            <p className={styles.statLabel}>Badges Earned</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.activityIcon}`}>
            <Clock size={20} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statValue}>{formatDate(profile.lastActivityDate)}</p>
            <p className={styles.statLabel}>Last Active</p>
          </div>
        </div>
      </div>

      {/* Subscription History */}
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIndicator}></span>
        <h2 className={styles.sectionTitle}>Subscription History</h2>
      </div>

      <div className={styles.historySection}>
        {history.length === 0 ? (
          <div className={styles.emptyHistory}>
            <CreditCard size={48} />
            <p>No subscription history yet</p>
            <span>Your subscription payments will appear here</span>
          </div>
        ) : (
          <div className={styles.historyList}>
            {history.map((entry) => (
              <div key={entry.id} className={styles.historyItem}>
                <div className={styles.historyIcon}>
                  {getStatusIcon(entry.status)}
                </div>
                <div className={styles.historyContent}>
                  <div className={styles.historyMain}>
                    <p className={styles.historyTitle}>
                      Pro Subscription
                      {entry.totalRenewals > 0 && (
                        <span className={styles.renewalBadge}>
                          {entry.totalRenewals} renewal{entry.totalRenewals > 1 ? 's' : ''}
                        </span>
                      )}
                    </p>
                    <p className={styles.historyDate}>
                      {formatDate(entry.currentPeriodStart)} - {formatDate(entry.currentPeriodEnd)}
                    </p>
                  </div>
                  <div className={styles.historyMeta}>
                    <span className={`${styles.historyStatus} ${styles[`status${entry.status}`]}`}>
                      {entry.status}
                    </span>
                    <span className={styles.historyAmount}>${entry.amountUSD.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
