'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { uploadService, walletService } from '@/services';
import type { Upload, PracticeStats } from '@/types';
import {
  Plus,
  Flame,
  TrendingUp,
  Target,
  Layers,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  Play,
  Trash2,
  Coins,
  Eye
} from 'lucide-react';
import styles from './page.module.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState<PracticeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [uploadsRes, balanceRes, statsRes] = await Promise.all([
        uploadService.getUploads(1, 3),
        walletService.getBalance(),
        uploadService.getGlobalPracticeStats().catch(() => null)
      ]);
      setUploads(uploadsRes.uploads || []);
      setBalance(balanceRes.balance);
      setStats(statsRes);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getUserName = () => {
    if (!user?.email) return 'there';
    return user.email.split('@')[0];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'completed') return styles.completed;
    if (s === 'processing' || s === 'in_progress') return styles.inProgress;
    return styles.notStarted;
  };

  const accuracy = stats?.accuracy || 0;
  const progressOffset = 300 - (300 * accuracy) / 100;

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <header className={styles.topHeader}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
        <div className={styles.headerActions}>
          <Link href="/dashboard/content" className={styles.btnOutline}>
            View All
          </Link>
          <Link href="/dashboard/upload" className={styles.btnPrimary}>
            <Plus size={16} />
            New Upload
          </Link>
        </div>
      </header>

      {/* Welcome Section */}
      <div className={styles.welcomeSection}>
        <div className={styles.welcomeText}>
          <h2 className={styles.welcomeTitle}>
            Welcome back, <span className={styles.gradientName}>{getUserName()}!</span>
          </h2>
          <p className={styles.welcomeSubtext}>
            You've mastered <span className={styles.percentUp}>+12%</span> more topics this week.
          </p>
        </div>
        <div className={styles.streakBadge}>
          <Flame size={16} className={styles.flameIcon} />
          <span>3 Day Streak</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {/* Overall Accuracy - Large Card */}
        <div className={styles.accuracyCard}>
          <div className={styles.accuracyGlow}></div>
          <div className={styles.accuracyContent}>
            <p className={styles.accuracyLabel}>Overall Accuracy</p>
            <h3 className={styles.accuracyValue}>{accuracy}%</h3>
            <p className={styles.accuracyMeta}>
              <TrendingUp size={16} />
              Top 5% of users
            </p>
          </div>
          <div className={styles.progressRing}>
            <svg className={styles.ringSvg} viewBox="0 0 112 112">
              <circle cx="56" cy="56" r="48" className={styles.ringBg} />
              <circle
                cx="56"
                cy="56"
                r="48"
                className={styles.ringProgress}
                strokeDasharray="300"
                strokeDashoffset={progressOffset}
              />
            </svg>
            <div className={styles.ringIcon}>
              <Target size={32} />
            </div>
          </div>
        </div>

        {/* Total Decks */}
        <div className={`${styles.statCard} ${styles.decksCard}`}>
          <div className={styles.statIconBox}>
            <Layers size={20} />
          </div>
          <div className={styles.statInfo}>
            <h4 className={styles.statValue}>{uploads.length}</h4>
            <p className={styles.statLabel}>Total Decks</p>
          </div>
        </div>

        {/* Cards Mastered */}
        <div className={`${styles.statCard} ${styles.masteredCard}`}>
          <div className={styles.statIconBox}>
            <CheckCircle2 size={20} />
          </div>
          <div className={styles.statInfo}>
            <h4 className={styles.statValue}>{stats?.correctAttempts || 0}</h4>
            <p className={styles.statLabel}>Cards Mastered</p>
          </div>
        </div>
      </div>

      {/* Continue Learning Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.titleBar}></span>
            Continue Learning
          </h3>
          <div className={styles.navButtons}>
            <button className={styles.navBtn}>
              <ChevronLeft size={20} />
            </button>
            <button className={styles.navBtn}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading...</p>
          </div>
        ) : uploads.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <UploadCloud size={48} />
            </div>
            <h3 className={styles.emptyTitle}>No uploads yet</h3>
            <p className={styles.emptyText}>
              Upload your first content to get summaries, key points, and flashcards!
            </p>
            <Link href="/dashboard/upload" className={styles.emptyBtn}>
              <Plus size={16} />
              Upload Content
            </Link>
          </div>
        ) : (
          <div className={styles.contentGrid}>
            {uploads.slice(0, 3).map((upload) => (
              <div key={upload.id} className={styles.contentCard}>
                <div className={styles.cardGlow}></div>
                <div className={styles.cardInner}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardDate}>{formatDate(upload.createdAt)}</span>
                    <div className={`${styles.statusBadge} ${getStatusClass(upload.status)}`}>
                      {upload.status.toLowerCase() === 'completed' && <CheckCircle2 size={12} />}
                      {upload.status}
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>{upload.title || 'Untitled'}</h3>
                    <p className={styles.cardPreview}>
                      {upload.summaryPreview || upload.contentPreview || 'Processing...'}
                    </p>
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.cardMeta}>
                      {upload.keyPointsCount !== undefined && upload.keyPointsCount > 0 && (
                        <span className={styles.metaItem} title="Key Points">
                          <Target size={14} className={styles.pinkIcon} />
                          {upload.keyPointsCount}
                        </span>
                      )}
                      <span className={styles.metaItem} title="Flashcards">
                        <Layers size={14} className={styles.purpleIcon} />
                        {upload.flashcardCount || 0}
                      </span>
                      <span className={styles.metaItem} title="Broins">
                        <Coins size={14} className={styles.yellowIcon} />
                        {upload.broinsCost || 0}
                      </span>
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => {
                          // Handle delete
                        }}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                      <Link href={`/dashboard/content/${upload.id}`} className={styles.viewBtn}>
                        <Eye size={14} />
                        View
                      </Link>
                      {upload.status.toLowerCase() === 'completed' && (
                        <Link href={`/practice/${upload.id}`} className={styles.practiceBtn}>
                          <Play size={12} />
                          Practice
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
