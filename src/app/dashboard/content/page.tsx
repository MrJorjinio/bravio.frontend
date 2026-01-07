'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { uploadService } from '@/services';
import type { Upload } from '@/types';
import {
  Plus,
  UploadCloud,
  CheckCircle2,
  Target,
  Layers,
  Coins,
  Play,
  Trash2,
  Eye
} from 'lucide-react';
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

  const getStatusClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'completed') return styles.completed;
    if (s === 'processing') return styles.processing;
    if (s === 'pending') return styles.pending;
    return styles.failed;
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
          <h1 className={styles.pageTitle}>My Content</h1>
          <p className={styles.pageSubtitle}>View and manage all your processed content</p>
        </div>
        <Link href="/dashboard/upload" className={styles.uploadBtn}>
          <Plus size={18} />
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
          <div className={styles.emptyIcon}>
            <UploadCloud size={64} />
          </div>
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
              <Plus size={18} />
              Upload Content
            </Link>
          )}
        </div>
      ) : (
        <div className={styles.contentGrid}>
          {uploads.map((upload) => (
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
                      {upload.flashcardCount}
                    </span>
                    <span className={styles.metaItem} title="Broins">
                      <Coins size={14} className={styles.yellowIcon} />
                      {upload.broinsCost}
                    </span>
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(upload.id)}
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
  );
}
