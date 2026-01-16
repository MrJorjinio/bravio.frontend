'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { uploadService, userService, adminService } from '@/services';
import type {
  Upload,
  StreakResponse,
  LevelResponse,
  WeeklyActivityResponse,
  AnalyticsOverviewResponse,
  UserGrowthResponse,
  RevenueTrendResponse,
  TopPagesResponse,
  UploadSourcesResponse,
  BroinEarningsResponse,
  DetailedMetricsResponse,
  AnalyticsPeriod,
  MetricsPeriod
} from '@/types';
import {
  Gift,
  Users,
  DollarSign,
  FileText,
  Coins,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Trophy,
  LayoutGrid,
  UploadCloud,
  Folder,
  Wallet,
  User,
  Settings,
  Crown,
  Award,
  PieChart as PieChartIcon,
  Table,
  type LucideIcon
} from 'lucide-react';
import {
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
import {
  CompactHeader,
  QuickActions,
  ContinueLearning,
  StreakCalendar
} from '@/components/dashboard';
import styles from './page.module.css';
import adminStyles from './admin/admin.module.css';

// Admin constants
const PERIOD_OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1y', label: '1 Year' },
];

const METRICS_PERIOD_OPTIONS: { value: MetricsPeriod; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const CHART_COLORS = ['#f59e0b', '#8b5cf6', '#10b981', '#ef4444', '#3b82f6', '#ec4899'];
const SOURCE_COLORS = {
  text: '#f59e0b',
  pdf: '#8b5cf6',
  url: '#10b981',
  voice: '#3b82f6'
};
const EARNING_COLORS: Record<string, string> = {
  DailyBonus: '#f59e0b',
  LevelUp: '#8b5cf6',
  StreakBonus: '#10b981',
  Referral: '#ef4444',
  SubscriptionBonus: '#3b82f6',
  SignupBonus: '#ec4899'
};

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
};

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin === true;

  // User dashboard state
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [streak, setStreak] = useState<StreakResponse | null>(null);
  const [level, setLevel] = useState<LevelResponse | null>(null);
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [bonusMessage, setBonusMessage] = useState('');
  const [dailyBonusClaimed, setDailyBonusClaimed] = useState(false);

  // Admin dashboard state
  const [overview, setOverview] = useState<AnalyticsOverviewResponse | null>(null);
  const [userGrowth, setUserGrowth] = useState<UserGrowthResponse | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendResponse | null>(null);
  const [topPages, setTopPages] = useState<TopPagesResponse | null>(null);
  const [uploadSources, setUploadSources] = useState<UploadSourcesResponse | null>(null);
  const [broinEarnings, setBroinEarnings] = useState<BroinEarningsResponse | null>(null);
  const [detailedMetrics, setDetailedMetrics] = useState<DetailedMetricsResponse | null>(null);
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d');
  const [metricsPeriod, setMetricsPeriod] = useState<MetricsPeriod>('weekly');
  const [adminError, setAdminError] = useState<string | null>(null);
  const hasLoadedOnce = useRef(false);
  // User dashboard data fetch
  const fetchUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [
        uploadsRes,
        streakRes,
        levelRes,
        weeklyActivityRes
      ] = await Promise.all([
        uploadService.getUploads(1, 3, 'completed'),
        userService.getStreak().catch(() => null),
        userService.getLevel().catch(() => null),
        userService.getWeeklyActivity().catch(() => null)
      ]);

      setUploads(uploadsRes.uploads || []);
      setStreak(streakRes);
      setLevel(levelRes);
      setWeeklyActivity(weeklyActivityRes);
      setDailyBonusClaimed(streakRes?.dailyBonusClaimed || false);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Admin dashboard data fetch
  const fetchAdminData = useCallback(async () => {
    try {
      if (!hasLoadedOnce.current) {
        setIsLoading(true);
      }
      setAdminError(null);

      const [overviewData, growthData, revenueData, pagesData, sourcesData, earningsData, metricsData] = await Promise.all([
        adminService.getOverview(),
        adminService.getUserGrowth(period),
        adminService.getRevenueTrend(period),
        adminService.getTopPages(10, period),
        adminService.getUploadSources(period),
        adminService.getBroinEarnings(period),
        adminService.getDetailedMetrics(metricsPeriod),
      ]);

      setOverview(overviewData);
      setUserGrowth(growthData);
      setRevenueTrend(revenueData);
      setTopPages(pagesData);
      setUploadSources(sourcesData);
      setBroinEarnings(earningsData);
      setDetailedMetrics(metricsData);
      hasLoadedOnce.current = true;
    } catch (err: unknown) {
      console.error('Failed to fetch admin analytics:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr.response?.status === 403) {
          setAdminError('Access denied. Admin privileges required.');
        } else {
          setAdminError('Failed to load analytics data.');
        }
      } else {
        setAdminError('Failed to load analytics data.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [period, metricsPeriod]);

  const handleClaimDailyBonus = async () => {
    try {
      const result = await userService.claimDailyBonus();
      setBonusMessage(result.message);
      setShowBonusModal(true);
      if (result.claimed) {
        setDailyBonusClaimed(true);
        window.dispatchEvent(new CustomEvent('balanceUpdated'));
      }
    } catch (err) {
      setBonusMessage('Failed to claim bonus. Try again later.');
      setShowBonusModal(true);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    } else {
      fetchUserData();
    }

    // Refresh data when returning to the page (visibility change)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (isAdmin) {
          fetchAdminData();
        } else {
          fetchUserData();
        }
      }
    };

    // Refresh data when practice is completed (custom event) - user only
    const handlePracticeComplete = () => {
      if (!isAdmin) {
        fetchUserData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('practiceComplete', handlePracticeComplete);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('practiceComplete', handlePracticeComplete);
    };
  }, [isAdmin, fetchAdminData, fetchUserData]);

  // Admin helper functions
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

  const renderPercentChange = (change: number, isNew?: boolean) => {
    if (isNew) {
      return (
        <span className={`${adminStyles.percentChange} ${adminStyles.newBadge}`}>
          New
        </span>
      );
    }
    const isPositive = change >= 0;
    return (
      <span className={`${adminStyles.percentChange} ${isPositive ? adminStyles.positive : adminStyles.negative}`}>
        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {isPositive ? '+' : ''}{change.toFixed(1)}%
      </span>
    );
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Excellent': return adminStyles.statusExcellent;
      case 'Good': return adminStyles.statusGood;
      case 'Fair': return adminStyles.statusFair;
      case 'Poor': return adminStyles.statusPoor;
      default: return '';
    }
  };

  const getUserName = () => {
    if (!user?.username) return 'there';
    return user.username;
  };

  // Get first upload for quick actions (all uploads are already completed)
  const lastPracticedUpload = uploads[0];

  // Daily bonus amount based on tier (simplified - would come from user data)
  const dailyBonusAmount = 10;

  // Prepare upload sources data for pie chart (admin)
  const uploadSourcesData = uploadSources ? [
    { name: 'Text', value: uploadSources.textUploads, percent: uploadSources.textPercent, color: SOURCE_COLORS.text },
    { name: 'PDF', value: uploadSources.pdfUploads, percent: uploadSources.pdfPercent, color: SOURCE_COLORS.pdf },
    { name: 'URL', value: uploadSources.urlUploads, percent: uploadSources.urlPercent, color: SOURCE_COLORS.url },
    { name: 'Voice', value: uploadSources.voiceUploads, percent: uploadSources.voicePercent, color: SOURCE_COLORS.voice },
  ].filter(item => item.value > 0) : [];

  // Prepare broin earnings data for pie chart (admin)
  const broinEarningsData = broinEarnings ? broinEarnings.sources.map(source => ({
    name: source.displayName,
    value: source.totalBroins,
    percent: source.percent,
    color: EARNING_COLORS[source.source] || '#6b7280'
  })).filter(item => item.value > 0) : [];

  // Admin Dashboard Loading
  if (isAdmin && isLoading) {
    return (
      <div className={adminStyles.container}>
        <div className={adminStyles.header}>
          <div className={`${adminStyles.skeleton} ${adminStyles.skeletonTitle}`}></div>
          <div className={`${adminStyles.skeleton} ${adminStyles.skeletonSubtitle}`}></div>
        </div>
        <div className={adminStyles.statsGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`${adminStyles.skeleton} ${adminStyles.skeletonCard}`}></div>
          ))}
        </div>
        <div className={adminStyles.chartsGrid}>
          <div className={`${adminStyles.skeleton} ${adminStyles.skeletonChart}`}></div>
          <div className={`${adminStyles.skeleton} ${adminStyles.skeletonChart}`}></div>
        </div>
      </div>
    );
  }

  // Admin Dashboard Error
  if (isAdmin && adminError) {
    return (
      <div className={adminStyles.container}>
        <div className={adminStyles.errorCard}>
          <h2>Access Denied</h2>
          <p>{adminError}</p>
        </div>
      </div>
    );
  }

  // Admin Dashboard Content
  if (isAdmin) {
    return (
      <div className={adminStyles.container}>
        {/* Header */}
        <div className={adminStyles.header}>
          <div className={adminStyles.headerLeft}>
            <h1 className={adminStyles.title}>Results Summary</h1>
            <p className={adminStyles.subtitle}>Overview of key metrics and performance indicators</p>
          </div>

          {/* Period Selector */}
          <div className={adminStyles.periodSelector}>
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`${adminStyles.periodBtn} ${period === opt.value ? adminStyles.activeBtn : ''}`}
                onClick={() => setPeriod(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Stats with Percentages */}
        {overview && (
          <div className={adminStyles.statsGrid}>
            {/* Users Card */}
            <div className={adminStyles.statCard}>
              <div className={adminStyles.statHeader}>
                <div className={`${adminStyles.statIcon} ${adminStyles.usersIcon}`}>
                  <Users size={20} />
                </div>
                <span className={adminStyles.statLabel}>Users</span>
              </div>
              <div className={adminStyles.statValueRow}>
                <div className={adminStyles.statValue}>{formatNumber(overview.users.total)}</div>
                {renderPercentChange(overview.users.weekOverWeekChange, overview.users.weekOverWeekIsNew)}
              </div>
              <div className={adminStyles.statDetails}>
                <span>Today: +{overview.users.today}</span>
                <span>This week: +{overview.users.thisWeek}</span>
              </div>
            </div>

            {/* Revenue Card */}
            <div className={adminStyles.statCard}>
              <div className={adminStyles.statHeader}>
                <div className={`${adminStyles.statIcon} ${adminStyles.revenueIcon}`}>
                  <DollarSign size={20} />
                </div>
                <span className={adminStyles.statLabel}>Revenue</span>
              </div>
              <div className={adminStyles.statValueRow}>
                <div className={adminStyles.statValue}>{formatCurrency(overview.revenue.thisMonthUSD)}</div>
                {renderPercentChange(overview.revenue.monthOverMonthChange, overview.revenue.monthOverMonthIsNew)}
              </div>
              <div className={adminStyles.statDetails}>
                <span>Total: {formatCurrency(overview.revenue.totalUSD)}</span>
                <span>Transactions: {formatNumber(overview.revenue.transactionsThisMonth)}</span>
              </div>
            </div>

            {/* Uploads Card */}
            <div className={adminStyles.statCard}>
              <div className={adminStyles.statHeader}>
                <div className={`${adminStyles.statIcon} ${adminStyles.contentIcon}`}>
                  <FileText size={20} />
                </div>
                <span className={adminStyles.statLabel}>Uploads</span>
              </div>
              <div className={adminStyles.statValueRow}>
                <div className={adminStyles.statValue}>{formatNumber(overview.content.uploadsThisWeek)}</div>
                {renderPercentChange(overview.content.weekOverWeekChange, overview.content.weekOverWeekIsNew)}
              </div>
              <div className={adminStyles.statDetails}>
                <span>Total: {formatNumber(overview.content.totalUploads)}</span>
                <span>Flashcards: {formatNumber(overview.content.totalFlashcards)}</span>
              </div>
            </div>

            {/* Economy Card */}
            <div className={adminStyles.statCard}>
              <div className={adminStyles.statHeader}>
                <div className={`${adminStyles.statIcon} ${adminStyles.economyIcon}`}>
                  <Coins size={20} />
                </div>
                <span className={adminStyles.statLabel}>Broins</span>
              </div>
              <div className={adminStyles.statValueRow}>
                <div className={adminStyles.statValue}>{formatNumber(overview.economy.totalBroinsInCirculation)}</div>
              </div>
              <div className={adminStyles.statDetails}>
                <span>Spent: {formatNumber(overview.economy.totalBroinsSpent)}</span>
                <span>Purchased: {formatNumber(overview.economy.totalBroinsPurchased)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Charts Row - Revenue Trend & User Growth */}
        <div className={adminStyles.chartsGrid}>
          {/* Revenue Trend Chart */}
          {revenueTrend && (
            <div className={adminStyles.chartCard}>
              <div className={adminStyles.chartHeader}>
                <BarChart3 size={18} />
                <h3>Revenue Trend</h3>
              </div>
              <div className={adminStyles.chartContainer}>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={revenueTrend.data}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" tickFormatter={formatDate} stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff' }}
                      labelFormatter={formatDate}
                      formatter={(value) => [`$${value ?? 0}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenueUSD" stroke="#10b981" strokeWidth={2} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* User Growth Chart */}
          {userGrowth && (
            <div className={adminStyles.chartCard}>
              <div className={adminStyles.chartHeader}>
                <TrendingUp size={18} />
                <h3>User Growth</h3>
              </div>
              <div className={adminStyles.chartContainer}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={userGrowth.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" tickFormatter={formatDate} stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff' }}
                      labelFormatter={formatDate}
                    />
                    <Bar dataKey="newUsers" fill="#f59e0b" radius={[4, 4, 0, 0]} name="New Users" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Second Row - Upload Sources & Top Pages */}
        <div className={adminStyles.bottomGrid}>
          {/* Upload Sources Pie Chart */}
          {uploadSources && uploadSourcesData.length > 0 && (
            <div className={adminStyles.chartCard}>
              <div className={adminStyles.chartHeader}>
                <PieChartIcon size={18} />
                <h3>Upload Sources</h3>
              </div>
              <div className={adminStyles.breakdownContent}>
                <div className={adminStyles.pieContainer}>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={uploadSourcesData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                        {uploadSourcesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ color: 'rgba(255, 255, 255, 0.7)' }}
                        formatter={(value, name) => [`${formatNumber(value as number)} uploads`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className={adminStyles.sourcesLegend}>
                  {uploadSourcesData.map((item) => (
                    <div key={item.name} className={adminStyles.sourceItem}>
                      <div className={adminStyles.sourceColor} style={{ backgroundColor: item.color }}></div>
                      <span className={adminStyles.sourceName}>{item.name}</span>
                      <span className={adminStyles.sourcePercent}>{item.percent}%</span>
                      <span className={adminStyles.sourceCount}>{formatNumber(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Top Earning Broins Pie Chart */}
          {broinEarnings && broinEarningsData.length > 0 && (
            <div className={adminStyles.chartCard}>
              <div className={adminStyles.chartHeader}>
                <Coins size={18} />
                <h3>Top Earning Broins</h3>
              </div>
              <div className={adminStyles.breakdownContent}>
                <div className={adminStyles.pieContainer}>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={broinEarningsData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                        {broinEarningsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ color: 'rgba(255, 255, 255, 0.7)' }}
                        formatter={(value) => [`${formatNumber(value as number)} broins`, '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className={adminStyles.sourcesLegend}>
                  {broinEarningsData.map((item) => (
                    <div key={item.name} className={adminStyles.sourceItem}>
                      <div className={adminStyles.sourceColor} style={{ backgroundColor: item.color }}></div>
                      <span className={adminStyles.sourceName}>{item.name}</span>
                      <span className={adminStyles.sourcePercent}>{item.percent}%</span>
                      <span className={adminStyles.sourceCount}>{formatNumber(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Top Pages with Percentage Changes */}
          {topPages && topPages.pages.filter(p => PAGE_INFO[p.path]).length > 0 && (
            <div className={adminStyles.chartCard}>
              <div className={adminStyles.chartHeader}>
                <Trophy size={18} />
                <h3>Top Performing Pages</h3>
              </div>
              <div className={adminStyles.topPagesList}>
                <div className={adminStyles.topPagesHeader}>
                  <span className={adminStyles.topPagesPath}>Page</span>
                  <span className={adminStyles.topPagesViews}>Views</span>
                  <span className={adminStyles.topPagesChange}>Change</span>
                </div>
                {topPages.pages.filter(p => PAGE_INFO[p.path]).slice(0, 6).map((page, index) => {
                  const pageInfo = PAGE_INFO[page.path];
                  const Icon = pageInfo.icon;
                  return (
                    <div key={page.path} className={adminStyles.topPageItem}>
                      <div className={adminStyles.topPageRank}>#{index + 1}</div>
                      <div className={adminStyles.topPageName}>
                        <Icon size={16} className={adminStyles.topPageIcon} />
                        <span>{pageInfo.name}</span>
                      </div>
                      <span className={adminStyles.topPageViews}>{formatNumber(page.viewCount)}</span>
                      {page.isNew ? (
                        <span className={`${adminStyles.topPageChange} ${adminStyles.positive}`}>New</span>
                      ) : (
                        <span className={`${adminStyles.topPageChange} ${page.changePercent >= 0 ? adminStyles.positive : adminStyles.negative}`}>
                          {page.changePercent >= 0 ? '+' : ''}{page.changePercent.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Detailed Performance Metrics Table */}
        {detailedMetrics && (
          <div className={adminStyles.metricsSection}>
            <div className={adminStyles.metricsHeader}>
              <div className={adminStyles.metricsTitle}>
                <Table size={18} />
                <h3>Detailed Performance Metrics</h3>
              </div>
              <div className={adminStyles.metricsPeriodSelector}>
                {METRICS_PERIOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`${adminStyles.metricsPeriodBtn} ${metricsPeriod === opt.value ? adminStyles.activePeriodBtn : ''}`}
                    onClick={() => setMetricsPeriod(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className={adminStyles.metricsTable}>
              <div className={adminStyles.metricsTableHeader}>
                <span>Metric</span>
                <span>Current</span>
                <span>Previous</span>
                <span>Change</span>
                <span>Status</span>
              </div>
              {detailedMetrics.metrics.map((metric) => (
                <div key={metric.name} className={adminStyles.metricsTableRow}>
                  <span className={adminStyles.metricName}>{metric.name}</span>
                  <span className={adminStyles.metricCurrent}>{metric.current}</span>
                  <span className={adminStyles.metricPrevious}>{metric.previous}</span>
                  <span className={`${adminStyles.metricChange} ${metric.changePercent >= 0 ? adminStyles.positive : adminStyles.negative}`}>
                    {metric.changePercent >= 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%
                  </span>
                  <span className={`${adminStyles.metricStatus} ${getStatusClass(metric.status)}`}>{metric.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        </div>
    );
  }

  // User Dashboard Content
  return (
    <div className={styles.container}>
      {/* Compact Header with Level, XP, Daily Bonus */}
      {isLoading ? (
        <div className={styles.skeletonHeader}>
          <div className={`${styles.skeleton} ${styles.skeletonLevelBadge}`}></div>
          <div className={styles.skeletonXpSection}>
            <div className={`${styles.skeleton} ${styles.skeletonXpBar}`}></div>
          </div>
          <div className={`${styles.skeleton} ${styles.skeletonBonusBtn}`}></div>
        </div>
      ) : level ? (
        <CompactHeader
          level={level.level}
          experienceInCurrentLevel={level.experienceInCurrentLevel}
          experienceRequiredForLevel={level.experienceRequiredForLevel}
          experienceToNextLevel={level.experienceToNextLevel}
          progressPercent={level.progressPercent}
          dailyBonusClaimed={dailyBonusClaimed}
          dailyBonusAmount={dailyBonusAmount}
          onClaimDailyBonus={handleClaimDailyBonus}
        />
      ) : null}

      {/* Compact Welcome */}
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>
          Welcome back, <span className={styles.gradientName}>{getUserName()}</span>!
        </h1>
        <p className={styles.welcomeSubtext}>Here's your progress today.</p>
      </div>

      {/* Quick Actions */}
      <QuickActions
        lastUploadId={lastPracticedUpload?.id}
        lastUploadTitle={lastPracticedUpload?.title}
        hasUploads={uploads.length > 0}
      />

      {/* Continue Learning */}
      <ContinueLearning
        uploads={uploads}
        isLoading={isLoading}
      />

      {/* Weekly Streak Calendar */}
      <StreakCalendar
        activities={weeklyActivity?.activities || []}
        currentStreak={streak?.currentStreak || 0}
        weeklyTotal={weeklyActivity?.weeklyTotal || { xpEarned: 0, flashcardsStudied: 0, activeDays: 0 }}
        isLoading={isLoading}
      />

      {/* Daily Bonus Modal */}
      {showBonusModal && (
        <div className={styles.modalOverlay} onClick={() => setShowBonusModal(false)}>
          <div className={styles.bonusModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.bonusIcon}>
              <Gift size={48} />
            </div>
            <p className={styles.bonusMessage}>{bonusMessage}</p>
            <button
              className={styles.bonusCloseBtn}
              onClick={() => setShowBonusModal(false)}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
