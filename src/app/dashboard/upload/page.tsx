'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { uploadService } from '@/services';
import { useUploadProgress, ChunkProgress, UploadCompleted } from '@/hooks';
import {
  ArrowLeft,
  Type,
  Sparkles,
  FileText,
  ListChecks,
  Layers,
  Cpu,
  Check,
  X,
  Loader2,
  Clock
} from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import styles from './upload.module.css';

type UploadState = 'idle' | 'spending' | 'processing' | 'chunking' | 'transitioning' | 'success';

interface ChunkStatus {
  index: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  flashcardCount?: number;
  errorMessage?: string;
}

export default function UploadPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [error, setError] = useState('');
  const [uploadedId, setUploadedId] = useState<string | null>(null);

  // Chunk progress state
  const [totalChunks, setTotalChunks] = useState(0);
  const [completedChunks, setCompletedChunks] = useState(0);
  const [totalFlashcards, setTotalFlashcards] = useState(0);
  const [chunkStatuses, setChunkStatuses] = useState<ChunkStatus[]>([]);

  const charCount = content.length;
  const isValidLength = charCount >= 200; // No max limit anymore
  const chunkSize = 4000;
  const estimatedChunks = Math.ceil(charCount / (chunkSize - 350)); // Account for overlap

  // Calculate cost: 1 broin per 500 chars
  const estimatedCost = Math.ceil(charCount / 500);

  // SignalR handlers
  const handleChunkProgress = useCallback((data: ChunkProgress) => {
    if (data.uploadId !== uploadedId) return;

    setCompletedChunks(data.completedChunks);
    setTotalFlashcards(prev => prev + data.flashcardCount);

    setChunkStatuses(prev => {
      const updated = [...prev];
      updated[data.chunkIndex] = {
        index: data.chunkIndex,
        status: data.status === 'COMPLETED' ? 'completed' : 'failed',
        flashcardCount: data.flashcardCount,
        errorMessage: data.errorMessage
      };
      // Mark next chunk as processing if not the last one
      if (data.chunkIndex + 1 < totalChunks && data.status === 'COMPLETED') {
        updated[data.chunkIndex + 1] = {
          ...updated[data.chunkIndex + 1],
          status: 'processing'
        };
      }
      return updated;
    });
  }, [uploadedId, totalChunks]);

  const handleUploadCompleted = useCallback((data: UploadCompleted) => {
    if (data.uploadId !== uploadedId) return;

    // For chunked uploads, go directly to success after a delay (no transitioning state to avoid money animation)
    setTimeout(() => {
      setUploadState('success');
    }, 2000);
  }, [uploadedId]);

  // Connect to SignalR
  useUploadProgress({
    onChunkProgress: handleChunkProgress,
    onUploadCompleted: handleUploadCompleted,
    uploadId: uploadedId || undefined
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidLength) {
      setError('Content must be at least 200 characters');
      return;
    }

    // Determine if this will be chunked (> 4000 chars)
    const willBeChunked = charCount > chunkSize;

    if (willBeChunked) {
      // Initialize chunk statuses
      const chunks = Math.ceil(charCount / (chunkSize - 350));
      setTotalChunks(chunks);
      setCompletedChunks(0);
      setTotalFlashcards(0);
      setChunkStatuses(
        Array.from({ length: chunks }, (_, i) => ({
          index: i,
          status: i === 0 ? 'processing' : 'pending'
        }))
      );
      // Show spending animation first, then transition to chunking
      setUploadState('spending');
    } else {
      setUploadState('processing');
    }

    const startTime = Date.now();

    try {
      const result = await uploadService.createUpload({
        content,
        title: title || undefined
      });
      setUploadedId(result.id);

      // For non-chunked uploads, handle completion directly
      if (!willBeChunked) {
        const elapsed = Date.now() - startTime;
        const minDisplayTime = 2000;
        const remainingTime = Math.max(0, minDisplayTime - elapsed);

        setTimeout(() => {
          setUploadState('transitioning');
          setTimeout(() => {
            setUploadState('success');
          }, 400);
        }, remainingTime);
      } else {
        // For chunked uploads, show spending animation for longer, then show chunking progress
        const elapsed = Date.now() - startTime;
        const minSpendingTime = 3000; // 3 seconds for spending animation
        const remainingTime = Math.max(0, minSpendingTime - elapsed);

        setTimeout(() => {
          setUploadState('chunking');
        }, remainingTime);
      }
      // SignalR will handle the progress and completion for chunked uploads
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process content. Please try again.';
      setError(errorMessage);
      setUploadState('idle');
    }
  };

  // Chunking progress state
  if (uploadState === 'chunking') {
    const progressPercent = totalChunks > 0 ? Math.min((completedChunks / totalChunks) * 100, 100) : 0;
    const currentChunk = chunkStatuses.find(c => c.status === 'processing');
    const allChunksComplete = completedChunks >= totalChunks && totalChunks > 0;

    // Dynamic status messages based on progress
    const getStatusTitle = () => {
      if (allChunksComplete) return 'Finalizing Your Content';
      if (completedChunks === 0) return 'Analyzing Your Content';
      return 'Processing Your Content';
    };

    const getStatusSubtext = () => {
      if (allChunksComplete) return 'Preparing top key points and organizing flashcards...';
      if (completedChunks === 0) return 'Breaking down your text and starting AI analysis...';
      return `Generating summaries, key points, and flashcards for each part...`;
    };

    return (
      <div className={styles.container}>
        <div className={styles.processingOverlay}>
          <div className={styles.chunkProgressCard}>
            <div className={styles.chunkProgressAnimation}>
              <div className={styles.processingSpinner}></div>
            </div>

            <h2 className={styles.chunkProgressTitle}>{getStatusTitle()}</h2>
            <p className={styles.chunkProgressSubtext}>
              {getStatusSubtext()}
            </p>

            <div className={styles.chunkProgressBar}>
              <div
                className={styles.chunkProgressFill}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <div className={styles.chunkProgressStats}>
              <div className={styles.chunkProgressStat}>
                <div className={styles.chunkProgressStatValue}>{Math.min(completedChunks, totalChunks)}/{totalChunks}</div>
                <div className={styles.chunkProgressStatLabel}>Parts</div>
              </div>
              <div className={styles.chunkProgressStat}>
                <div className={styles.chunkProgressStatValue}>{totalFlashcards}</div>
                <div className={styles.chunkProgressStatLabel}>Flashcards</div>
              </div>
            </div>

            <div className={styles.chunkList}>
              {chunkStatuses.map((chunk) => {
                const isCompleted = chunk.status === 'completed';
                const baseClassName = `${styles.chunkItem} ${
                  chunk.status === 'processing' ? styles.chunkItemProcessing :
                  chunk.status === 'completed' ? styles.chunkItemCompleted :
                  chunk.status === 'failed' ? styles.chunkItemFailed : ''
                }`;

                const chunkContent = (
                  <>
                    <div className={`${styles.chunkItemIcon} ${styles[chunk.status]}`}>
                      {chunk.status === 'processing' && <Loader2 size={14} />}
                      {chunk.status === 'completed' && <Check size={14} />}
                      {chunk.status === 'failed' && <X size={14} />}
                      {chunk.status === 'pending' && <Clock size={14} />}
                    </div>
                    <div className={styles.chunkItemInfo}>
                      <div className={styles.chunkItemTitle}>Part {chunk.index + 1}</div>
                      <div className={styles.chunkItemMeta}>
                        {chunk.status === 'processing' && 'Generating summary, key points & flashcards...'}
                        {chunk.status === 'completed' && `${chunk.flashcardCount} flashcards ready - Click to view`}
                        {chunk.status === 'failed' && (chunk.errorMessage || 'Failed to process')}
                        {chunk.status === 'pending' && 'Queued for processing...'}
                      </div>
                    </div>
                    {isCompleted && (
                      <div className={styles.chunkItemArrow}>→</div>
                    )}
                  </>
                );

                return isCompleted ? (
                  <Link
                    key={chunk.index}
                    href={`/dashboard/content/${uploadedId}`}
                    className={`${baseClassName} ${styles.chunkItemClickable}`}
                  >
                    {chunkContent}
                  </Link>
                ) : (
                  <div key={chunk.index} className={baseClassName}>
                    {chunkContent}
                  </div>
                );
              })}
            </div>

            {currentChunk ? (
              <p className={styles.currentChunkText}>
                AI is analyzing part {currentChunk.index + 1} of {totalChunks}...
              </p>
            ) : allChunksComplete ? (
              <p className={styles.currentChunkText}>
                All parts complete! Preparing your learning materials...
              </p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // Spending state for chunked uploads - show money animation before processing starts
  if (uploadState === 'spending') {
    return (
      <div className={styles.container}>
        <div className={styles.processingOverlay}>
          <div className={styles.processingCard}>
            <div className={styles.processingAnimation}>
              <DotLottieReact
                src="/animations/money-floating.lottie"
                autoplay
                loop
                className={styles.moneyLottie}
              />
            </div>
            <h2 className={styles.processingTitle}>Spending Broins...</h2>
            <p className={styles.processingText}>
              Your broins are being used to generate amazing learning materials!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Processing state - show money floating animation with blur overlay
  if (uploadState === 'processing' || uploadState === 'transitioning') {
    return (
      <div className={styles.container}>
        <div className={styles.processingOverlay}>
          <div className={`${styles.processingCard} ${uploadState === 'transitioning' ? styles.fadeOut : ''}`}>
            <div className={styles.processingAnimation}>
              <DotLottieReact
                src="/animations/money-floating.lottie"
                autoplay
                loop
                className={styles.moneyLottie}
              />
            </div>
            <h2 className={styles.processingTitle}>Spending Broins...</h2>
            <p className={styles.processingText}>
              Your broins are being used to generate amazing learning materials!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success state - show businessman rocket animation
  if (uploadState === 'success') {
    return (
      <div className={styles.container}>
        <div className={`${styles.successCard} ${styles.fadeIn}`}>
          <div className={styles.successAnimation}>
            <DotLottieReact
              src="/animations/businessman-rocket.lottie"
              autoplay
              loop
              className={styles.rocketLottie}
            />
          </div>
          <h2 className={styles.successTitle}>Blast Off! Content Uploaded!</h2>
          <p className={styles.successText}>
            {totalChunks > 1
              ? `Your content was processed in ${totalChunks} chunks. ${totalFlashcards} flashcards were generated!`
              : "Your content is being processed. We're generating a summary, key points, and flashcards for you."}
          </p>
          <Link href={`/dashboard/content/${uploadedId}`} className={styles.successBtn}>
            <Sparkles size={18} />
            View Content
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link href="/dashboard" className={styles.backLink}>
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      <div className={styles.grid}>
        {/* Left Column - Form */}
        <div className={styles.formColumn}>
          <div className={styles.header}>
            <h1 className={styles.title}>Create New Set</h1>
            <p className={styles.subtitle}>
              Paste your raw text and let our AI transform it into learning materials.
            </p>
          </div>

          <div className={styles.formCard}>
            <div className={styles.cardGlow}></div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Topic Title <span className={styles.labelOptional}>(Optional)</span>
                </label>
                <div className={styles.inputWrapper}>
                  <Type size={20} className={styles.inputIcon} />
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g., Biology Chapter 5"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>Study Material</label>
                  <span className={styles.charBadge}>Min 200 chars</span>
                </div>
                <div className={styles.textareaWrapper}>
                  <textarea
                    className={styles.textarea}
                    placeholder="Paste your notes, article, or essay here... No character limit!"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={12}
                  />
                  <div className={styles.progressRow}>
                    <span className={styles.charCount}>
                      {charCount.toLocaleString()} chars
                      {charCount > chunkSize && ` (~${estimatedChunks} chunks)`}
                      {charCount >= 200 && ` • ~${estimatedCost} broins`}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={uploadState !== 'idle' || !isValidLength}
              >
                <Sparkles size={18} />
                Generate Summary & Flashcards
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - Benefits */}
        <div className={styles.benefitsColumn}>
          <div className={styles.benefitsHeader}>
            <h3 className={styles.benefitsTitle}>
              <Cpu size={20} className={styles.cpuIcon} />
              What you'll get
            </h3>
            <p className={styles.benefitsSubtext}>
              Our AI analyzes your text to extract the most critical concepts instantly.
            </p>
          </div>

          <div className={styles.benefitsList}>
            <div className={`${styles.benefitCard} ${styles.indigo}`}>
              <div className={styles.benefitIconBox}>
                <FileText size={24} />
              </div>
              <div className={styles.benefitContent}>
                <h4 className={styles.benefitTitle}>Clear Summary</h4>
                <p className={styles.benefitDesc}>
                  A concise, digestible overview of the entire topic, removing fluff and focusing on facts.
                </p>
              </div>
            </div>

            <div className={`${styles.benefitCard} ${styles.pink}`}>
              <div className={styles.benefitIconBox}>
                <ListChecks size={24} />
              </div>
              <div className={styles.benefitContent}>
                <h4 className={styles.benefitTitle}>Key Points</h4>
                <p className={styles.benefitDesc}>
                  Bullet points of the most critical takeaways, perfect for quick review before exams.
                </p>
              </div>
            </div>

            <div className={`${styles.benefitCard} ${styles.amber}`}>
              <div className={styles.benefitIconBox}>
                <Layers size={24} />
              </div>
              <div className={styles.benefitContent}>
                <h4 className={styles.benefitTitle}>Interactive Flashcards</h4>
                <p className={styles.benefitDesc}>
                  Auto-generated Q&A cards to test your active recall and solidify memory.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.socialProof}>
            <div className={styles.avatarStack}>
              <div className={`${styles.avatar} ${styles.avatar1}`}>JM</div>
              <div className={`${styles.avatar} ${styles.avatar2}`}>SK</div>
              <div className={`${styles.avatar} ${styles.avatar3}`}>AR</div>
              <div className={`${styles.avatar} ${styles.avatar4}`}>LT</div>
              <div className={styles.avatarCount}>+2k</div>
            </div>
            <p className={styles.socialText}>Join 2,000+ students mastering topics faster.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
