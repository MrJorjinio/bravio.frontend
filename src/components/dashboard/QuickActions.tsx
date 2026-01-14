'use client';

import Link from 'next/link';
import { Play, Sparkles } from 'lucide-react';
import styles from './QuickActions.module.css';

interface QuickActionsProps {
  lastUploadId?: string;
  lastUploadTitle?: string;
  hasUploads: boolean;
}

export default function QuickActions({
  lastUploadId,
  lastUploadTitle,
  hasUploads,
}: QuickActionsProps) {
  return (
    <div className={styles.quickActionsSection}>
      <h2 className={styles.sectionTitle}>Quick Actions</h2>
      <div className={styles.actionsGrid}>
        {/* Resume Last Deck */}
        {lastUploadId ? (
          <Link href={`/practice/${lastUploadId}`} className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <Play size={22} />
            </div>
            <div className={styles.actionContent}>
              <span className={styles.actionTitle}>Resume Last</span>
              <span className={styles.actionSubtitle}>
                {lastUploadTitle || 'Continue where you left off'}
              </span>
            </div>
          </Link>
        ) : (
          <div className={`${styles.actionCard} ${styles.disabled}`}>
            <div className={styles.actionIcon}>
              <Play size={22} />
            </div>
            <div className={styles.actionContent}>
              <span className={styles.actionTitle}>Resume Last</span>
              <span className={styles.actionSubtitle}>No recent practice</span>
            </div>
          </div>
        )}

        {/* Start Practice */}
        {hasUploads ? (
          <Link href="/dashboard/content" className={styles.actionCard}>
            <div className={`${styles.actionIcon} ${styles.primaryIcon}`}>
              <Sparkles size={22} />
            </div>
            <div className={styles.actionContent}>
              <span className={styles.actionTitle}>Start Practice</span>
              <span className={styles.actionSubtitle}>Choose a deck to study</span>
            </div>
          </Link>
        ) : (
          <Link href="/dashboard/upload" className={styles.actionCard}>
            <div className={`${styles.actionIcon} ${styles.primaryIcon}`}>
              <Sparkles size={22} />
            </div>
            <div className={styles.actionContent}>
              <span className={styles.actionTitle}>Get Started</span>
              <span className={styles.actionSubtitle}>Upload your first content</span>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
