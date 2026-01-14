'use client';

import { useState } from 'react';
import { Flame, Zap, Shield, ChevronRight } from 'lucide-react';
import type { WeeklyActivity } from '@/types';
import ActivityHistoryModal from './ActivityHistoryModal';
import styles from './StreakCalendar.module.css';

interface StreakCalendarProps {
  activities: WeeklyActivity[];
  currentStreak: number;
  weeklyTotal: {
    xpEarned: number;
    flashcardsStudied: number;
    activeDays: number;
  };
  isLoading?: boolean;
}

export default function StreakCalendar({
  activities,
  currentStreak,
  weeklyTotal,
  isLoading,
}: StreakCalendarProps) {
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  if (isLoading) {
    return (
      <div className={styles.streakWidget}>
        <div className={styles.widgetHeader}>
          <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
          <div className={`${styles.skeleton} ${styles.skeletonBadge}`}></div>
        </div>
        <div className={styles.calendarGrid}>
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className={styles.skeletonDay}>
              <div className={`${styles.skeleton} ${styles.skeletonDayLabel}`}></div>
              <div className={`${styles.skeleton} ${styles.skeletonDayCircle}`}></div>
            </div>
          ))}
        </div>
        <div className={`${styles.skeleton} ${styles.skeletonStats}`}></div>
      </div>
    );
  }

  return (
    <div className={styles.streakWidget}>
      <div className={styles.widgetHeader}>
        <h3 className={styles.widgetTitle}>
          <Flame size={18} className={styles.fireIcon} />
          Weekly Streak
        </h3>
        <div className={styles.streakBadge}>
          <Flame size={14} />
          {currentStreak} day{currentStreak !== 1 ? 's' : ''}
        </div>
      </div>

      <div className={styles.calendarGrid}>
        {activities.map((day, index) => (
          <div key={index} className={styles.dayColumn}>
            <span className={styles.dayLabel}>{day.dayOfWeek}</span>
            <div
              className={`${styles.dayCircle} ${day.isActive ? styles.active : ''} ${day.isProtected ? styles.protected : ''}`}
              title={
                day.isActive
                  ? `${day.xpEarned} XP, ${day.flashcardsStudied} cards`
                  : day.isProtected
                    ? 'Streak protected!'
                    : 'No activity'
              }
            >
              {day.isActive ? (
                <Flame size={16} />
              ) : day.isProtected ? (
                <Shield size={16} />
              ) : (
                <span className={styles.dayNumber}>
                  {new Date(day.date).getDate()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.weeklyStats}>
        <div className={styles.statItem}>
          <Zap size={14} className={styles.xpIcon} />
          <span className={styles.statValue}>{weeklyTotal.xpEarned}</span>
          <span className={styles.statLabel}>XP earned</span>
        </div>
        <div className={styles.statDivider}></div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{weeklyTotal.flashcardsStudied}</span>
          <span className={styles.statLabel}>cards studied</span>
        </div>
        <div className={styles.statDivider}></div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{weeklyTotal.activeDays}/7</span>
          <span className={styles.statLabel}>active days</span>
        </div>
      </div>

      <button
        className={styles.viewAllBtn}
        onClick={() => setShowHistoryModal(true)}
      >
        View All History
        <ChevronRight size={16} />
      </button>

      <ActivityHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />
    </div>
  );
}
