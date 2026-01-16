'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/services';
import type {
  AnalyticsOverviewResponse,
  UserGrowthResponse,
  RevenueTrendResponse,
  TransactionBreakdownResponse,
  TopPagesResponse,
  AnalyticsPeriod
} from '@/types';
import {
  Users,
  DollarSign,
  FileText,
  Coins,
  TrendingUp,
  BarChart3,
  Calendar,
  ShoppingCart,
  Trophy,
  LayoutGrid,
  UploadCloud,
  Folder,
  Wallet,
  User,
  Settings,
  Crown,
  Gift,
  Award,
  type LucideIcon
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import styles from './admin.module.css';

const PERIOD_OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1y', label: '1 Year' },
];

const CHART_COLORS = ['#f59e0b', '#8b5cf6', '#10b981', '#ef4444', '#3b82f6', '#ec4899'];

// Page path to display name and icon mapping
const PAGE_INFO: Record<string, { name: string; icon: LucideIcon }> = {
  '/dashboard': { name: 'Home', icon: LayoutGrid },
  '/dashboard/upload': { name: 'Upload', icon: UploadCloud },
  '/dashboard/content': { name: 'Content', icon: Folder },
  '/dashboard/wallet': { name: 'Wallet', icon: Wallet },
  '/dashboard/leaderboard': { name: 'Leaderboard', icon: Trophy },
  '/dashboard/profile': { name: 'Profile', icon: User },
  '/dashboard/settings': { name: 'Settings', icon: Settings },
  '/dashboard/subscription': { name: 'Subscription', icon: Crown },
  '/dashboard/referral': { name: 'Referral', icon: Gift },
  '/dashboard/badges': { name: 'Badges', icon: Award },
  '/dashboard/admin': { name: 'Analytics', icon: BarChart3 },
};

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [overview, setOverview] = useState<AnalyticsOverviewResponse | null>(null);
  const [userGrowth, setUserGrowth] = useState<UserGrowthResponse | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendResponse | null>(null);
  const [transactions, setTransactions] = useState<TransactionBreakdownResponse | null>(null);
  const [topPages, setTopPages] = useState<TopPagesResponse | null>(null);

  const [period, setPeriod] = useState<AnalyticsPeriod>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedOnce = useRef(false);

  const fetchData = useCallback(async () => {
    try {
      if (!hasLoadedOnce.current) {
        setIsLoading(true);
      }
      setError(null);

      const [overviewData, growthData, revenueData, txData, pagesData] = await Promise.all([
        adminService.getOverview(),
        adminService.getUserGrowth(period),
        adminService.getRevenueTrend(period),
        adminService.getTransactionBreakdown(period),
        adminService.getTopPages(10),
      ]);

      setOverview(overviewData);
      setUserGrowth(growthData);
      setRevenueTrend(revenueData);
      setTransactions(txData);
      setTopPages(pagesData);
      hasLoadedOnce.current = true;
    } catch (err: unknown) {
      console.error('Failed to fetch admin analytics:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr.response?.status === 403) {
          setError('Access denied. Admin privileges required.');
        } else {
          setError('Failed to load analytics data.');
        }
      } else {
        setError('Failed to load analytics data.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      fetchData();
    }
  }, [authLoading, isAuthenticated, router, fetchData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format camelCase to readable text (e.g., "SubscriptionBonus" -> "Subscription Bonus")
  const formatTransactionType = (type: string) => {
    return type.replace(/([A-Z])/g, ' $1').trim();
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
          <div className={`${styles.skeleton} ${styles.skeletonSubtitle}`}></div>
        </div>

        <div className={styles.statsGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`${styles.skeleton} ${styles.skeletonCard}`}></div>
          ))}
        </div>

        <div className={styles.chartsGrid}>
          <div className={`${styles.skeleton} ${styles.skeletonChart}`}></div>
          <div className={`${styles.skeleton} ${styles.skeletonChart}`}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorCard}>
          <h2>Access Denied</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Admin Analytics</h1>
          <p className={styles.subtitle}>Platform overview and metrics</p>
        </div>

        {/* Period Selector */}
        <div className={styles.periodSelector}>
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`${styles.periodBtn} ${period === opt.value ? styles.activeBtn : ''}`}
              onClick={() => setPeriod(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      {overview && (
        <div className={styles.statsGrid}>
          {/* Users Card */}
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.statIcon} ${styles.usersIcon}`}>
                <Users size={20} />
              </div>
              <span className={styles.statLabel}>Users</span>
            </div>
            <div className={styles.statValue}>{formatNumber(overview.users.total)}</div>
            <div className={styles.statDetails}>
              <span>Today: +{overview.users.today}</span>
              <span>This week: +{overview.users.thisWeek}</span>
              <span>This month: +{overview.users.thisMonth}</span>
            </div>
          </div>

          {/* Revenue Card */}
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.statIcon} ${styles.revenueIcon}`}>
                <DollarSign size={20} />
              </div>
              <span className={styles.statLabel}>Revenue</span>
            </div>
            <div className={styles.statValue}>{formatCurrency(overview.revenue.totalUSD)}</div>
            <div className={styles.statDetails}>
              <span>This month: {formatCurrency(overview.revenue.thisMonthUSD)}</span>
              <span>Transactions: {formatNumber(overview.revenue.totalTransactions)}</span>
            </div>
          </div>

          {/* Content Card */}
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.statIcon} ${styles.contentIcon}`}>
                <FileText size={20} />
              </div>
              <span className={styles.statLabel}>Content</span>
            </div>
            <div className={styles.statValue}>{formatNumber(overview.content.totalUploads)}</div>
            <div className={styles.statDetails}>
              <span>PDFs: {formatNumber(overview.content.totalPdfs)}</span>
              <span>Flashcards: {formatNumber(overview.content.totalFlashcards)}</span>
            </div>
          </div>

          {/* Economy Card */}
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.statIcon} ${styles.economyIcon}`}>
                <Coins size={20} />
              </div>
              <span className={styles.statLabel}>Economy</span>
            </div>
            <div className={styles.statValue}>{formatNumber(overview.economy.totalBroinsInCirculation)}</div>
            <div className={styles.statDetails}>
              <span>Spent: {formatNumber(overview.economy.totalBroinsSpent)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className={styles.chartsGrid}>
        {/* User Growth Chart */}
        {userGrowth && (
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <TrendingUp size={18} />
              <h3>User Growth</h3>
            </div>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={userGrowth.data}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke="rgba(255,255,255,0.5)"
                    fontSize={12}
                  />
                  <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#fff' }}
                    labelFormatter={formatDate}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalUsers"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="url(#colorUsers)"
                    name="Total Users"
                  />
                  <Line
                    type="monotone"
                    dataKey="newUsers"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                    name="New Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Revenue Trend Chart */}
        {revenueTrend && (
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <BarChart3 size={18} />
              <h3>Revenue Trend</h3>
            </div>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenueTrend.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke="rgba(255,255,255,0.5)"
                    fontSize={12}
                  />
                  <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#fff' }}
                    labelFormatter={formatDate}
                    formatter={(value) => [`$${value ?? 0}`, 'Revenue']}
                  />
                  <Bar dataKey="revenueUSD" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Row */}
      <div className={styles.bottomGrid}>
        {/* Transaction Breakdown */}
        {transactions && (
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <ShoppingCart size={18} />
              <h3>Transaction Breakdown</h3>
            </div>
            <div className={styles.breakdownContent}>
              <div className={styles.pieContainer}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={transactions.byType.map(t => ({ ...t, type: formatTransactionType(t.type) })) as unknown as Record<string, unknown>[]}
                      dataKey="totalBroins"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                    >
                      {transactions.byType.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(value) => [`${formatNumber(value as number)} Broins`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className={styles.breakdownList}>
                {transactions.byType.map((item, index) => (
                  <div key={item.type} className={styles.breakdownItem}>
                    <div className={styles.breakdownColor} style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}></div>
                    <span className={styles.breakdownType}>{formatTransactionType(item.type)}</span>
                    <span className={styles.breakdownBroins}>{formatNumber(item.totalBroins)} B</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Purchases */}
        {transactions && transactions.recentPurchases.length > 0 && (
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <Calendar size={18} />
              <h3>Recent Purchases</h3>
            </div>
            <div className={styles.purchasesList}>
              {transactions.recentPurchases.map((purchase, index) => (
                <div key={index} className={styles.purchaseItem}>
                  <div className={styles.purchaseUser}>
                    <span className={styles.purchaseUsername}>{purchase.username}</span>
                    <span className={styles.purchaseDate}>
                      {new Date(purchase.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={styles.purchaseAmount}>
                    <span className={styles.purchaseUsd}>{formatCurrency(purchase.amountUSD)}</span>
                    <span className={styles.purchaseBroins}>{formatNumber(purchase.broins)} B</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Top Pages */}
      {topPages && topPages.pages.filter(p => PAGE_INFO[p.path]).length > 0 && (
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <Trophy size={18} />
            <h3>Top Pages</h3>
          </div>
          <div className={styles.topPagesList}>
            <div className={styles.topPagesHeader}>
              <span className={styles.topPagesPath}>Page</span>
              <span className={styles.topPagesViews}>Views</span>
              <span className={styles.topPagesUsers}>Users</span>
            </div>
            {topPages.pages
              .filter(p => PAGE_INFO[p.path])
              .map((page, index) => {
                const pageInfo = PAGE_INFO[page.path];
                const Icon = pageInfo.icon;
                return (
                  <div key={page.path} className={styles.topPageItem}>
                    <div className={styles.topPageRank}>#{index + 1}</div>
                    <div className={styles.topPageName}>
                      <Icon size={16} className={styles.topPageIcon} />
                      <span>{pageInfo.name}</span>
                    </div>
                    <span className={styles.topPageViews}>{formatNumber(page.viewCount)}</span>
                    <span className={styles.topPageUsers}>{formatNumber(page.uniqueUsers)}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
