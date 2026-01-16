'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { uploadService, userService } from '@/services';
import type { Flashcard, UploadSummary, PracticeStats } from '@/types';
import {
  X,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  Lightbulb,
  Zap,
  Check,
  XIcon,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import styles from './practice.module.css';

export default function PracticePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const uploadId = params.uploadId as string;
  const chunkIndexParam = searchParams.get('chunk');
  const chunkIndex = chunkIndexParam !== null ? parseInt(chunkIndexParam, 10) : null;
  const practiceMode = searchParams.get('mode'); // 'key' for key flashcards only
  const { isLoading: authLoading, isAuthenticated } = useAuth();

  const [upload, setUpload] = useState<UploadSummary | null>(null);
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [stats, setStats] = useState<PracticeStats | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardIndex, setCardIndex] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [totalCards, setTotalCards] = useState(0);
  const [sessionAttemptedIds, setSessionAttemptedIds] = useState<Set<string>>(new Set());
  const [feedbackType, setFeedbackType] = useState<'difficult' | 'good' | 'easy' | null>(null);
  const [xpGained, setXpGained] = useState<number | null>(null);
  const [failedCards, setFailedCards] = useState<Flashcard[]>([]);
  const [loadedFlashcards, setLoadedFlashcards] = useState<Flashcard[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreCards, setHasMoreCards] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const hasFetchedRef = useRef(false);
  const CARDS_PER_PAGE = 10;

  // Load more flashcards when running low
  const loadMoreCards = useCallback(async (page: number) => {
    // Don't load more for key mode or chunked uploads without specific chunk
    // (they use key flashcards which are loaded all at once)
    if (isLoadingMore || practiceMode === 'key' || (upload?.isChunked && chunkIndex === null)) return;

    try {
      setIsLoadingMore(true);
      const response = await uploadService.getPaginatedFlashcards(
        uploadId,
        page,
        CARDS_PER_PAGE,
        chunkIndex ?? undefined
      );

      setLoadedFlashcards(prev => [...prev, ...response.flashcards]);
      setCurrentPage(page);
      setHasMoreCards(response.hasMore);
    } catch (err) {
      console.error('Failed to load more cards:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [uploadId, chunkIndex, practiceMode, isLoadingMore, upload?.isChunked]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch upload summary (lightweight) and stats
      const [uploadData, statsData] = await Promise.all([
        uploadService.getUploadSummary(uploadId),
        uploadService.getPracticeStats(uploadId)
      ]);
      setUpload(uploadData);
      setStats(statsData);

      // Determine if we should use key flashcards:
      // - Explicitly requested via mode=key
      // - OR it's a chunked upload WITHOUT a specific chunk selected (overview mode)
      // When a specific chunk is selected, load ALL flashcards for that chunk
      const useKeyFlashcards = practiceMode === 'key' || (uploadData.isChunked && chunkIndex === null);

      if (useKeyFlashcards) {
        // Key mode: get curated key flashcards (1-2 per chunk) - load all at once
        const keyFlashcardsRes = await uploadService.getKeyFlashcards(uploadId, 2);
        const filteredFlashcards = keyFlashcardsRes.flashcards;

        setLoadedFlashcards(filteredFlashcards);
        setTotalCards(filteredFlashcards.length);
        setHasMoreCards(false);

        if (filteredFlashcards.length > 0) {
          const randomIndex = Math.floor(Math.random() * filteredFlashcards.length);
          setCurrentCard(filteredFlashcards[randomIndex]);
        }
      } else {
        // Normal mode OR specific chunk selected: use paginated loading for ALL flashcards
        const paginatedRes = await uploadService.getPaginatedFlashcards(
          uploadId,
          1,
          CARDS_PER_PAGE,
          chunkIndex ?? undefined
        );

        setLoadedFlashcards(paginatedRes.flashcards);
        setTotalCards(paginatedRes.totalCount);
        setCurrentPage(1);
        setHasMoreCards(paginatedRes.hasMore);

        if (paginatedRes.flashcards.length > 0) {
          const randomIndex = Math.floor(Math.random() * paginatedRes.flashcards.length);
          setCurrentCard(paginatedRes.flashcards[randomIndex]);
        } else {
          setCurrentCard(null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [uploadId, chunkIndex, practiceMode]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated && uploadId && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchData();
    }
  }, [authLoading, isAuthenticated, uploadId, router, fetchData]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSubmitting) {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      }
      // Number keys for difficulty after flip
      if (isFlipped && !isSubmitting) {
        if (e.key === '1') handleDifficulty(1);
        if (e.key === '2') handleDifficulty(2);
        if (e.key === '3') handleDifficulty(3);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, isSubmitting]);

  const handleFlip = () => {
    if (!isSubmitting) {
      setIsFlipped(prev => !prev);
    }
  };

  const handleDifficulty = async (difficulty: 1 | 2 | 3) => {
    if (!currentCard || isSubmitting || feedbackType) return;

    // Show feedback animation
    const feedbackMap: Record<number, 'difficult' | 'good' | 'easy'> = {
      1: 'difficult',
      2: 'good',
      3: 'easy'
    };
    setFeedbackType(feedbackMap[difficulty]);

    // Animation duration: Fast for all (1.2s for easy, 1.5s for others)
    const animationDuration = difficulty === 3 ? 1200 : 1500;

    setIsSubmitting(true);
    try {
      const result = await uploadService.submitDifficulty(uploadId, {
        flashcardId: currentCard.id,
        difficulty
      });

      // Show XP gain
      if (result.xpGained > 0) {
        setXpGained(result.xpGained);
        setTimeout(() => setXpGained(null), 2000);
      }

      // Track failed cards (difficulty 1 = Difficult)
      if (difficulty === 1 && currentCard) {
        setFailedCards(prev => [...prev, currentCard]);
      }

      // Track this card as attempted in current session
      const newAttemptedIds = new Set(sessionAttemptedIds);
      newAttemptedIds.add(currentCard.id);
      setSessionAttemptedIds(newAttemptedIds);

      const newStats = await uploadService.getPracticeStats(uploadId);
      setStats(newStats);

      // Wait for animation to complete before moving to next card
      await new Promise(resolve => setTimeout(resolve, animationDuration));
      setFeedbackType(null);

      // Check if we've gone through all cards in this session
      if (newAttemptedIds.size >= totalCards) {
        // Dispatch event to refresh dashboard stats
        window.dispatchEvent(new CustomEvent('practiceComplete'));
        setCompleted(true);
        return;
      }

      setIsFlipped(false);
      setShowHint(false);

      // Pick a random card from our loaded flashcards that we haven't seen this session
      const availableCards = loadedFlashcards.filter(f => !newAttemptedIds.has(f.id));

      // If running low on available cards and there are more to load, fetch them
      if (availableCards.length <= 3 && hasMoreCards && !isLoadingMore) {
        loadMoreCards(currentPage + 1);
      }

      if (availableCards.length === 0) {
        // Check if there are more cards to load
        if (hasMoreCards) {
          // Wait for more cards to load
          await loadMoreCards(currentPage + 1);
          const newAvailableCards = loadedFlashcards.filter(f => !newAttemptedIds.has(f.id));
          if (newAvailableCards.length > 0) {
            const randomIndex = Math.floor(Math.random() * newAvailableCards.length);
            setCurrentCard(newAvailableCards[randomIndex]);
            setCardIndex(prev => prev + 1);
            return;
          }
        }

        // Dispatch event to refresh dashboard stats
        window.dispatchEvent(new CustomEvent('practiceComplete'));
        setCompleted(true);
        return;
      }

      // Pick a random card from available ones
      const randomIndex = Math.floor(Math.random() * availableCards.length);
      setCurrentCard(availableCards[randomIndex]);
      setCardIndex(prev => prev + 1);
    } catch (err) {
      console.error('Failed to submit difficulty:', err);
      setFeedbackType(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    setCardIndex(1);
    setCompleted(false);
    setIsFlipped(false);
    setShowHint(false);
    setSessionAttemptedIds(new Set()); // Reset session tracking
    setFailedCards([]); // Reset failed cards
    setLoadedFlashcards([]); // Reset loaded flashcards
    setCurrentPage(1);
    setHasMoreCards(false);
    hasFetchedRef.current = false; // Allow re-fetch for restart
    fetchData();
    hasFetchedRef.current = true; // Prevent subsequent double-fetches
  };

  const progressPercent = totalCards > 0
    ? Math.round((cardIndex / totalCards) * 100)
    : 0;

  if (authLoading || !isAuthenticated) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (completed) {
    const accuracy = Math.round(stats?.accuracy || 0);

    return (
      <div className={styles.container}>
        <div className={styles.completedCard}>
          {/* Accuracy Circle */}
          <div className={styles.accuracyCircle}>
            <svg className={styles.accuracyRing} viewBox="0 0 120 120">
              <circle
                className={styles.accuracyRingBg}
                cx="60"
                cy="60"
                r="54"
                fill="none"
                strokeWidth="8"
              />
              <circle
                className={styles.accuracyRingFill}
                cx="60"
                cy="60"
                r="54"
                fill="none"
                strokeWidth="8"
                strokeDasharray={`${accuracy * 3.39} 339`}
                strokeLinecap="round"
              />
            </svg>
            <div className={styles.accuracyValue}>
              <span className={styles.accuracyNumber}>{accuracy}</span>
              <span className={styles.accuracyPercent}>%</span>
            </div>
          </div>

          <h1 className={styles.completedTitle}>Session Complete</h1>
          <p className={styles.sessionName}>
            {chunkIndex !== null
              ? `Part ${chunkIndex + 1} - ${upload?.title || 'Flashcards'}`
              : practiceMode === 'key'
                ? `Key Cards - ${upload?.title || 'Flashcards'}`
                : upload?.title || 'Flashcards'
            }
          </p>

          {/* Failed Cards Section */}
          {failedCards.length > 0 && (
            <div className={styles.failedSection}>
              <div className={styles.failedHeader}>
                <AlertCircle size={18} />
                <span>Review These ({failedCards.length})</span>
              </div>
              <div className={styles.failedList}>
                {failedCards.map((card, index) => (
                  <div key={card.id} className={styles.failedCard}>
                    <span className={styles.failedIndex}>{index + 1}</span>
                    <p className={styles.failedQuestion}>{card.front}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className={styles.completedActions}>
            <button onClick={handleRestart} className={styles.restartBtn}>
              <RotateCcw size={18} />
              Practice Again
            </button>
            <Link
              href={chunkIndex !== null
                ? `/dashboard/content/${uploadId}/chunk/${chunkIndex}`
                : `/dashboard/content/${uploadId}`
              }
              className={styles.backBtn}
            >
              <ArrowLeft size={18} />
              Back to Content
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.progressSection}>
          <Link
            href={chunkIndex !== null
              ? `/dashboard/content/${uploadId}/chunk/${chunkIndex}`
              : `/dashboard/content/${uploadId}`
            }
            className={styles.exitBtn}
          >
            <X size={24} />
          </Link>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className={styles.progressText}>
            {cardIndex} / {totalCards || '?'}
          </span>
        </div>
        <div className={styles.keyboardHint}>
          Space to Flip
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {isLoading ? (
          <div className={styles.loadingCard}>
            <div className={styles.spinner}></div>
            <p>Loading flashcard...</p>
          </div>
        ) : currentCard ? (
          <div className={styles.flashcardContainer}>
            {/* 3D Flip Card */}
            <div
              className={`${styles.flipCardWrapper} ${isFlipped ? styles.flipped : ''}`}
              onClick={handleFlip}
            >
              <div className={styles.flipCardInner}>
                {/* Front Side (Question/Term) */}
                <div className={styles.flipCardFront}>
                  <span className={styles.cardLabel}>Question</span>
                  {currentCard.hint && (
                    <button
                      className={styles.hintBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowHint(!showHint);
                      }}
                    >
                      <Lightbulb size={16} />
                      Hint
                    </button>
                  )}

                  <h2 className={styles.cardText}>{currentCard.front}</h2>

                  {showHint && currentCard.hint && (
                    <div className={styles.hintBox}>
                      <Lightbulb size={14} />
                      {currentCard.hint}
                    </div>
                  )}

                  <p className={styles.flipPrompt}>Click to flip</p>
                </div>

                {/* Back Side (Answer) */}
                <div className={styles.flipCardBack}>
                  <span className={styles.cardLabelBack}>Answer</span>

                  <p className={styles.answerText}>{currentCard.back}</p>
                </div>
              </div>
            </div>

            {/* Difficulty Buttons - Show after flip */}
            {isFlipped && !feedbackType && (
              <div className={styles.difficultyActions}>
                <button
                  className={`${styles.difficultyBtn} ${styles.difficultBtn}`}
                  onClick={() => handleDifficulty(1)}
                  disabled={isSubmitting}
                >
                  <span className={styles.difficultyLabel}>Difficult</span>
                  <XIcon size={18} />
                  <span className={styles.difficultyKey}>1</span>
                </button>
                <button
                  className={`${styles.difficultyBtn} ${styles.goodBtn}`}
                  onClick={() => handleDifficulty(2)}
                  disabled={isSubmitting}
                >
                  <span className={styles.difficultyLabel}>Good</span>
                  <Check size={18} />
                  <span className={styles.difficultyKey}>2</span>
                </button>
                <button
                  className={`${styles.difficultyBtn} ${styles.easyBtn}`}
                  onClick={() => handleDifficulty(3)}
                  disabled={isSubmitting}
                >
                  <span className={styles.difficultyLabel}>Easy</span>
                  <Zap size={18} />
                  <span className={styles.difficultyKey}>3</span>
                </button>
              </div>
            )}

            {/* Lottie Feedback Animation Overlay */}
            {feedbackType && (
              <div className={styles.feedbackOverlay}>
                {/* DIFFICULT: Kicking Cat */}
                {feedbackType === 'difficult' && (
                  <>
                    <div className={styles.lottieContainer}>
                      <DotLottieReact
                        src="/animations/cat-difficult.lottie"
                        autoplay
                        loop
                        className={styles.lottieAnimation}
                      />
                    </div>
                    <div className={`${styles.feedbackText} ${styles.difficultText}`}>
                      Keep Going!
                    </div>
                  </>
                )}

                {/* GOOD: Cat Hero */}
                {feedbackType === 'good' && (
                  <>
                    <div className={styles.lottieContainer}>
                      <DotLottieReact
                        src="/animations/cat-hero.lottie"
                        autoplay
                        loop
                        className={styles.lottieAnimation}
                      />
                    </div>
                    <div className={`${styles.feedbackText} ${styles.goodText}`}>
                      Great Job!
                    </div>
                  </>
                )}

                {/* EASY: Dancing Cat */}
                {feedbackType === 'easy' && (
                  <>
                    <div className={styles.lottieContainer}>
                      <DotLottieReact
                        src="/animations/cat-easy.lottie"
                        autoplay
                        loop
                        className={styles.lottieAnimation}
                      />
                    </div>
                    <div className={`${styles.feedbackText} ${styles.easyText}`}>
                      Too Easy!
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className={styles.errorCard}>
            <div className={styles.errorIcon}>
              <CheckCircle2 size={64} />
            </div>
            <h2>No flashcards available</h2>
            <p>This upload doesn&apos;t have any flashcards yet.</p>
            <Link href="/dashboard" className={styles.backBtn}>
              <ArrowLeft size={18} />
              Back to Dashboard
            </Link>
          </div>
        )}

        {/* XP Gain Floating Indicator */}
        {xpGained && (
          <div className={styles.xpGainIndicator}>
            <Sparkles size={18} />
            <span>+{xpGained} XP</span>
          </div>
        )}

      </main>
    </div>
  );
}
