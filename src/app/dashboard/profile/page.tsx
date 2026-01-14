'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { userService, walletService, subscriptionService } from '@/services';
import { getAssetUrl } from '@/lib/api';
import type { ProfileResponse, SubscriptionStatusResponse, LevelResponse, StreakResponse } from '@/types';
import {
  User,
  Settings,
  Award,
  Wallet,
  Crown,
  Gift,
  LogOut,
  ChevronRight,
  Flame,
  TrendingUp,
  Coins,
  X,
  Zap
} from 'lucide-react';
import styles from './profile-hub.module.css';

export default function ProfileHubPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionStatusResponse | null>(null);
  const [level, setLevel] = useState<LevelResponse | null>(null);
  const [streak, setStreak] = useState<StreakResponse | null>(null);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [profileRes, subRes, levelRes, streakRes, balanceRes] = await Promise.all([
        userService.getProfile(),
        subscriptionService.getStatus(),
        userService.getLevel(),
        userService.getStreak(),
        walletService.getBalance()
      ]);
      setProfile(profileRes);
      setSubscription(subRes);
      setLevel(levelRes);
      setStreak(streakRes);
      setBalance(balanceRes.balance);
    } catch (err) {
      console.error('Failed to fetch profile data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push('/');
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className={styles.container}>
      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            {profile?.avatarUrl ? (
              <img src={getAssetUrl(profile.avatarUrl)} alt="Profile" className={styles.avatar} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                <User size={32} />
              </div>
            )}
            {subscription?.isPro && (
              <div className={styles.proBadgeIcon}>
                <Crown size={12} />
              </div>
            )}
          </div>
          <div className={styles.userInfo}>
            <h1 className={styles.username}>{profile?.username || user?.email?.split('@')[0]}</h1>
            {subscription?.isPro && <span className={styles.proLabel}>Pro Member</span>}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <div className={styles.statIcon}>
            <TrendingUp size={16} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{level?.level || 1}</span>
            <span className={styles.statLabel}>Level</span>
          </div>
        </div>
        <div className={styles.statDivider}></div>
        <div className={styles.statItem}>
          <div className={styles.statIcon}>
            <Flame size={16} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{streak?.currentStreak || 0}</span>
            <span className={styles.statLabel}>Streak</span>
          </div>
        </div>
        <div className={styles.statDivider}></div>
        <div className={styles.statItem}>
          <div className={styles.statIcon}>
            <Zap size={16} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{level?.experience || 0}</span>
            <span className={styles.statLabel}>XP</span>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className={styles.balanceCard}>
        <div className={styles.balanceLeft}>
          <Coins size={24} className={styles.balanceIcon} />
          <div>
            <span className={styles.balanceLabel}>Your Balance</span>
            <span className={styles.balanceValue}>{balance.toLocaleString()} Broins</span>
          </div>
        </div>
        <Link href="/dashboard/wallet" className={styles.balanceBtn}>
          Top Up
        </Link>
      </div>

      {/* Menu Items */}
      <div className={styles.menuSection}>
        <Link href="/dashboard/settings" className={styles.menuItem}>
          <div className={styles.menuItemLeft}>
            <div className={styles.menuIcon}>
              <Settings size={20} />
            </div>
            <span>Profile Settings</span>
          </div>
          <ChevronRight size={20} className={styles.menuArrow} />
        </Link>

        <Link href="/dashboard/badges" className={styles.menuItem}>
          <div className={styles.menuItemLeft}>
            <div className={styles.menuIcon}>
              <Award size={20} />
            </div>
            <span>Badges</span>
            {profile && (
              <span className={styles.menuBadge}>{profile.badgesEarned}</span>
            )}
          </div>
          <ChevronRight size={20} className={styles.menuArrow} />
        </Link>

        <Link href="/dashboard/wallet" className={styles.menuItem}>
          <div className={styles.menuItemLeft}>
            <div className={styles.menuIcon}>
              <Wallet size={20} />
            </div>
            <span>Wallet</span>
          </div>
          <ChevronRight size={20} className={styles.menuArrow} />
        </Link>

        <Link href="/dashboard/subscription" className={styles.menuItem}>
          <div className={styles.menuItemLeft}>
            <div className={`${styles.menuIcon} ${subscription?.isPro ? styles.proIcon : ''}`}>
              <Crown size={20} />
            </div>
            <span>{subscription?.isPro ? 'Manage Subscription' : 'Upgrade to Pro'}</span>
            {subscription?.isPro && <span className={styles.proBadge}>PRO</span>}
          </div>
          <ChevronRight size={20} className={styles.menuArrow} />
        </Link>

        <Link href="/dashboard/referral" className={styles.menuItem}>
          <div className={styles.menuItemLeft}>
            <div className={styles.menuIcon}>
              <Gift size={20} />
            </div>
            <span>Referrals</span>
            {profile && profile.totalReferrals > 0 && (
              <span className={styles.menuBadge}>{profile.totalReferrals}</span>
            )}
          </div>
          <ChevronRight size={20} className={styles.menuArrow} />
        </Link>
      </div>

      {/* Logout Button */}
      <button className={styles.logoutBtn} onClick={handleLogoutClick}>
        <LogOut size={20} />
        <span>Sign Out</span>
      </button>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className={styles.modalOverlay} onClick={handleLogoutCancel}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={handleLogoutCancel}>
              <X size={20} />
            </button>
            <div className={styles.modalIcon}>
              <LogOut size={32} />
            </div>
            <h3 className={styles.modalTitle}>Sign Out?</h3>
            <p className={styles.modalText}>
              Are you sure you want to sign out of your account?
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelBtn}
                onClick={handleLogoutCancel}
                disabled={isLoggingOut}
              >
                Cancel
              </button>
              <button
                className={styles.modalConfirmBtn}
                onClick={handleLogoutConfirm}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
