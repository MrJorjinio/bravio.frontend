'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { uploadService, walletService } from '@/services';
import type { Upload, PracticeStats } from '@/types';
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
        uploadService.getUploads(1, 6),
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

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.greeting}>Welcome back, {getUserName()}!</h1>
        <p className={styles.subtext}>Here&apos;s an overview of your learning progress.</p>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.uploads}`}>📚</div>
          </div>
          <div className={styles.statValue}>{uploads.length}</div>
          <div className={styles.statLabel}>Total Uploads</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.accuracy}`}>🎯</div>
          </div>
          <div className={styles.statValue}>{stats?.accuracy || 0}%</div>
          <div className={styles.statLabel}>Accuracy Rate</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.balance}`}>
              <Image src="/images/broin-coin.png" alt="Broins" width={24} height={24} />
            </div>
          </div>
          <div className={styles.statValue}>{balance}</div>
          <div className={styles.statLabel}>Broins Balance</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.streak}`}>✅</div>
          </div>
          <div className={styles.statValue}>{stats?.correctAttempts || 0}</div>
          <div className={styles.statLabel}>Correct Answers</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <Link href="/dashboard/upload" className={`${styles.actionBtn} ${styles.primary}`}>
          <span>📤</span>
          Upload New Content
        </Link>
        <Link href="/dashboard/content" className={`${styles.actionBtn} ${styles.secondary}`}>
          <span>📚</span>
          View All Content
        </Link>
        <Link href="/dashboard/wallet" className={`${styles.actionBtn} ${styles.secondary}`}>
          <span>💰</span>
          Buy Broins
        </Link>
      </div>

      {/* Recent Uploads */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Uploads</h2>
          {uploads.length > 0 && (
            <Link href="/dashboard/content" className={styles.viewAllLink}>
              View All <span>→</span>
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading...</p>
          </div>
        ) : uploads.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📚</div>
            <h3 className={styles.emptyTitle}>No uploads yet</h3>
            <p className={styles.emptyText}>
              Upload your first content to get summaries, key points, and flashcards!
            </p>
            <Link href="/dashboard/upload" className={styles.emptyBtn}>
              <span>📤</span>
              Upload Content
            </Link>
          </div>
        ) : (
          <div className={styles.uploadsGrid}>
            {uploads.slice(0, 6).map((upload) => (
              <div key={upload.id} className={styles.uploadCard}>
                <div className={styles.uploadHeader}>
                  <h3 className={styles.uploadTitle}>{upload.title || 'Untitled'}</h3>
                  <span className={`${styles.statusBadge} ${styles[upload.status.toLowerCase()]}`}>
                    {upload.status}
                  </span>
                </div>
                <p className={styles.uploadPreview}>
                  {upload.contentPreview || 'No preview available'}
                </p>
                <div className={styles.uploadMeta}>
                  <span className={styles.metaItem}>
                    🧠 {upload.flashcardCount} cards
                  </span>
                  <span className={styles.metaItem}>
                    💰 {upload.broinsCost} Broins
                  </span>
                  <span className={styles.metaItem}>
                    📅 {formatDate(upload.createdAt)}
                  </span>
                </div>
                <div className={styles.uploadActions}>
                  <Link href={`/dashboard/content/${upload.id}`} className={`${styles.cardBtn} ${styles.view}`}>
                    View Details
                  </Link>
                  {upload.status.toLowerCase() === 'completed' && (
                    <Link href={`/practice/${upload.id}`} className={`${styles.cardBtn} ${styles.practice}`}>
                      Practice
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
