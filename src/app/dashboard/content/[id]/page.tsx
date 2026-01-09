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
  Trash2,
  ChevronDown,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Clock
} from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { uploadService } from '@/services';
import { useUploadProgress } from '@/hooks';
import type { UploadSummary, Flashcard, KeyPointGroupItem, ChunkSummaryItem } from '@/types';
import styles from './detail.module.css';

export default function ContentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const uploadId = params.id as string;

  const [upload, setUpload] = useState<UploadSummary | null>(null);
  const [topKeyPointGroups, setTopKeyPointGroups] = useState<KeyPointGroupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  
  // Backend pagination for chunks
  const [paginatedChunks, setPaginatedChunks] = useState<ChunkSummaryItem[]>([]);
  const [chunksPage, setChunksPage] = useState(1);
  const [chunksTotalPages, setChunksTotalPages] = useState(1);
  const [chunksTotalCount, setChunksTotalCount] = useState(0);
  const [chunksLoading, setChunksLoading] = useState(false);
  const chunksPerPage = 5;

  // Backend pagination for top key points
  const [keyPointsPage, setKeyPointsPage] = useState(1);
  const [keyPointsTotalPages, setKeyPointsTotalPages] = useState(1);
  const [keyPointsLoading, setKeyPointsLoading] = useState(false);

  // Helper to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Fetch paginated chunks from backend
  const fetchPaginatedChunks = useCallback(async (page: number) => {
    try {
      setChunksLoading(true);
      const response = await uploadService.getPaginatedChunks(uploadId, page, chunksPerPage);
      setPaginatedChunks(response.chunks);
      setChunksTotalPages(response.totalPages);
      setChunksTotalCount(response.totalCount);
      setChunksPage(page);
    } catch {
      // Chunks might not be available yet
    } finally {
      setChunksLoading(false);
    }
  }, [uploadId, chunksPerPage]);

  // Fetch paginated top key points from backend
  const fetchPaginatedKeyPoints = useCallback(async (page: number) => {
    try {
      setKeyPointsLoading(true);
      const response = await uploadService.getTopKeyPoints(uploadId, 2, page, 3);
      setTopKeyPointGroups(response.groups || []);
      setKeyPointsTotalPages(response.totalPages || 1);
      setKeyPointsPage(page);
    } catch {
      // Key points might not be available yet
    } finally {
      setKeyPointsLoading(false);
    }
  }, [uploadId]);

  // SignalR for real-time chunk updates
  const { isConnected, subscribeToUpload, unsubscribeFromUpload } = useUploadProgress({
    onChunkProgress: (progress) => {
      // Update completedChunks count (simplified for lightweight response)
      if (progress.status === 'COMPLETED') {
        setUpload(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            completedChunks: Math.max(prev.completedChunks, progress.chunkIndex + 1)
          };
        });
        // Refresh paginated chunks to include the newly completed one
        fetchPaginatedChunks(1);
      }
    },
    onUploadCompleted: () => {
      // Refresh the data when upload is complete
      fetchData(false);
    }
  });

  // Subscribe to upload progress when processing
  useEffect(() => {
    if (!upload || !isConnected) return;

    const statusLower = upload.status.toLowerCase();
    const isStillProcessing = statusLower === 'processing' || statusLower === 'pending';

    if (isStillProcessing && upload.isChunked) {
      subscribeToUpload(uploadId);
      return () => {
        unsubscribeFromUpload(uploadId);
      };
    }
  }, [upload?.status, upload?.isChunked, isConnected, uploadId, subscribeToUpload, unsubscribeFromUpload]);

  const fetchData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      // Use lightweight endpoint - doesn't load all chunks/flashcards
      const uploadData = await uploadService.getUploadSummary(uploadId);
      setUpload(uploadData);

      // Fetch paginated data if completed or has completed chunks
      const hasCompletedChunks = uploadData.isChunked && uploadData.completedChunks > 0;
      const isCompleted = uploadData.status.toLowerCase() === 'completed';

      if (isCompleted || hasCompletedChunks) {
        // Fetch paginated chunks and key points (first page) in parallel
        if (uploadData.isChunked) {
          await Promise.all([
            fetchPaginatedChunks(1),
            fetchPaginatedKeyPoints(1)
          ]);
        } else {
          // Non-chunked: key points are already in uploadData.keyPoints
        }
      }
    } catch (err) {
      console.error('Failed to fetch upload:', err);
      setNotFound(true);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [uploadId, fetchPaginatedChunks, fetchPaginatedKeyPoints]);

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
          <h3 className={styles.processingTitle}>
            {upload.isChunked && (upload.completedChunks || 0) >= (upload.totalChunks || 1)
              ? 'Finalizing Your Content'
              : 'Processing Your Content'}
          </h3>
          <p className={styles.processingText}>
            {upload.isChunked ? (
              (upload.completedChunks || 0) >= (upload.totalChunks || 1)
                ? 'Preparing top key points and organizing your flashcards...'
                : `Generating summaries, key points, and flashcards for each part. Part ${Math.min((upload.completedChunks || 0) + 1, upload.totalChunks || 1)} of ${upload.totalChunks} in progress...`
            ) : (
              'Our AI is generating a summary, key points, and flashcards for you...'
            )}
          </p>

          {/* Chunk Progress for chunked uploads */}
          {upload.isChunked && upload.totalChunks && upload.totalChunks > 0 && (
            <div className={styles.chunkProgressSection}>
              <div className={styles.chunkProgressBar}>
                <div
                  className={styles.chunkProgressFill}
                  style={{ width: `${Math.min(((upload.completedChunks || 0) / upload.totalChunks) * 100, 100)}%` }}
                />
              </div>
              <div className={styles.chunkProgressGrid}>
                {Array.from({ length: upload.totalChunks }, (_, i) => {
                  // Determine status based on completedChunks count (simplified for lightweight response)
                  const isCompleted = i < (upload.completedChunks || 0);
                  const isProcessing = i === (upload.completedChunks || 0);
                  const status = isCompleted ? 'COMPLETED' : isProcessing ? 'PROCESSING' : 'PENDING';
                  return (
                    <div
                      key={i}
                      className={`${styles.chunkProgressItem} ${styles[`chunk${status.toLowerCase()}`]}`}
                    >
                      {status === 'PROCESSING' && <Loader2 size={14} className={styles.spinningIcon} />}
                      {status === 'COMPLETED' && <CheckCircle2 size={14} />}
                      {status === 'PENDING' && <Clock size={14} />}
                      <span>Part {i + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Show completed chunks while still processing - Simple titles list */}
      {isProcessing && upload.isChunked && (upload.completedChunks || 0) > 0 && paginatedChunks.length > 0 && (
        <div className={styles.completedChunksSection}>
          <h3 className={styles.completedChunksSectionTitle}>
            <CheckCircle2 size={18} />
            Ready to Review ({upload.completedChunks || 0} of {upload.totalChunks} parts)
          </h3>
          <div className={styles.chunkTitlesList}>
            {paginatedChunks.map((chunk) => (
                <Link
                  key={chunk.id}
                  href={`/dashboard/content/${uploadId}/chunk/${chunk.chunkIndex}`}
                  className={styles.chunkTitleItem}
                >
                  <div className={styles.chunkTitleLeft}>
                    <span className={styles.chunkTitleIndex}>{chunk.chunkIndex + 1}</span>
                    <span className={styles.chunkTitleText}>
                      {chunk.title || `Part ${chunk.chunkIndex + 1}`}
                    </span>
                  </div>
                  <div className={styles.chunkTitleMeta}>
                    <span className={styles.chunkTitleCards}>
                      <Layers size={14} />
                      {chunk.flashcardCount}
                    </span>
                    <ChevronDown size={18} className={styles.chunkTitleArrow} />
                  </div>
                </Link>
              ))}
          </div>
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
            {/* Chunked Content - Show chunk titles list with backend pagination */}
            {upload.isChunked && chunksTotalCount > 0 ? (
              <div className={styles.chunkTitlesCard}>
                <h3 className={styles.chunkTitlesHeader}>
                  <Layers size={18} />
                  Content Parts
                  <span className={styles.chunkTitlesCount}>({chunksTotalCount})</span>
                </h3>
                <div className={styles.chunkTitlesList}>
                  {chunksLoading ? (
                    <div className={styles.chunksLoadingState}>
                      <Loader2 size={20} className={styles.spinningIcon} />
                      <span>Loading parts...</span>
                    </div>
                  ) : (
                    paginatedChunks.map((chunk) => (
                      <Link
                        key={chunk.id}
                        href={`/dashboard/content/${uploadId}/chunk/${chunk.chunkIndex}`}
                        className={styles.chunkTitleItem}
                      >
                        <div className={styles.chunkTitleLeft}>
                          <span className={styles.chunkTitleIndex}>{chunk.chunkIndex + 1}</span>
                          <span className={styles.chunkTitleText}>
                            {chunk.title || `Part ${chunk.chunkIndex + 1}`}
                          </span>
                        </div>
                        <div className={styles.chunkTitleMeta}>
                          <span className={styles.chunkTitleCards}>
                            <Layers size={14} />
                            {chunk.flashcardCount}
                          </span>
                          <ChevronDown size={18} className={styles.chunkTitleArrow} />
                        </div>
                      </Link>
                    ))
                  )}
                </div>
                {chunksTotalPages > 1 && (
                  <div className={styles.chunksPagination}>
                    <button
                      className={styles.paginationBtn}
                      onClick={() => fetchPaginatedChunks(chunksPage - 1)}
                      disabled={chunksPage === 1 || chunksLoading}
                    >
                      Previous
                    </button>
                    <span className={styles.paginationInfo}>
                      {chunksPage} / {chunksTotalPages}
                    </span>
                    <button
                      className={styles.paginationBtn}
                      onClick={() => fetchPaginatedChunks(chunksPage + 1)}
                      disabled={chunksPage === chunksTotalPages || chunksLoading}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Non-chunked content - Original AI Summary Card */
              upload.summary && (
                <div className={`${styles.summaryCard} ${summaryExpanded ? styles.expanded : ''}`}>
                  <h2 className={styles.summaryHeader}>
                    <span className={styles.summaryIcon}>
                      <Sparkles size={16} />
                    </span>
                    AI Summary
                  </h2>
                  <div className={styles.summaryContent}>
                    <p className={styles.summaryText}>{upload.summary}</p>
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
              )
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
                {upload.contentPreview || 'Content not available'}
              </div>
            </div>
          </div>

          {/* Right Column - Top Key Points */}
          <div className={styles.rightColumn}>
            <div className={styles.takeawaysCard}>
              <div className={styles.takeawaysHeader}>
                <h3 className={styles.takeawaysTitle}>
                  {upload.isChunked ? 'Top Key Points' : 'Key Takeaways'}
                </h3>
                {upload.isChunked && keyPointsTotalPages > 0 && (
                  <span className={styles.takeawaysSubtitle}>
                    Page {keyPointsPage} of {keyPointsTotalPages}
                  </span>
                )}
              </div>
              <div className={styles.takeawaysList}>
                {/* For chunked uploads, show top key points grouped by chunk (from backend) */}
                {upload.isChunked ? (
                  keyPointsLoading ? (
                    <div className={styles.chunksLoadingState}>
                      <Loader2 size={20} className={styles.spinningIcon} />
                      <span>Loading key points...</span>
                    </div>
                  ) : topKeyPointGroups.length > 0 ? (
                    topKeyPointGroups.map((group) => (
                      <div key={group.chunkIndex} className={styles.takeawayGroup}>
                        <div className={styles.takeawayGroupHeader}>
                          <span className={styles.takeawayGroupTitle}>
                            {group.chunkTitle}
                          </span>
                        </div>
                        {group.points.map((point, index) => (
                          <div key={`${group.chunkIndex}-${index}`} className={styles.takeawayItem}>
                            <span className={styles.takeawayNumber}>{index + 1}</span>
                            <p className={styles.takeawayText}>{point}</p>
                          </div>
                        ))}
                      </div>
                    ))
                  ) : (
                    <div className={styles.noTakeaways}>
                      <p>No key points available yet.</p>
                    </div>
                  )
                ) : (
                  /* Non-chunked: show upload.keyPoints */
                  upload.keyPoints && upload.keyPoints.length > 0 ? (
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
                  )
                )}
              </div>
              {/* Pagination for top key points */}
              {upload.isChunked && keyPointsTotalPages > 1 && (
                <div className={styles.chunksPagination}>
                  <button
                    className={styles.paginationBtn}
                    onClick={() => fetchPaginatedKeyPoints(keyPointsPage - 1)}
                    disabled={keyPointsPage === 1 || keyPointsLoading}
                  >
                    Previous
                  </button>
                  <span className={styles.paginationInfo}>
                    {keyPointsPage} / {keyPointsTotalPages}
                  </span>
                  <button
                    className={styles.paginationBtn}
                    onClick={() => fetchPaginatedKeyPoints(keyPointsPage + 1)}
                    disabled={keyPointsPage === keyPointsTotalPages || keyPointsLoading}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
