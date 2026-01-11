'use client';

import { useState, useEffect, useCallback } from 'react';
import { badgeService } from '@/services';
import type { UserBadgesResponse, Badge } from '@/types';
import {
  Award,
  Crown,
  Lock,
  Check,
  Sparkles,
  Star,
  FileText,
  BookOpen,
  GraduationCap,
  Flame,
  UserPlus,
  Users,
  Gem,
  Library,
  Trophy,
  Zap,
  Medal,
  LucideIcon
} from 'lucide-react';
import styles from './badges.module.css';

// Map icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  FileText,
  BookOpen,
  GraduationCap,
  Flame,
  Star,
  UserPlus,
  Users,
  Sparkles,
  Gem,
  Crown,
  Library,
  Trophy,
  Zap,
  Medal,
  Award
};

const getBadgeIcon = (iconName: string): LucideIcon => {
  return iconMap[iconName] || Award;
};

export default function BadgesPage() {
  const [badgesData, setBadgesData] = useState<UserBadgesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');

  const fetchBadges = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await badgeService.getUserBadges();
      setBadgesData(data);
    } catch (err) {
      console.error('Failed to fetch badges:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredBadges = badgesData?.badges.filter(badge => {
    if (filter === 'all') return true;
    if (filter === 'earned') return badge.isEarned;
    if (filter === 'locked') return !badge.isEarned;
    return true;
  }) || [];

  const basicBadges = filteredBadges.filter(b => !b.isProExclusive);
  const proBadges = filteredBadges.filter(b => b.isProExclusive);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading badges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Badges</h1>
          <p className={styles.subtitle}>Collect achievements and show off your progress</p>
        </div>
        <div className={styles.headerStats}>
          <div className={styles.statBadge}>
            <Award size={18} />
            <span>{badgesData?.earnedCount || 0} / {badgesData?.totalBadges || 0}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressSection}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${((badgesData?.earnedCount || 0) / (badgesData?.totalBadges || 1)) * 100}%` }}
          ></div>
        </div>
        <p className={styles.progressText}>
          {Math.round(((badgesData?.earnedCount || 0) / (badgesData?.totalBadges || 1)) * 100)}% Complete
        </p>
      </div>

      {/* Filter Tabs */}
      <div className={styles.filterTabs}>
        <button
          className={`${styles.filterTab} ${filter === 'all' ? styles.activeTab : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({badgesData?.totalBadges || 0})
        </button>
        <button
          className={`${styles.filterTab} ${filter === 'earned' ? styles.activeTab : ''}`}
          onClick={() => setFilter('earned')}
        >
          <Check size={14} />
          Earned ({badgesData?.earnedCount || 0})
        </button>
        <button
          className={`${styles.filterTab} ${filter === 'locked' ? styles.activeTab : ''}`}
          onClick={() => setFilter('locked')}
        >
          <Lock size={14} />
          Locked ({(badgesData?.totalBadges || 0) - (badgesData?.earnedCount || 0)})
        </button>
      </div>

      {/* Basic Badges Section */}
      {basicBadges.length > 0 && (
        <div className={styles.badgeSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIndicator}></span>
            <h2 className={styles.sectionTitle}>Basic Badges</h2>
            <span className={styles.sectionCount}>
              {basicBadges.filter(b => b.isEarned).length} / {badgesData?.badges.filter(b => !b.isProExclusive).length || 0}
            </span>
          </div>

          <div className={styles.badgesGrid}>
            {basicBadges.map(badge => (
              <BadgeCard
                key={badge.type}
                badge={badge}
                formatDate={formatDate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pro Badges Section */}
      {proBadges.length > 0 && (
        <div className={styles.badgeSection}>
          <div className={styles.sectionHeader}>
            <span className={`${styles.sectionIndicator} ${styles.proIndicator}`}></span>
            <Crown size={18} className={styles.proIcon} />
            <h2 className={styles.sectionTitle}>Pro Exclusive</h2>
            <span className={styles.sectionCount}>
              {proBadges.filter(b => b.isEarned).length} / {badgesData?.badges.filter(b => b.isProExclusive).length || 0}
            </span>
          </div>

          <div className={styles.badgesGrid}>
            {proBadges.map(badge => (
              <BadgeCard
                key={badge.type}
                badge={badge}
                formatDate={formatDate}
                isPro
              />
            ))}
          </div>
        </div>
      )}

      {filteredBadges.length === 0 && (
        <div className={styles.emptyState}>
          <Sparkles size={48} />
          <p>No badges found with this filter</p>
        </div>
      )}
    </div>
  );
}

interface BadgeCardProps {
  badge: Badge;
  formatDate: (date?: string) => string;
  isPro?: boolean;
}

function BadgeCard({ badge, formatDate, isPro }: BadgeCardProps) {
  const isEarned = badge.isEarned;
  const progress = badge.progressPercent;
  const circumference = 2 * Math.PI * 54; // radius = 54
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={`${styles.badgeCard} ${isEarned ? styles.earnedCard : styles.lockedCard} ${isPro ? styles.proCard : ''}`}
    >
      {isPro && !isEarned && (
        <div className={styles.proBadgeLabel}>
          <Crown size={10} />
          <span>PRO</span>
        </div>
      )}

      {/* Circular Badge with Progress Ring */}
      <div className={styles.badgeWrapper}>
        <svg className={styles.progressRing} viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="6"
          />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={isEarned ? "#fbbf24" : "#f59e0b"}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 60 60)"
            className={styles.progressCircle}
          />
        </svg>
        <div className={`${styles.badgeIcon} ${isEarned ? styles.earnedIcon : styles.lockedIcon}`}>
          {(() => {
            const IconComponent = getBadgeIcon(badge.icon);
            return <IconComponent size={32} className={styles.badgeIconSvg} />;
          })()}
          {!isEarned && (
            <div className={styles.lockOverlay}>
              <Lock size={16} />
            </div>
          )}
        </div>
      </div>

      <h3 className={styles.badgeName}>{badge.name}</h3>
      <p className={styles.badgeDesc}>{badge.description}</p>

      {/* Progress Text */}
      <div className={styles.progressInfo}>
        {isEarned ? (
          <div className={styles.earnedDate}>
            <Check size={12} />
            <span>Earned {formatDate(badge.earnedAt)}</span>
          </div>
        ) : (
          <div className={styles.progressStats}>
            <span className={styles.progressCount}>
              {badge.currentProgress} / {badge.requiredProgress}
            </span>
            <span className={styles.progressPercent}>{progress}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
