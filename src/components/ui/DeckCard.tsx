'use client';

import Link from 'next/link';
import { Layers, Target, Eye, Coins, Trash2, CheckCircle2 } from 'lucide-react';
import type { Upload } from '@/types';
import styles from './DeckCard.module.css';

export interface DeckCardProps {
  upload: Upload;
  progress?: number;
  isComplete?: boolean;
  showStatus?: boolean;
  showDelete?: boolean;
  showPractice?: boolean;
  onDelete?: (uploadId: string) => void;
}

export default function DeckCard({
  upload,
  progress = 0,
  isComplete = false,
  showStatus = false,
  showDelete = false,
  showPractice = false,
  onDelete
}: DeckCardProps) {
  const isCompleted = upload.status.toLowerCase() === 'completed';

  const getStatusClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'completed') return styles.completed;
    if (s === 'processing') return styles.processing;
    if (s === 'pending') return styles.pending;
    return styles.failed;
  };

  return (
    <div className={styles.deckCard}>
      <div className={styles.cardGlow}></div>
      <div className={styles.cardInner}>
        <div className={styles.cardHeader}>
          <div className={styles.deckIcon}>
            <Layers size={18} />
          </div>
          <div className={styles.headerRight}>
            {isComplete && <span className={styles.completeBadge}>Complete</span>}
            {showStatus && (
              <div className={`${styles.statusBadge} ${getStatusClass(upload.status)}`}>
                {isCompleted && <CheckCircle2 size={12} />}
                {upload.status}
              </div>
            )}
            {showDelete && onDelete && (
              <button
                className={styles.deleteBtn}
                onClick={() => onDelete(upload.id)}
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
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

        {isCompleted && (
          <div className={styles.progressSection}>
            <div className={styles.progressBar}>
              <div
                className={`${styles.progressFill} ${isComplete ? styles.complete : ''}`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className={styles.progressText}>{progress}% mastered</span>
          </div>
        )}

        <div className={styles.cardActions}>
          <Link href={`/dashboard/content/${upload.id}`} className={styles.viewBtn}>
            <Eye size={16} />
            View Details
          </Link>
          {showPractice && isCompleted && (
            <Link href={`/practice/${upload.id}`} className={styles.practiceBtn}>
              Practice
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
