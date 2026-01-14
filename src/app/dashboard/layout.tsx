'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { walletService, subscriptionService } from '@/services';
import type { SubscriptionStatusResponse } from '@/types';
import { LayoutGrid, UploadCloud, Folder, Wallet, Coins, Gift, Crown, Award, Trophy, Settings, User } from 'lucide-react';
import styles from './layout.module.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [balance, setBalance] = useState(0);
  const [subscription, setSubscription] = useState<SubscriptionStatusResponse | null>(null);

  const fetchBalance = useCallback(async () => {
    try {
      const res = await walletService.getBalance();
      setBalance(res.balance);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  }, []);

  const fetchSubscription = useCallback(async () => {
    try {
      const res = await subscriptionService.getStatus();
      setSubscription(res);
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      fetchBalance();
      fetchSubscription();
    }
  }, [authLoading, isAuthenticated, router, fetchBalance, fetchSubscription]);

  // Listen for balance update events from other components
  useEffect(() => {
    const handleBalanceUpdate = () => {
      fetchBalance();
    };
    window.addEventListener('balanceUpdated', handleBalanceUpdate);
    return () => {
      window.removeEventListener('balanceUpdated', handleBalanceUpdate);
    };
  }, [fetchBalance]);

  // Listen for subscription update events from other components
  useEffect(() => {
    const handleSubscriptionUpdate = () => {
      fetchSubscription();
    };
    window.addEventListener('subscriptionUpdated', handleSubscriptionUpdate);
    return () => {
      window.removeEventListener('subscriptionUpdated', handleSubscriptionUpdate);
    };
  }, [fetchSubscription]);

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardLayout}>
      {/* Sidebar - Desktop Only */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>B</div>
            <span className={styles.logoText}>Bravio</span>
          </Link>
        </div>

        <nav className={styles.nav}>
          <p className={styles.navLabel}>Menu</p>

          <Link
            href="/dashboard"
            className={`${styles.navItem} ${isActive('/dashboard') && pathname === '/dashboard' ? styles.active : ''}`}
          >
            <LayoutGrid className={styles.navIcon} />
            <span>Overview</span>
          </Link>
          <Link
            href="/dashboard/upload"
            className={`${styles.navItem} ${isActive('/dashboard/upload') ? styles.active : ''}`}
          >
            <UploadCloud className={styles.navIcon} />
            <span>Upload Content</span>
          </Link>
          <Link
            href="/dashboard/content"
            className={`${styles.navItem} ${isActive('/dashboard/content') ? styles.active : ''}`}
          >
            <Folder className={styles.navIcon} />
            <span>My Content</span>
          </Link>
          <Link
            href="/dashboard/wallet"
            className={`${styles.navItem} ${isActive('/dashboard/wallet') ? styles.active : ''}`}
          >
            <Wallet className={styles.navIcon} />
            <span>Wallet</span>
          </Link>
          <Link
            href="/dashboard/referral"
            className={`${styles.navItem} ${isActive('/dashboard/referral') ? styles.active : ''}`}
          >
            <Gift className={styles.navIcon} />
            <span>Referrals</span>
          </Link>
          <Link
            href="/dashboard/leaderboard"
            className={`${styles.navItem} ${isActive('/dashboard/leaderboard') ? styles.active : ''}`}
          >
            <Trophy className={styles.navIcon} />
            <span>Leaderboard</span>
          </Link>
          <Link
            href="/dashboard/badges"
            className={`${styles.navItem} ${isActive('/dashboard/badges') ? styles.active : ''}`}
          >
            <Award className={styles.navIcon} />
            <span>Badges</span>
          </Link>

          <p className={styles.navLabel}>Account</p>

          <Link
            href="/dashboard/settings"
            className={`${styles.navItem} ${styles.settingsItem} ${isActive('/dashboard/settings') ? styles.active : ''}`}
          >
            <Settings className={styles.navIcon} />
            <span>Profile</span>
            {subscription?.isPro && <span className={styles.proBadge}>PRO</span>}
          </Link>
          <Link
            href="/dashboard/subscription"
            className={`${styles.navItem} ${styles.subscriptionItem} ${isActive('/dashboard/subscription') ? styles.active : ''}`}
          >
            <Crown className={styles.navIcon} />
            <span>Subscription</span>
          </Link>
        </nav>

      </aside>

      {/* Mobile Header */}
      <header className={styles.mobileHeader}>
        <Link href="/" className={styles.mobileLogo}>
          <div className={styles.mobileLogoIcon}>B</div>
          <span>Bravio</span>
        </Link>
        <div className={styles.mobileBalance}>
          <Coins size={16} />
          <span>{balance}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className={styles.bottomNav}>
        <Link
          href="/dashboard"
          className={`${styles.bottomNavItem} ${isActive('/dashboard') && pathname === '/dashboard' ? styles.active : ''}`}
        >
          <LayoutGrid size={20} />
          <span>Home</span>
        </Link>
        <Link
          href="/dashboard/upload"
          className={`${styles.bottomNavItem} ${isActive('/dashboard/upload') ? styles.active : ''}`}
        >
          <UploadCloud size={20} />
          <span>Upload</span>
        </Link>
        <Link
          href="/dashboard/content"
          className={`${styles.bottomNavItem} ${isActive('/dashboard/content') ? styles.active : ''}`}
        >
          <Folder size={20} />
          <span>Learn</span>
        </Link>
        <Link
          href="/dashboard/leaderboard"
          className={`${styles.bottomNavItem} ${isActive('/dashboard/leaderboard') ? styles.active : ''}`}
        >
          <Trophy size={20} />
          <span>Rank</span>
        </Link>
        <Link
          href="/dashboard/profile"
          className={`${styles.bottomNavItem} ${isActive('/dashboard/profile') && pathname === '/dashboard/profile' ? styles.active : ''} ${isActive('/dashboard/settings') || isActive('/dashboard/badges') || isActive('/dashboard/wallet') || isActive('/dashboard/subscription') || isActive('/dashboard/referral') ? styles.active : ''}`}
        >
          <User size={20} />
          <span>Profile</span>
        </Link>
      </nav>

    </div>
  );
}
