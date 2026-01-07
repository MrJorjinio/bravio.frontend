'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  Coins,
  Layers,
  FileText,
  Play,
  Trash2
} from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { uploadService } from '@/services';
import type { Upload, Flashcard } from '@/types';
import styles from './detail.module.css';

export default function ContentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const uploadId = params.id as string;

  const [upload, setUpload] = useState<Upload | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const uploadData = await uploadService.getUpload(uploadId);
      setUpload(uploadData);

      if (uploadData.status.toLowerCase() === 'completed') {
        try {
          const flashcardsData = await uploadService.getFlashcards(uploadId);
          setFlashcards(flashcardsData || []);
        } catch {
          // Flashcards might not be available yet
        }
      }
    } catch (err) {
      console.error('Failed to fetch upload:', err);
      setNotFound(true);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [uploadId]);

  useEffect(() => {
    if (uploadId) {
      fetchData();
    }
  }, [uploadId, fetchData]);

  // Poll for status updates when processing
  useEffect(() => {
    if (!upload) return;

    const statusLower = upload.status.toLowerCase();
    const isStillProcessing = statusLower === 'processing' || statusLower === 'pending';

    if (!isStillProcessing) return;

    const pollInterval = setInterval(() => {
      fetchData(false); // Don't show loading spinner during polling
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [upload, fetchData]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) return;

    try {
      await uploadService.deleteUpload(uploadId);
      router.push('/dashboard/content');
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

  const getWordCount = (text: string) => text?.split(/\s+/).length || 0;
  const getReadingTime = (text: string) => {
    const words = getWordCount(text);
    const mins = Math.ceil(words / 200);
    return `~${mins}m`;
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading content...</p>
        </div>
      </div>
    );
  }

  if (notFound || !upload) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <div className={styles.notFoundIcon}>
            <FileText size={64} />
          </div>
          <h2 className={styles.notFoundTitle}>Content Not Found</h2>
          <p className={styles.notFoundText}>
            The content you're looking for doesn't exist or has been deleted.
          </p>
          <Link href="/dashboard/content" className={styles.notFoundBtn}>
            <ArrowLeft size={18} />
            Back to Content
          </Link>
        </div>
      </div>
    );
  }

  const statusLower = upload.status.toLowerCase();
  const isProcessing = statusLower === 'processing' || statusLower === 'pending';
  const isFailed = statusLower === 'failed';
  const isCompleted = statusLower === 'completed';

  return (
    <div className={styles.container}>
      <Link href="/dashboard/content" className={styles.backLink}>
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerMeta}>
            <span className={`${styles.statusBadge} ${styles[statusLower]}`}>
              {upload.status}
            </span>
            <span className={styles.dateBadge}>Generated {formatDate(upload.createdAt)}</span>
          </div>

          <h1 className={styles.title}>
            {upload.title || 'Untitled Content'}
          </h1>

          <div className={styles.badges}>
            <div className={styles.badge}>
              <Coins size={16} />
              <span>-{upload.broinsCost} Broins</span>
            </div>
            <div className={`${styles.badge} ${styles.indigo}`}>
              <Layers size={16} />
              <span>{upload.flashcardCount} Flashcards</span>
            </div>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button onClick={handleDelete} className={styles.shareBtn}>
            <Trash2 size={20} />
          </button>
          {isCompleted && (
            <Link href={`/practice/${uploadId}`} className={styles.practiceBtn}>
              <Play size={18} />
              Practice Now
            </Link>
          )}
        </div>
      </header>

      {/* Processing State */}
      {isProcessing && (
        <div className={styles.processingCard}>
          <div className={styles.processingAnimation}>
            <DotLottieReact
              src="/animations/loading.lottie"
              autoplay
              loop
              className={styles.loadingLottie}
            />
          </div>
          <h3 className={styles.processingTitle}>Processing Your Content</h3>
          <p className={styles.processingText}>
            Our AI is analyzing your content and generating a summary, key points, and flashcards.
            This usually takes less than a minute.
          </p>
        </div>
      )}

      {/* Error State */}
      {isFailed && (
        <div className={styles.errorCard}>
          <div className={styles.errorTitle}>Processing Failed</div>
          <p className={styles.errorText}>
            {upload.summary || 'There was an error processing your content. Please try uploading again.'}
          </p>
        </div>
      )}

      {/* Main Content Grid */}
      {isCompleted && (
        <div className={styles.grid}>
          {/* Left Column */}
          <div className={styles.leftColumn}>
            {/* AI Summary Card */}
            {upload.summary && (
              <div className={styles.summaryCard}>
                <h2 className={styles.summaryHeader}>
                  <span className={styles.summaryIcon}>
                    <Sparkles size={16} />
                  </span>
                  AI Summary
                </h2>
                <p className={styles.summaryText}>{upload.summary}</p>
                <div className={styles.summaryStats}>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Total Words</span>
                    <span className={styles.statValue}>{getWordCount(upload.summary)}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Key Concepts</span>
                    <span className={styles.statValue}>{upload.keyPoints?.length || 0}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Reading Time</span>
                    <span className={styles.statValue}>{getReadingTime(upload.summary)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Source Content */}
            <div className={styles.sourceCard}>
              <div className={styles.sourceHeader}>
                <h3 className={styles.sourceTitle}>
                  <FileText size={16} />
                  Source Content
                </h3>
                <span className={styles.readOnlyBadge}>Read Only</span>
              </div>
              <div className={styles.sourceContent}>
                {upload.content || upload.contentPreview || 'Content not available'}
              </div>
            </div>
          </div>

          {/* Right Column - Key Takeaways */}
          <div className={styles.rightColumn}>
            <div className={styles.takeawaysCard}>
              <div className={styles.takeawaysHeader}>
                <h3 className={styles.takeawaysTitle}>Key Takeaways</h3>
              </div>
              <div className={styles.takeawaysList}>
                {upload.keyPoints && upload.keyPoints.length > 0 ? (
                  upload.keyPoints.map((point, index) => (
                    <div key={index} className={styles.takeawayItem}>
                      <span className={styles.takeawayNumber}>{index + 1}</span>
                      <p className={styles.takeawayText}>{point}</p>
                    </div>
                  ))
                ) : (
                  <div className={styles.noTakeaways}>
                    <p>No key points available yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
