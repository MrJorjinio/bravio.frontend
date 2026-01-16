'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { uploadService, userService } from '@/services';
import type { Upload, StreakResponse, LevelResponse, WeeklyActivityResponse } from '@/types';
import { Gift } from 'lucide-react';
import {
  CompactHeader,
  QuickActions,
  ContinueLearning,
  StreakCalendar
} from '@/components/dashboard';
import styles from './page.module.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [streak, setStreak] = useState<StreakResponse | null>(null);
  const [level, setLevel] = useState<LevelResponse | null>(null);
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [bonusMessage, setBonusMessage] = useState('');
  const [dailyBonusClaimed, setDailyBonusClaimed] = useState(false);
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Load only 3 completed uploads directly from API (optimized)
      // Practice stats are included inline in upload response (no separate API calls needed)
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

      // Check if daily bonus already claimed
      setDailyBonusClaimed(streakRes?.dailyBonusClaimed || false);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    fetchData();

    // Refresh data when returning to the page (visibility change)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };

    // Refresh data when practice is completed (custom event)
    const handlePracticeComplete = () => {
      fetchData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('practiceComplete', handlePracticeComplete);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('practiceComplete', handlePracticeComplete);
    };
  }, [fetchData]);

  const getUserName = () => {
    if (!user?.username) return 'there';
    return user.username;
  };

  // Get first upload for quick actions (all uploads are already completed)
  const lastPracticedUpload = uploads[0];

  // Daily bonus amount based on tier (simplified - would come from user data)
  const dailyBonusAmount = 10;

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
