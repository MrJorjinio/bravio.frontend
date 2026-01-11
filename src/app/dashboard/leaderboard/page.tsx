'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { leaderboardService } from '@/services';
import { getAssetUrl } from '@/lib/api';
import type { LeaderboardResponse, LeaderboardPeriod, LeaderboardEntry } from '@/types';
import {
  Trophy,
  Medal,
  TrendingUp,
  User,
  Star,
  ChevronUp,
  Clock
} from 'lucide-react';
import styles from './leaderboard.module.css';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [period, setPeriod] = useState<LeaderboardPeriod>('weekly');
  const hasLoadedOnce = useRef(false);

  const fetchLeaderboard = useCallback(async () => {
    try {
      // Only show full loading on initial load, not on period switch
      if (!hasLoadedOnce.current) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      const data = await leaderboardService.getLeaderboard(period);
      setLeaderboard(data);
      hasLoadedOnce.current = true;
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const formatPeriodDates = () => {
    if (!leaderboard?.periodStart || !leaderboard?.periodEnd) return '';
    const start = new Date(leaderboard.periodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // For daily, just show today's date
    if (period === 'daily') {
      return `Today, ${start}`;
    }

    const end = new Date(leaderboard.periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${start} - ${end}`;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy size={20} className={styles.goldIcon} />;
    if (rank === 2) return <Medal size={20} className={styles.silverIcon} />;
    if (rank === 3) return <Medal size={20} className={styles.bronzeIcon} />;
    return <span className={styles.rankNumber}>{rank}</span>;
  };

  const topThree = leaderboard?.topUsers.slice(0, 3) || [];
  const restOfList = leaderboard?.topUsers.slice(3) || [];

  // Helper to get XP value based on period
  const getXpValue = (entry: LeaderboardEntry) => {
    if (period === 'daily') return entry.dailyXp;
    if (period === 'weekly') return entry.weeklyXp;
    return entry.experience;
  };

  // Helper to get XP label based on period
  const getXpLabel = () => {
    if (period === 'daily') return 'Daily XP';
    if (period === 'weekly') return 'Weekly XP';
    return 'Total XP';
  };

  // Helper to get user rank XP value
  const getUserRankXp = () => {
    if (!leaderboard?.currentUser) return 0;
    if (period === 'daily') return leaderboard.currentUser.dailyXp;
    if (period === 'weekly') return leaderboard.currentUser.weeklyXp;
    return leaderboard.currentUser.experience;
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Leaderboard</h1>
          <p className={styles.subtitle}>Compete with other learners</p>
        </div>
      </div>

      {/* Period Toggle */}
      <div className={styles.periodToggle}>
        <button
          className={`${styles.periodBtn} ${period === 'daily' ? styles.activeBtn : ''}`}
          onClick={() => setPeriod('daily')}
        >
          <Clock size={16} />
          Daily
        </button>
        <button
          className={`${styles.periodBtn} ${period === 'weekly' ? styles.activeBtn : ''}`}
          onClick={() => setPeriod('weekly')}
        >
          <TrendingUp size={16} />
          Weekly
        </button>
        <button
          className={`${styles.periodBtn} ${period === 'alltime' ? styles.activeBtn : ''}`}
          onClick={() => setPeriod('alltime')}
        >
          <Star size={16} />
          All Time
        </button>
      </div>

      <p className={styles.periodDates}>
        {(period === 'daily' || period === 'weekly') && leaderboard?.periodStart ? formatPeriodDates() : '\u00A0'}
      </p>

      {/* Your Rank Card */}
      {leaderboard?.currentUser && (
        <div className={styles.yourRankCard}>
          <div className={styles.yourRankGlow}></div>
          <div className={styles.yourRankContent}>
            <div className={styles.yourRankLeft}>
              <div className={styles.yourRankIcon}>
                <User size={20} />
              </div>
              <div className={styles.yourRankInfo}>
                <span className={styles.yourRankLabel}>Your Rank</span>
                <span className={styles.yourRankValue}>#{leaderboard.currentUser.rank}</span>
              </div>
            </div>
            <div className={styles.yourRankStats}>
              <div className={styles.yourRankStat}>
                <span className={styles.yourRankStatValue}>
                  {getUserRankXp()}
                </span>
                <span className={styles.yourRankStatLabel}>
                  {getXpLabel()}
                </span>
              </div>
              <div className={styles.yourRankStat}>
                <span className={styles.yourRankStatValue}>Lvl {leaderboard.currentUser.level}</span>
                <span className={styles.yourRankStatLabel}>Level</span>
              </div>
              {leaderboard.currentUser.xpToNextRank > 0 && (
                <div className={styles.yourRankStat}>
                  <span className={styles.yourRankStatValue}>
                    <ChevronUp size={14} />
                    {leaderboard.currentUser.xpToNextRank}
                  </span>
                  <span className={styles.yourRankStatLabel}>XP to climb</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <div className={`${styles.podiumSection} ${isRefreshing ? styles.refreshing : ''}`}>
          <div className={styles.podium}>
            {/* Second Place */}
            {topThree[1] && (
              <div className={`${styles.podiumItem} ${styles.second}`}>
                <div className={styles.podiumAvatar}>
                  {topThree[1].avatarUrl ? (
                    <img src={getAssetUrl(topThree[1].avatarUrl)} alt="" className={styles.avatarImg} />
                  ) : (
                    <User size={24} />
                  )}
                </div>
                <Medal size={24} className={styles.silverIcon} />
                <div className={styles.podiumNameRow}>
                  {topThree[1].isPro && <span className={styles.proLabel}>PRO</span>}
                  <Link href={`/dashboard/profile/${topThree[1].username}`} className={`${styles.podiumName} ${topThree[1].isPro ? styles.proName : ''}`}>{topThree[1].username}</Link>
                </div>
                <span className={styles.podiumXp}>
                  {getXpValue(topThree[1])} XP
                </span>
                <div className={`${styles.podiumBase} ${styles.silverBase}`}></div>
              </div>
            )}

            {/* First Place */}
            {topThree[0] && (
              <div className={`${styles.podiumItem} ${styles.first}`}>
                <div className={styles.podiumAvatar}>
                  {topThree[0].avatarUrl ? (
                    <img src={getAssetUrl(topThree[0].avatarUrl)} alt="" className={styles.avatarImg} />
                  ) : (
                    <User size={28} />
                  )}
                </div>
                <Trophy size={28} className={styles.goldIcon} />
                <div className={styles.podiumNameRow}>
                  {topThree[0].isPro && <span className={styles.proLabel}>PRO</span>}
                  <Link href={`/dashboard/profile/${topThree[0].username}`} className={`${styles.podiumName} ${topThree[0].isPro ? styles.proName : ''}`}>{topThree[0].username}</Link>
                </div>
                <span className={styles.podiumXp}>
                  {getXpValue(topThree[0])} XP
                </span>
                <div className={`${styles.podiumBase} ${styles.goldBase}`}></div>
              </div>
            )}

            {/* Third Place */}
            {topThree[2] && (
              <div className={`${styles.podiumItem} ${styles.third}`}>
                <div className={styles.podiumAvatar}>
                  {topThree[2].avatarUrl ? (
                    <img src={getAssetUrl(topThree[2].avatarUrl)} alt="" className={styles.avatarImg} />
                  ) : (
                    <User size={22} />
                  )}
                </div>
                <Medal size={22} className={styles.bronzeIcon} />
                <div className={styles.podiumNameRow}>
                  {topThree[2].isPro && <span className={styles.proLabel}>PRO</span>}
                  <Link href={`/dashboard/profile/${topThree[2].username}`} className={`${styles.podiumName} ${topThree[2].isPro ? styles.proName : ''}`}>{topThree[2].username}</Link>
                </div>
                <span className={styles.podiumXp}>
                  {getXpValue(topThree[2])} XP
                </span>
                <div className={`${styles.podiumBase} ${styles.bronzeBase}`}></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rankings List */}
      {restOfList.length > 0 && (
        <div className={`${styles.rankingsSection} ${isRefreshing ? styles.refreshing : ''}`}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIndicator}></span>
            <h2 className={styles.sectionTitle}>Rankings</h2>
          </div>

          <div className={styles.rankingsList}>
            {restOfList.map(entry => (
              <RankingRow key={entry.userId} entry={entry} period={period} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface RankingRowProps {
  entry: LeaderboardEntry;
  period: LeaderboardPeriod;
}

function RankingRow({ entry, period }: RankingRowProps) {
  return (
    <div className={`${styles.rankingRow} ${entry.isCurrentUser ? styles.currentUserRow : ''}`}>
      <div className={styles.rankingRank}>
        <span className={styles.rankNumber}>{entry.rank}</span>
      </div>

      <div className={styles.rankingUser}>
        <div className={styles.rankingAvatar}>
          {entry.avatarUrl ? (
            <img src={getAssetUrl(entry.avatarUrl)} alt="" className={styles.avatarImg} />
          ) : (
            <User size={18} />
          )}
        </div>
        <div className={styles.rankingInfo}>
          <div className={styles.rankingNameRow}>
            {entry.isPro && <span className={styles.proLabelSmall}>PRO</span>}
            <Link href={`/dashboard/profile/${entry.username}`} className={`${styles.rankingName} ${entry.isPro ? styles.proName : ''}`}>
              {entry.username}
              {entry.isCurrentUser && <span className={styles.youLabel}>(You)</span>}
            </Link>
          </div>
          <span className={styles.rankingLevel}>Level {entry.level}</span>
        </div>
      </div>

      <div className={styles.rankingXp}>
        <span className={styles.xpValue}>
          {period === 'daily' ? entry.dailyXp : period === 'weekly' ? entry.weeklyXp : entry.experience}
        </span>
        <span className={styles.xpLabel}>XP</span>
      </div>
    </div>
  );
}
