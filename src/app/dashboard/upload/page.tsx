'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { uploadService, subscriptionService } from '@/services';
import type { SubscriptionStatusResponse } from '@/types';
import { FREE_TIER_LIMITS, PRO_TIER_LIMITS } from '@/types';
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
  Clock,
  Upload,
  File,
  Crown,
  AlertTriangle,
  Link2,
  Mic
} from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import styles from './upload.module.css';

type UploadState = 'idle' | 'spending' | 'processing' | 'chunking' | 'transitioning' | 'success';
type UploadMode = 'text' | 'pdf' | 'url' | 'voice';

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

  // Upload mode state
  const [uploadMode, setUploadMode] = useState<UploadMode>('text');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // URL upload state
  const [urlInput, setUrlInput] = useState('');

  // Voice upload state
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isAudioDragging, setIsAudioDragging] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Subscription/tier state
  const [subscription, setSubscription] = useState<SubscriptionStatusResponse | null>(null);

  // Chunk progress state
  const [totalChunks, setTotalChunks] = useState(0);
  const [completedChunks, setCompletedChunks] = useState(0);
  const [totalFlashcards, setTotalFlashcards] = useState(0);
  const [chunkStatuses, setChunkStatuses] = useState<ChunkStatus[]>([]);

  // Fetch subscription status
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const data = await subscriptionService.getStatus();
        setSubscription(data);
      } catch (err) {
        console.error('Failed to fetch subscription:', err);
      }
    };
    fetchSubscription();
  }, []);

  const charCount = content.length;
  const tierLimits = subscription?.isPro ? PRO_TIER_LIMITS : FREE_TIER_LIMITS;
  const maxChars = tierLimits.textMaxChars;
  const maxPdfPages = tierLimits.pdfMaxPages;
  const isOverCharLimit = charCount > maxChars;

  // Validation for each mode
  const isValidUrl = urlInput.trim().length > 0 && (urlInput.startsWith('http://') || urlInput.startsWith('https://'));
  const isValidLength =
    uploadMode === 'text' ? charCount >= 200 && !isOverCharLimit :
    uploadMode === 'pdf' ? pdfFile !== null :
    uploadMode === 'url' ? isValidUrl :
    uploadMode === 'voice' ? audioFile !== null : false;
  const chunkSize = 4000;
  const estimatedChunks = Math.ceil(charCount / (chunkSize - 350)); // Account for overlap

  // Calculate cost: 1 broin per 500 chars
  const estimatedCost = Math.ceil(charCount / 500);

  // PDF file handlers
  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file');
      return;
    }
    setPdfFile(file);
    setError('');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveFile = () => {
    setPdfFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Audio file handlers
  const handleAudioSelect = (file: File) => {
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/m4a', 'audio/mp4'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|webm|ogg|m4a)$/i)) {
      setError('Please select a valid audio file (MP3, WAV, WebM, OGG, M4A)');
      return;
    }
    setAudioFile(file);
    setError('');
  };

  const handleAudioDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsAudioDragging(true);
  };

  const handleAudioDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsAudioDragging(false);
  };

  const handleAudioDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsAudioDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleAudioSelect(file);
    }
  };

  const handleAudioInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAudioSelect(file);
    }
  };

  const handleRemoveAudio = () => {
    setAudioFile(null);
    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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

    if (uploadMode === 'text') {
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
    } else if (uploadMode === 'pdf') {
      // PDF upload
      if (!pdfFile) {
        setError('Please select a PDF file');
        return;
      }

      // For PDF uploads, we don't know the char count yet, so show spending animation
      setUploadState('spending');

      const startTime = Date.now();

      try {
        const result = await uploadService.createPdfUpload({
          file: pdfFile,
          title: title || undefined
        });
        setUploadedId(result.id);

        // Check if PDF will be chunked based on response
        const isChunked = result.isChunked && (result.totalChunks || 0) > 1;

        if (isChunked) {
          // Initialize chunk statuses for PDF
          const chunks = result.totalChunks || 1;
          setTotalChunks(chunks);
          setCompletedChunks(0);
          setTotalFlashcards(0);
          setChunkStatuses(
            Array.from({ length: chunks }, (_, i) => ({
              index: i,
              status: i === 0 ? 'processing' : 'pending'
            }))
          );

          const elapsed = Date.now() - startTime;
          const minSpendingTime = 3000;
          const remainingTime = Math.max(0, minSpendingTime - elapsed);

          setTimeout(() => {
            setUploadState('chunking');
          }, remainingTime);
        } else {
          // Non-chunked PDF
          const elapsed = Date.now() - startTime;
          const minDisplayTime = 2000;
          const remainingTime = Math.max(0, minDisplayTime - elapsed);

          setTimeout(() => {
            setUploadState('transitioning');
            setTimeout(() => {
              setUploadState('success');
            }, 400);
          }, remainingTime);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to process PDF. Please try again.';
        setError(errorMessage);
        setUploadState('idle');
      }
    } else if (uploadMode === 'url') {
      // URL upload
      if (!isValidUrl) {
        setError('Please enter a valid URL (starting with http:// or https://)');
        return;
      }

      setUploadState('spending');
      const startTime = Date.now();

      try {
        const result = await uploadService.createUrlUpload({
          url: urlInput.trim(),
          title: title || undefined
        });
        setUploadedId(result.id);

        // Check if URL content will be chunked based on response
        const isChunked = result.isChunked && (result.totalChunks || 0) > 1;

        if (isChunked) {
          const chunks = result.totalChunks || 1;
          setTotalChunks(chunks);
          setCompletedChunks(0);
          setTotalFlashcards(0);
          setChunkStatuses(
            Array.from({ length: chunks }, (_, i) => ({
              index: i,
              status: i === 0 ? 'processing' : 'pending'
            }))
          );

          const elapsed = Date.now() - startTime;
          const minSpendingTime = 3000;
          const remainingTime = Math.max(0, minSpendingTime - elapsed);

          setTimeout(() => {
            setUploadState('chunking');
          }, remainingTime);
        } else {
          const elapsed = Date.now() - startTime;
          const minDisplayTime = 2000;
          const remainingTime = Math.max(0, minDisplayTime - elapsed);

          setTimeout(() => {
            setUploadState('transitioning');
            setTimeout(() => {
              setUploadState('success');
            }, 400);
          }, remainingTime);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to extract content from URL. Please try again.';
        setError(errorMessage);
        setUploadState('idle');
      }
    } else if (uploadMode === 'voice') {
      // Voice upload
      if (!audioFile) {
        setError('Please select an audio file');
        return;
      }

      setUploadState('spending');
      const startTime = Date.now();

      try {
        const result = await uploadService.createVoiceUpload({
          audioFile: audioFile,
          title: title || undefined
        });
        setUploadedId(result.id);

        // Check if transcribed content will be chunked based on response
        const isChunked = result.isChunked && (result.totalChunks || 0) > 1;

        if (isChunked) {
          const chunks = result.totalChunks || 1;
          setTotalChunks(chunks);
          setCompletedChunks(0);
          setTotalFlashcards(0);
          setChunkStatuses(
            Array.from({ length: chunks }, (_, i) => ({
              index: i,
              status: i === 0 ? 'processing' : 'pending'
            }))
          );

          const elapsed = Date.now() - startTime;
          const minSpendingTime = 3000;
          const remainingTime = Math.max(0, minSpendingTime - elapsed);

          setTimeout(() => {
            setUploadState('chunking');
          }, remainingTime);
        } else {
          const elapsed = Date.now() - startTime;
          const minDisplayTime = 2000;
          const remainingTime = Math.max(0, minDisplayTime - elapsed);

          setTimeout(() => {
            setUploadState('transitioning');
            setTimeout(() => {
              setUploadState('success');
            }, 400);
          }, remainingTime);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to transcribe audio. Please try again.';
        setError(errorMessage);
        setUploadState('idle');
      }
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

            {/* Upload Mode Tabs */}
            <div className={styles.uploadTabs}>
              <button
                type="button"
                className={`${styles.uploadTab} ${uploadMode === 'text' ? styles.uploadTabActive : ''}`}
                onClick={() => setUploadMode('text')}
              >
                <Type size={18} />
                Text
              </button>
              <button
                type="button"
                className={`${styles.uploadTab} ${uploadMode === 'pdf' ? styles.uploadTabActive : ''}`}
                onClick={() => setUploadMode('pdf')}
              >
                <FileText size={18} />
                PDF
              </button>
              <button
                type="button"
                className={`${styles.uploadTab} ${uploadMode === 'url' ? styles.uploadTabActive : ''}`}
                onClick={() => setUploadMode('url')}
              >
                <Link2 size={18} />
                URL
              </button>
              <button
                type="button"
                className={`${styles.uploadTab} ${uploadMode === 'voice' ? styles.uploadTabActive : ''}`}
                onClick={() => setUploadMode('voice')}
              >
                <Mic size={18} />
                Voice
              </button>
            </div>

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

              {/* Text Mode */}
              {uploadMode === 'text' && (
                <div className={styles.formGroup}>
                  <div className={styles.labelRow}>
                    <label className={styles.label}>Study Material</label>
                    <span className={styles.charBadge}>
                      {(maxChars / 1000).toFixed(0)}K chars max
                      {!subscription?.isPro && ' (Free)'}
                    </span>
                  </div>
                  <div className={styles.textareaWrapper}>
                    <textarea
                      className={`${styles.textarea} ${isOverCharLimit ? styles.textareaError : ''}`}
                      placeholder="Paste your notes, article, or essay here..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={12}
                    />
                    <div className={styles.progressRow}>
                      <span className={`${styles.charCount} ${isOverCharLimit ? styles.charCountError : ''}`}>
                        {charCount.toLocaleString()} / {(maxChars / 1000).toFixed(0)}K chars
                        {charCount > chunkSize && ` (~${estimatedChunks} chunks)`}
                        {charCount >= 200 && !isOverCharLimit && ` • ~${estimatedCost} broins`}
                      </span>
                    </div>
                  </div>

                  {/* Tier limit warning */}
                  {isOverCharLimit && (
                    <div className={styles.tierWarning}>
                      <AlertTriangle size={16} />
                      <span>
                        Text exceeds {subscription?.isPro ? 'Pro' : 'Free'} tier limit of {(maxChars / 1000).toFixed(0)}K characters.
                        {!subscription?.isPro && (
                          <>
                            {' '}
                            <Link href="/dashboard/subscription" className={styles.tierWarningLink}>
                              <Crown size={12} /> Upgrade to Pro
                            </Link>
                            {' '}for up to {(PRO_TIER_LIMITS.textMaxChars / 1000).toFixed(0)}K characters.
                          </>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Pro upsell hint for non-pro users approaching limit */}
                  {!subscription?.isPro && charCount > maxChars * 0.8 && !isOverCharLimit && (
                    <div className={styles.tierHint}>
                      <Crown size={14} />
                      <span>
                        Approaching limit.{' '}
                        <Link href="/dashboard/subscription" className={styles.tierHintLink}>
                          Upgrade to Pro
                        </Link>
                        {' '}for {(PRO_TIER_LIMITS.textMaxChars / 1000).toFixed(0)}K chars.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* PDF Mode */}
              {uploadMode === 'pdf' && (
                <div className={styles.formGroup}>
                  <div className={styles.labelRow}>
                    <label className={styles.label}>PDF Document</label>
                    <span className={styles.charBadge}>
                      Up to {maxPdfPages} pages
                      {!subscription?.isPro && ' (Free)'}
                    </span>
                  </div>

                  {!pdfFile ? (
                    <div
                      className={`${styles.dropZone} ${isDragging ? styles.dropZoneDragging : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleFileInputChange}
                        className={styles.fileInput}
                      />
                      <div className={styles.dropZoneIcon}>
                        <Upload size={40} />
                      </div>
                      <p className={styles.dropZoneText}>
                        Drag & drop your PDF here, or <span className={styles.dropZoneLink}>browse</span>
                      </p>
                      <p className={styles.dropZoneHint}>
                        Text-based PDFs only (up to {maxPdfPages} pages, {tierLimits.maxFileSizeMB}MB max)
                      </p>
                      {!subscription?.isPro && (
                        <p className={styles.dropZoneProHint}>
                          <Crown size={12} /> Pro users get up to {PRO_TIER_LIMITS.pdfMaxPages} pages
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className={styles.filePreview}>
                      <div className={styles.filePreviewIcon}>
                        <File size={32} />
                      </div>
                      <div className={styles.filePreviewInfo}>
                        <p className={styles.filePreviewName}>{pdfFile.name}</p>
                        <p className={styles.filePreviewSize}>{formatFileSize(pdfFile.size)}</p>
                      </div>
                      <button
                        type="button"
                        className={styles.filePreviewRemove}
                        onClick={handleRemoveFile}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* URL Mode */}
              {uploadMode === 'url' && (
                <div className={styles.formGroup}>
                  <div className={styles.labelRow}>
                    <label className={styles.label}>Web Page URL</label>
                    <span className={styles.charBadge}>
                      Article, blog, or documentation
                    </span>
                  </div>
                  <div className={styles.inputWrapper}>
                    <Link2 size={20} className={styles.inputIcon} />
                    <input
                      type="url"
                      className={styles.input}
                      placeholder="https://example.com/article"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                    />
                  </div>
                  <p className={styles.dropZoneHint} style={{ marginTop: '0.5rem' }}>
                    We'll extract the main content from the page and generate learning materials
                  </p>
                </div>
              )}

              {/* Voice Mode */}
              {uploadMode === 'voice' && (
                <div className={styles.formGroup}>
                  <div className={styles.labelRow}>
                    <label className={styles.label}>Audio Recording</label>
                    <span className={styles.charBadge}>
                      MP3, WAV, WebM, OGG, M4A
                    </span>
                  </div>

                  {!audioFile ? (
                    <div
                      className={`${styles.dropZone} ${isAudioDragging ? styles.dropZoneDragging : ''}`}
                      onDragOver={handleAudioDragOver}
                      onDragLeave={handleAudioDragLeave}
                      onDrop={handleAudioDrop}
                      onClick={() => audioInputRef.current?.click()}
                    >
                      <input
                        ref={audioInputRef}
                        type="file"
                        accept="audio/*,.mp3,.wav,.webm,.ogg,.m4a"
                        onChange={handleAudioInputChange}
                        className={styles.fileInput}
                      />
                      <div className={styles.dropZoneIcon}>
                        <Mic size={40} />
                      </div>
                      <p className={styles.dropZoneText}>
                        Drag & drop your audio file here, or <span className={styles.dropZoneLink}>browse</span>
                      </p>
                      <p className={styles.dropZoneHint}>
                        Lecture recordings, voice notes, or podcasts (up to 50MB)
                      </p>
                    </div>
                  ) : (
                    <div className={styles.filePreview}>
                      <div className={styles.filePreviewIcon}>
                        <Mic size={32} />
                      </div>
                      <div className={styles.filePreviewInfo}>
                        <p className={styles.filePreviewName}>{audioFile.name}</p>
                        <p className={styles.filePreviewSize}>{formatFileSize(audioFile.size)}</p>
                      </div>
                      <button
                        type="button"
                        className={styles.filePreviewRemove}
                        onClick={handleRemoveAudio}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={uploadState !== 'idle' || !isValidLength}
              >
                <Sparkles size={18} />
                {uploadMode === 'text' && 'Generate Summary & Flashcards'}
                {uploadMode === 'pdf' && 'Process PDF & Generate Flashcards'}
                {uploadMode === 'url' && 'Extract & Generate Flashcards'}
                {uploadMode === 'voice' && 'Transcribe & Generate Flashcards'}
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
