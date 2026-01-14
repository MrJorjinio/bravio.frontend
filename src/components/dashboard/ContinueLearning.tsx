'use client';

import Link from 'next/link';
import { Layers, Target, Eye, ChevronRight, UploadCloud, Plus, Coins } from 'lucide-react';
import type { Upload } from '@/types';
import styles from './ContinueLearning.module.css';

interface ContinueLearningProps {
  uploads: Upload[];
  practiceStats: Map<string, { attempted: number; total: number }>;
  isLoading?: boolean;
}

export default function ContinueLearning({ uploads, practiceStats, isLoading }: ContinueLearningProps) {
  const getProgress = (uploadId: string) => {
    const stats = practiceStats.get(uploadId);
    if (!stats || !stats.total || stats.total === 0) return 0;
    const percent = Math.round((stats.attempted / stats.total) * 100);
    return isNaN(percent) ? 0 : percent;
  };

  const isComplete = (uploadId: string) => {
    const stats = practiceStats.get(uploadId);
    if (!stats) return false;
    return stats.attempted >= stats.total && stats.total > 0;
  };

  // Only show completed uploads
  const completedUploads = uploads.filter(upload =>
    upload.status.toLowerCase() === 'completed'
  );

  if (isLoading) {
    return (
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Continue Learning</h2>
        </div>
        <div className={styles.deckGrid}>
          {[1, 2, 3].map(i => (
            <div key={i} className={styles.skeletonCard}>
              <div className={`${styles.skeleton} ${styles.skeletonCardTitle}`}></div>
              <div className={`${styles.skeleton} ${styles.skeletonCardMeta}`}></div>
              <div className={`${styles.skeleton} ${styles.skeletonProgress}`}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Continue Learning</h2>
        {completedUploads.length > 6 && (
          <Link href="/dashboard/content" className={styles.viewAllBtn}>
            View All
            <ChevronRight size={16} />
          </Link>
        )}
      </div>

      {completedUploads.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <UploadCloud size={48} />
          </div>
          <h3 className={styles.emptyTitle}>No decks yet</h3>
          <p className={styles.emptyText}>
            Upload content to create your first study deck
          </p>
          <Link href="/dashboard/upload" className={styles.emptyBtn}>
            <Plus size={18} />
            Upload Content
          </Link>
        </div>
      ) : (
        <div className={styles.deckGrid}>
          {completedUploads.slice(0, 6).map(upload => (
            <DeckCard
              key={upload.id}
              upload={upload}
              progress={getProgress(upload.id)}
              isComplete={isComplete(upload.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface DeckCardProps {
  upload: Upload;
  progress: number;
  isComplete: boolean;
}

function DeckCard({ upload, progress, isComplete }: DeckCardProps) {
  return (
    <div className={styles.deckCard}>
      <div className={styles.cardGlow}></div>
      <div className={styles.cardInner}>
        <div className={styles.cardHeader}>
          <div className={styles.deckIcon}>
            <Layers size={18} />
          </div>
          {isComplete && <span className={styles.completeBadge}>Complete</span>}
        </div>

        <h3 className={styles.deckTitle}>{upload.title || 'Untitled'}</h3>

        <p className={styles.deckPreview}>
          {upload.summaryPreview || upload.contentPreview || 'No preview available'}
        </p>

        <div className={styles.cardMeta}>
          <span className={styles.metaItem}>
            <Layers size={14} />
            {upload.flashcardCount} cards
          </span>
          {upload.keyPointsCount && upload.keyPointsCount > 0 && (
            <span className={styles.metaItem}>
              <Target size={14} />
              {upload.keyPointsCount} points
            </span>
          )}
          <span className={styles.metaItem}>
            <Coins size={14} />
            {upload.broinsCost} broins
          </span>
        </div>

        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div
              className={`${styles.progressFill} ${isComplete ? styles.complete : ''}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className={styles.progressText}>{progress}% mastered</span>
        </div>

        <Link href={`/dashboard/content/${upload.id}`} className={styles.viewBtn}>
          <Eye size={16} />
          View Details
        </Link>
      </div>
    </div>
  );
}
