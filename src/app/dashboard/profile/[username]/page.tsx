'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { userService } from '@/services';
import { getAssetUrl } from '@/lib/api';
import type { PublicProfileResponse } from '@/types';
import {
  User,
  Crown,
  Award,
  Flame,
  Calendar,
  FileText,
  ArrowLeft,
  TrendingUp,
  BookOpen,
  GraduationCap,
  Star,
  UserPlus,
  Users,
  Sparkles,
  Gem,
  Library,
  Trophy,
  Zap,
  Medal,
  LucideIcon
} from 'lucide-react';

import styles from './profile.module.css';

// Map icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  FileText, BookOpen, GraduationCap, Flame, Star, UserPlus, Users,
  Sparkles, Gem, Crown, Library, Trophy, Zap, Medal, Award
};

const BadgeIcon = ({ iconName, size = 14 }: { iconName: string; size?: number }) => {
  const IconComponent = iconMap[iconName] || Award;
  return <IconComponent size={size} />;
};

// Get color class based on badge icon
const getBadgeColorClass = (iconName: string): string => {
  const colorMap: Record<string, string> = {
    Crown: 'badgeGold',
    Trophy: 'badgeGold',
    Medal: 'badgeSilver',
    Flame: 'badgeOrange',
    Star: 'badgeYellow',
    Zap: 'badgeYellow',
    Sparkles: 'badgePink',
    Gem: 'badgePurple',
    FileText: 'badgeBlue',
    BookOpen: 'badgeBlue',
    GraduationCap: 'badgeIndigo',
    Library: 'badgeIndigo',
    UserPlus: 'badgeGreen',
    Users: 'badgeTeal',
  };
  return colorMap[iconName] || 'badgePurple';
};

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const [profile, setProfile] = useState<PublicProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!username) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await userService.getPublicProfile(username);
      setProfile(data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('User not found');
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
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
        <div className={styles.errorContainer}>
          <User size={48} className={styles.errorIcon} />
          <h2>User Not Found</h2>
          <p>The user &quot;{username}&quot; does not exist.</p>
          <button className={styles.backBtn} onClick={() => router.back()}>
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <button className={styles.backLink} onClick={() => router.back()}>
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            {profile.avatarUrl ? (
              <img src={getAssetUrl(profile.avatarUrl)} alt={profile.username} className={styles.avatar} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                <User size={48} />
              </div>
            )}
            {profile.isPro && (
              <div className={styles.proBadge}>
                <Crown size={14} />
              </div>
            )}
          </div>

          <div className={styles.userInfo}>
            <div className={styles.usernameRow}>
              <h1 className={styles.username}>{profile.username}</h1>
            </div>
            {profile.isPro && (
              <span className={styles.proLabel}>Pro Member</span>
            )}
            <p className={styles.joinDate}>
              <Calendar size={14} />
              Joined {formatDate(profile.joinedAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.levelIcon}`}>
            <TrendingUp size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{profile.level}</span>
            <span className={styles.statLabel}>Level</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.xpIcon}`}>
            <Zap size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{profile.experience.toLocaleString()}</span>
            <span className={styles.statLabel}>Total XP</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.streakIcon}`}>
            <Flame size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{profile.currentStreak}</span>
            <span className={styles.statLabel}>Current Streak</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.streakIcon}`}>
            <Trophy size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{profile.longestStreak}</span>
            <span className={styles.statLabel}>Longest Streak</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.docsIcon}`}>
            <FileText size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{profile.totalDocuments}</span>
            <span className={styles.statLabel}>Documents</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.badgesIcon}`}>
            <Award size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{profile.badgesEarned}</span>
            <span className={styles.statLabel}>Badges</span>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      {profile.badges.length > 0 && (
        <div className={styles.badgesSection}>
          <h2 className={styles.sectionTitle}>
            <Award size={20} />
            Earned Badges
          </h2>
          <div className={styles.badgesGrid}>
            {profile.badges.map((badge) => (
              <div key={badge.type} className={`${styles.badgeCard} ${styles[getBadgeColorClass(badge.icon)]}`}>
                <div className={styles.badgeIconWrapper}>
                  <BadgeIcon iconName={badge.icon} size={24} />
                </div>
                <span className={styles.badgeName}>{badge.name}</span>
                <span className={styles.badgeDate}>
                  {new Date(badge.earnedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
