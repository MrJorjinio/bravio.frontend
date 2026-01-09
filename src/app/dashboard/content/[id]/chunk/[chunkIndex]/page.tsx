'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  Layers,
  FileText,
  Play,
  ChevronDown
} from 'lucide-react';
import { uploadService } from '@/services';
import type { ChunkDetail } from '@/types';
import styles from '../../detail.module.css';

export default function ChunkDetailPage() {
  const params = useParams();
  const uploadId = params.id as string;
  const chunkIndex = parseInt(params.chunkIndex as string, 10);

  const [chunk, setChunk] = useState<ChunkDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Use lightweight endpoint - only fetches the single chunk, not all chunks/flashcards
      const chunkData = await uploadService.getChunkDetail(uploadId, chunkIndex);
      setChunk(chunkData);
    } catch (err) {
      console.error('Failed to fetch chunk:', err);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [uploadId, chunkIndex]);

  useEffect(() => {
    if (uploadId && !isNaN(chunkIndex)) {
      fetchData();
    }
  }, [uploadId, chunkIndex, fetchData]);

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
          <p>Loading chunk...</p>
        </div>
      </div>
    );
  }

  if (notFound || !chunk) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <div className={styles.notFoundIcon}>
            <FileText size={64} />
          </div>
          <h2 className={styles.notFoundTitle}>Chunk Not Found</h2>
          <p className={styles.notFoundText}>
            The chunk you're looking for doesn't exist or hasn't been processed yet.
          </p>
          <Link href={`/dashboard/content/${uploadId}`} className={styles.notFoundBtn}>
            <ArrowLeft size={18} />
            Back to Content
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = chunk.status === 'COMPLETED';
  const isFailed = chunk.status === 'FAILED';

  return (
    <div className={styles.container}>
      <Link href={`/dashboard/content/${uploadId}`} className={styles.backLink}>
        <ArrowLeft size={16} />
        Back to {chunk.uploadTitle}
      </Link>

      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerMeta}>
            <span className={`${styles.statusBadge} ${styles[chunk.status.toLowerCase()]}`}>
              Part {chunkIndex + 1} of {chunk.totalChunks}
            </span>
          </div>

          <h1 className={styles.title}>
            {chunk.title || `Part ${chunkIndex + 1}`}
          </h1>

          <div className={styles.badges}>
            <div className={`${styles.badge} ${styles.indigo}`}>
              <Layers size={16} />
              <span>{chunk.flashcardCount} Flashcards</span>
            </div>
            {chunk.keyPoints && (
              <div className={styles.badge}>
                <Sparkles size={16} />
                <span>{chunk.keyPoints.length} Key Points</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.headerActions}>
          {isCompleted && chunk.flashcardCount > 0 && (
            <Link href={`/practice/${uploadId}?chunk=${chunkIndex}`} className={styles.practiceBtn}>
              <Play size={18} />
              Practice Now
            </Link>
          )}
        </div>
      </header>

      {/* Error State */}
      {isFailed && (
        <div className={styles.errorCard}>
          <div className={styles.errorTitle}>Processing Failed</div>
          <p className={styles.errorText}>
            {chunk.errorMessage || 'There was an error processing this chunk.'}
          </p>
        </div>
      )}

      {/* Main Content Grid */}
      {isCompleted && (
        <div className={styles.grid}>
          {/* Left Column */}
          <div className={styles.leftColumn}>
            {/* AI Summary Card */}
            {chunk.summary && (
              <div className={`${styles.summaryCard} ${summaryExpanded ? styles.expanded : ''}`}>
                <h2 className={styles.summaryHeader}>
                  <span className={styles.summaryIcon}>
                    <Sparkles size={16} />
                  </span>
                  AI Summary
                </h2>
                <div className={styles.summaryContent}>
                  <p className={styles.summaryText}>{chunk.summary}</p>
                </div>
                <button
                  className={styles.expandBtn}
                  onClick={() => setSummaryExpanded(!summaryExpanded)}
                >
                  <span>{summaryExpanded ? 'Show Less' : 'Read More'}</span>
                  <ChevronDown size={16} className={summaryExpanded ? styles.rotated : ''} />
                </button>
                <div className={styles.summaryStats}>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Total Words</span>
                    <span className={styles.statValue}>{getWordCount(chunk.summary)}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Key Concepts</span>
                    <span className={styles.statValue}>{chunk.keyPoints?.length || 0}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Reading Time</span>
                    <span className={styles.statValue}>{getReadingTime(chunk.summary)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Practice Section */}
            {chunk.flashcardCount > 0 && (
              <div className={styles.highlightCard}>
                <h3 className={styles.highlightTitle}>
                  <Layers size={16} />
                  Flashcards
                </h3>
                <p className={styles.highlightSubtitle}>
                  {chunk.flashcardCount} flashcards generated for this section
                </p>
                <div className={styles.practiceAllSection}>
                  <Link
                    href={`/practice/${uploadId}?chunk=${chunkIndex}`}
                    className={styles.practiceAllBtn}
                  >
                    <Play size={18} />
                    Practice {chunk.flashcardCount} Cards
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Key Points */}
          <div className={styles.rightColumn}>
            <div className={styles.takeawaysCard}>
              <div className={styles.takeawaysHeader}>
                <h3 className={styles.takeawaysTitle}>Key Takeaways</h3>
              </div>
              <div className={styles.takeawaysList}>
                {chunk.keyPoints && chunk.keyPoints.length > 0 ? (
                  chunk.keyPoints.map((point, index) => (
                    <div key={index} className={styles.takeawayItem}>
                      <span className={styles.takeawayNumber}>{index + 1}</span>
                      <p className={styles.takeawayText}>{point}</p>
                    </div>
                  ))
                ) : (
                  <div className={styles.noTakeaways}>
                    <p>No key points available.</p>
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
