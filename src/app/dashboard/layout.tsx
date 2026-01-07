'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { walletService } from '@/services';
import { LayoutGrid, UploadCloud, Folder, Wallet, LogOut, Coins } from 'lucide-react';
import styles from './layout.module.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading: authLoading, isAuthenticated } = useAuth();
  const [balance, setBalance] = useState(0);

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
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.balanceCard}>
            <p className={styles.balanceLabel}>Your Balance</p>
            <div className={styles.balanceValue}>
              <Coins className={styles.balanceIcon} />
              <span>{balance}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className={styles.mobileHeader}>
        <Link href="/" className={styles.mobileLogo}>
          <div className={styles.mobileLogoIcon}>B</div>
          <span>Bravio</span>
        </Link>
        <div className={styles.mobileBalance}>
          <Image src="/images/broin-coin.png" alt="Broins" width={18} height={18} />
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
          <span>Content</span>
        </Link>
        <Link
          href="/dashboard/wallet"
          className={`${styles.bottomNavItem} ${isActive('/dashboard/wallet') ? styles.active : ''}`}
        >
          <Wallet size={20} />
          <span>Wallet</span>
        </Link>
        <button className={styles.bottomNavItem} onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
}
