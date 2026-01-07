'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { walletService } from '@/services';
import styles from './layout.module.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading: authLoading, isAuthenticated } = useAuth();
  const [balance, setBalance] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchBalance = useCallback(async () => {
    try {
      const res = await walletService.getBalance();
      setBalance(res.balance);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      fetchBalance();
    }
  }, [authLoading, isAuthenticated, router, fetchBalance]);

  const handleLogout = async () => {
    if (!confirm('Are you sure you want to sign out?')) return;
    await logout();
    router.push('/');
  };

  const closeSidebar = () => setSidebarOpen(false);

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

  const getUserName = () => {
    if (!user?.email) return 'User';
    return user.email.split('@')[0];
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
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logo}>
            <Image src="/images/bravio-logo.png" alt="Bravio" width={40} height={40} />
          </Link>
          <button className={styles.closeSidebar} onClick={closeSidebar}>
            &times;
          </button>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navSection}>
            <div className={styles.navLabel}>Menu</div>
            <Link
              href="/dashboard"
              className={`${styles.navItem} ${isActive('/dashboard') && pathname === '/dashboard' ? styles.active : ''}`}
              onClick={closeSidebar}
            >
              <span className={styles.navIcon}>📊</span>
              Overview
            </Link>
            <Link
              href="/dashboard/upload"
              className={`${styles.navItem} ${isActive('/dashboard/upload') ? styles.active : ''}`}
              onClick={closeSidebar}
            >
              <span className={styles.navIcon}>📤</span>
              Upload Content
            </Link>
            <Link
              href="/dashboard/content"
              className={`${styles.navItem} ${isActive('/dashboard/content') ? styles.active : ''}`}
              onClick={closeSidebar}
            >
              <span className={styles.navIcon}>📚</span>
              My Content
            </Link>
          </div>

          <div className={styles.navSection}>
            <div className={styles.navLabel}>Account</div>
            <Link
              href="/dashboard/wallet"
              className={`${styles.navItem} ${isActive('/dashboard/wallet') ? styles.active : ''}`}
              onClick={closeSidebar}
            >
              <span className={styles.navIcon}>💰</span>
              Wallet
            </Link>
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.balanceCard}>
            <div className={styles.balanceLabel}>Your Balance</div>
            <div className={styles.balanceValue}>
              <Image src="/images/broin-coin.png" alt="Broins" width={24} height={24} />
              {balance} Broins
            </div>
          </div>

          <div className={styles.userSection}>
            <div className={styles.userAvatar}>{getUserInitials()}</div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{getUserName()}</div>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout} title="Sign out">
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className={styles.mobileHeader}>
        <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
          ☰
        </button>
        <Link href="/" className={styles.mobileLogo}>
          <Image src="/images/bravio-logo.png" alt="Bravio" width={32} height={32} />
        </Link>
        <div className={styles.mobileBalance}>
          <Image src="/images/broin-coin.png" alt="Broins" width={18} height={18} />
          {balance}
        </div>
      </header>

      {/* Overlay */}
      {sidebarOpen && (
        <div className={`${styles.overlay} ${styles.active}`} onClick={closeSidebar}></div>
      )}

      {/* Main Content */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
