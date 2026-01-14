'use client';

import { useState, useEffect } from 'react';
import { X, Flame, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { userService } from '@/services';
import type { ActivityHistoryResponse, WeeklyActivity } from '@/types';
import styles from './ActivityHistoryModal.module.css';

interface ActivityHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ActivityHistoryModal({ isOpen, onClose }: ActivityHistoryModalProps) {
  const [history, setHistory] = useState<ActivityHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getActivityHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch activity history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Get activity map for quick lookup
  const activityMap = new Map<string, WeeklyActivity>();
  history?.activities.forEach(activity => {
    activityMap.set(activity.date, activity);
  });

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    if (next <= new Date()) {
      setCurrentMonth(next);
    }
  };

  const canGoNext = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    return next <= new Date();
  };

  const canGoPrev = () => {
    if (!history) return false;
    const accountDate = new Date(history.accountCreatedAt);
    const prevDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
    return prevDate >= new Date(accountDate.getFullYear(), accountDate.getMonth());
  };

  // Build calendar grid
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const calendarDays: (WeeklyActivity | null)[] = [];

  // Add empty cells for days before the first day of month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const activity = activityMap.get(dateStr);
    calendarDays.push(activity || { date: dateStr, dayOfWeek: '', isActive: false, isProtected: false, xpEarned: 0, flashcardsStudied: 0 });
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <button
            className={styles.navBtn}
            onClick={prevMonth}
            disabled={!canGoPrev()}
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className={styles.monthTitle}>{formatMonthYear(currentMonth)}</h2>
          <button
            className={styles.navBtn}
            onClick={nextMonth}
            disabled={!canGoNext()}
          >
            <ChevronRight size={20} />
          </button>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
          </div>
        ) : (
          <div className={styles.calendarWrapper}>
            <div className={styles.weekHeader}>
              {weekDays.map(day => (
                <div key={day} className={styles.weekDay}>{day}</div>
              ))}
            </div>
            <div className={styles.calendarGrid}>
              {calendarDays.map((day, idx) => (
                <div
                  key={idx}
                  className={`${styles.dayCell} ${day?.isActive ? styles.active : ''} ${day?.isProtected ? styles.protected : ''} ${!day ? styles.empty : ''}`}
                  title={day ? (day.isActive ? `${day.flashcardsStudied} cards studied` : day.isProtected ? 'Streak protected' : '') : ''}
                >
                  {day && (
                    <>
                      <span className={styles.dayNum}>{new Date(day.date).getDate()}</span>
                      {day.isActive && <Flame size={14} className={styles.dayIcon} />}
                      {day.isProtected && !day.isActive && <Shield size={14} className={styles.dayIcon} />}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
