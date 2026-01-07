'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { uploadService } from '@/services';
import type { Upload } from '@/types';
import styles from './content.module.css';

type FilterStatus = 'all' | 'completed' | 'processing' | 'pending' | 'failed';

export default function ContentPage() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');

  const fetchUploads = useCallback(async () => {
    try {
      setIsLoading(true);
      const status = filter === 'all' ? undefined : filter;
      const res = await uploadService.getUploads(1, 50, status);
      setUploads(res.uploads || []);
    } catch (err) {
      console.error('Failed to fetch uploads:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchUploads();
  }, [fetchUploads]);

  const handleDelete = async (uploadId: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      await uploadService.deleteUpload(uploadId);
      setUploads(uploads.filter(u => u.id !== uploadId));
    } catch (err) {
      console.error('Failed to delete upload:', err);
      alert('Failed to delete content. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filters: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'completed', label: 'Completed' },
    { value: 'processing', label: 'Processing' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>My Content</h1>
          <p>View and manage all your processed content</p>
        </div>
        <Link href="/dashboard/upload" className={styles.uploadBtn}>
          <span>📤</span>
          Upload New
        </Link>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        {filters.map(f => (
          <button
            key={f.value}
            className={`${styles.filterBtn} ${filter === f.value ? styles.active : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading content...</p>
        </div>
      ) : uploads.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📚</div>
          <h2 className={styles.emptyTitle}>
            {filter === 'all' ? 'No content yet' : `No ${filter} content`}
          </h2>
          <p className={styles.emptyText}>
            {filter === 'all'
              ? 'Upload your first content to get summaries, key points, and flashcards!'
              : `You don't have any content with "${filter}" status.`
            }
          </p>
          {filter === 'all' && (
            <Link href="/dashboard/upload" className={styles.emptyBtn}>
              <span>📤</span>
              Upload Content
            </Link>
          )}
        </div>
      ) : (
        <div className={styles.contentGrid}>
          {uploads.map((upload) => (
            <div key={upload.id} className={styles.contentCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{upload.title || 'Untitled'}</h3>
                <span className={`${styles.statusBadge} ${styles[upload.status.toLowerCase()]}`}>
                  {upload.status}
                </span>
              </div>

              {/* Show summary if available, otherwise content preview */}
              {upload.summaryPreview ? (
                <div className={styles.summaryPreview}>
                  <span className={styles.summaryLabel}>📋 Summary</span>
                  <p className={styles.cardSummary}>{upload.summaryPreview}</p>
                </div>
              ) : (
                <p className={styles.cardPreview}>
                  {upload.contentPreview || 'Processing...'}
                </p>
              )}

              <div className={styles.cardMeta}>
                {upload.keyPointsCount !== undefined && upload.keyPointsCount > 0 && (
                  <span className={styles.metaItem}>
                    🎯 {upload.keyPointsCount} key points
                  </span>
                )}
                <span className={styles.metaItem}>
                  🧠 {upload.flashcardCount} flashcards
                </span>
                <span className={styles.metaItem}>
                  💰 {upload.broinsCost} Broins
                </span>
                <span className={styles.metaItem}>
                  📅 {formatDate(upload.createdAt)}
                </span>
              </div>

              <div className={styles.cardActions}>
                <Link
                  href={`/dashboard/content/${upload.id}`}
                  className={`${styles.cardBtn} ${styles.view}`}
                >
                  View Details
                </Link>
                {upload.status.toLowerCase() === 'completed' && (
                  <Link
                    href={`/practice/${upload.id}`}
                    className={`${styles.cardBtn} ${styles.practice}`}
                  >
                    Practice
                  </Link>
                )}
                <button
                  className={`${styles.cardBtn} ${styles.delete}`}
                  onClick={() => handleDelete(upload.id)}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
