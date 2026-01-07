'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { uploadService } from '@/services';
import type { Flashcard, Upload, PracticeStats } from '@/types';
import {
  X,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  Lightbulb,
  Zap,
  Check,
  XIcon
} from 'lucide-react';
import styles from './practice.module.css';

export default function PracticePage() {
  const router = useRouter();
  const params = useParams();
  const uploadId = params.uploadId as string;
  const { isLoading: authLoading, isAuthenticated } = useAuth();

  const [upload, setUpload] = useState<Upload | null>(null);
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

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [uploadData, statsData] = await Promise.all([
        uploadService.getUpload(uploadId),
        uploadService.getPracticeStats(uploadId)
      ]);
      setUpload(uploadData);
      setStats(statsData);
      setTotalCards(uploadData.flashcardCount || 0);

      const flashcard = await uploadService.getRandomFlashcard(uploadId, false);
      setCurrentCard(flashcard);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [uploadId]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated && uploadId) {
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
    if (!currentCard || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await uploadService.submitDifficulty(uploadId, {
        flashcardId: currentCard.id,
        difficulty
      });

      // Track this card as attempted in current session
      const newAttemptedIds = new Set(sessionAttemptedIds);
      newAttemptedIds.add(currentCard.id);
      setSessionAttemptedIds(newAttemptedIds);

      const newStats = await uploadService.getPracticeStats(uploadId);
      setStats(newStats);

      // Check if we've gone through all cards in this session
      if (newAttemptedIds.size >= totalCards) {
        setCompleted(true);
        return;
      }

      setIsFlipped(false);
      setShowHint(false);

      // Get all flashcards and pick a random one we haven't seen this session
      try {
        const allFlashcards = await uploadService.getFlashcards(uploadId);
        const availableCards = allFlashcards.filter(f => !newAttemptedIds.has(f.id));

        if (availableCards.length === 0) {
          setCompleted(true);
          return;
        }

        // Pick a random card from available ones
        const randomIndex = Math.floor(Math.random() * availableCards.length);
        setCurrentCard(availableCards[randomIndex]);
        setCardIndex(prev => prev + 1);
      } catch {
        setCompleted(true);
      }
    } catch (err) {
      console.error('Failed to submit difficulty:', err);
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
    fetchData();
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
    return (
      <div className={styles.container}>
        <div className={styles.completedCard}>
          <div className={styles.completedIcon}>
            <CheckCircle2 size={64} color="#34d399" />
          </div>
          <h1>Practice Complete!</h1>
          <p>Great job! Here are your results:</p>

          <div className={styles.finalStats}>
            <div className={styles.finalStat}>
              <span className={styles.finalStatValue}>{stats?.totalAttempts || 0}</span>
              <span className={styles.finalStatLabel}>Cards Reviewed</span>
            </div>
            <div className={styles.finalStat}>
              <span className={styles.finalStatValue}>{stats?.correctAttempts || 0}</span>
              <span className={styles.finalStatLabel}>Mastered</span>
            </div>
            <div className={styles.finalStat}>
              <span className={styles.finalStatValue}>{Math.round(stats?.accuracy || 0)}%</span>
              <span className={styles.finalStatLabel}>Performance</span>
            </div>
          </div>

          <div className={styles.completedActions}>
            <button onClick={handleRestart} className={styles.restartBtn}>
              <RotateCcw size={18} />
              Practice Again
            </button>
            <Link href="/dashboard" className={styles.backBtn}>
              <ArrowLeft size={18} />
              Back to Dashboard
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
          <Link href="/dashboard" className={styles.exitBtn}>
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
            {isFlipped && (
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
      </main>
    </div>
  );
}
