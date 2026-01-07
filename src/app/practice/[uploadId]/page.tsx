'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { uploadService } from '@/services';
import type { Flashcard, Upload, PracticeStats } from '@/types';
import styles from './practice.module.css';

export default function PracticePage() {
  const router = useRouter();
  const params = useParams();
  const uploadId = params.uploadId as string;
  const { isLoading: authLoading, isAuthenticated } = useAuth();

  const [upload, setUpload] = useState<Upload | null>(null);
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [stats, setStats] = useState<PracticeStats | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [correctAnswerId, setCorrectAnswerId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardIndex, setCardIndex] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [attemptedCards, setAttemptedCards] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [uploadData, statsData] = await Promise.all([
        uploadService.getUpload(uploadId),
        uploadService.getPracticeStats(uploadId)
      ]);
      setUpload(uploadData);
      setStats(statsData);

      // Get first flashcard
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

  const handleSelectAnswer = (answerId: string) => {
    if (showResult) return;
    setSelectedAnswer(answerId);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !currentCard) return;

    setIsSubmitting(true);
    try {
      const result = await uploadService.submitAnswer(uploadId, {
        flashcardId: currentCard.id,
        answerId: selectedAnswer
      });

      setIsCorrect(result.isCorrect);
      setExplanation(result.explanation);
      setCorrectAnswerId(result.correctAnswerId);
      setShowResult(true);

      // Update stats
      const newStats = await uploadService.getPracticeStats(uploadId);
      setStats(newStats);
    } catch (err) {
      console.error('Failed to submit answer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextCard = async () => {
    // Mark current card as attempted
    if (currentCard) {
      setAttemptedCards(prev => new Set(prev).add(currentCard.id));
    }

    // Check if we've completed all flashcards
    const totalCards = upload?.flashcardCount || 0;
    if (cardIndex >= totalCards) {
      setCompleted(true);
      return;
    }

    setSelectedAnswer(null);
    setShowResult(false);
    setIsCorrect(false);
    setExplanation('');
    setCorrectAnswerId('');
    setIsLoading(true);

    try {
      // Use excludeAttempted: true to get only unattempted cards
      const flashcard = await uploadService.getRandomFlashcard(uploadId, true);
      setCurrentCard(flashcard);
      setCardIndex(prev => prev + 1);
    } catch (err) {
      // No more cards available
      setCompleted(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setCardIndex(1);
    setCompleted(false);
    setAttemptedCards(new Set());
    fetchData();
  };

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
          <div className={styles.completedIcon}>🎉</div>
          <h1>Practice Complete!</h1>
          <p>Great job! Here are your results:</p>

          <div className={styles.finalStats}>
            <div className={styles.finalStat}>
              <span className={styles.finalStatValue}>{stats?.totalAttempts || 0}</span>
              <span className={styles.finalStatLabel}>Total Attempts</span>
            </div>
            <div className={styles.finalStat}>
              <span className={styles.finalStatValue}>{stats?.correctAttempts || 0}</span>
              <span className={styles.finalStatLabel}>Correct</span>
            </div>
            <div className={styles.finalStat}>
              <span className={styles.finalStatValue}>{stats?.accuracy || 0}%</span>
              <span className={styles.finalStatLabel}>Accuracy</span>
            </div>
          </div>

          <div className={styles.completedActions}>
            <button onClick={handleRestart} className={styles.restartBtn}>
              Practice Again
            </button>
            <Link href="/dashboard" className={styles.backBtn}>
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
        <Link href="/dashboard" className={styles.backLink}>
          <span>←</span> Back to Dashboard
        </Link>
        <div className={styles.headerInfo}>
          <h1>{upload?.title || 'Practice Mode'}</h1>
          <div className={styles.progress}>
            Card {cardIndex} of {upload?.flashcardCount || '?'}
          </div>
        </div>
        <div className={styles.statsBar}>
          <span className={styles.statItem}>
            🎯 Accuracy: {stats?.accuracy || 0}%
          </span>
          <span className={styles.statItem}>
            ✅ {stats?.correctAttempts || 0}/{stats?.totalAttempts || 0}
          </span>
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
            <div className={styles.flashcard}>
              <div className={styles.flashcardHeader}>
                <span className={styles.flashcardLabel}>Flashcard {cardIndex}</span>
                <div className={styles.dots}>
                  <span className={styles.dot}></span>
                  <span className={styles.dot}></span>
                  <span className={styles.dot}></span>
                </div>
              </div>

              <div className={styles.questionSection}>
                <h2 className={styles.question}>{currentCard.question}</h2>
              </div>

              <div className={styles.answersSection}>
                {currentCard.answers.map((answer, index) => {
                  const isSelected = selectedAnswer === answer.id;
                  const isAnswerCorrect = answer.id === correctAnswerId;
                  const isWrongSelected = showResult && isSelected && !isAnswerCorrect;
                  const letters = ['A', 'B', 'C', 'D'];

                  return (
                    <button
                      key={answer.id}
                      className={`${styles.answerOption}
                        ${isSelected ? styles.selected : ''}
                        ${showResult && isAnswerCorrect ? styles.correct : ''}
                        ${isWrongSelected ? styles.wrong : ''}`}
                      onClick={() => handleSelectAnswer(answer.id)}
                      disabled={showResult}
                    >
                      <span className={styles.answerLetter}>{letters[index]}.</span>
                      {answer.text}
                    </button>
                  );
                })}
              </div>

              {showResult && (
                <div className={`${styles.resultSection} ${isCorrect ? styles.correctResult : styles.wrongResult}`}>
                  <div className={styles.resultHeader}>
                    <span className={styles.resultIcon}>{isCorrect ? '✅' : '❌'}</span>
                    <span className={styles.resultText}>
                      {isCorrect ? 'Correct!' : 'Incorrect'}
                    </span>
                  </div>
                  {explanation && (
                    <p className={styles.explanation}>{explanation}</p>
                  )}
                </div>
              )}

              <div className={styles.actions}>
                {!showResult ? (
                  <button
                    className={styles.submitBtn}
                    onClick={handleSubmitAnswer}
                    disabled={!selectedAnswer || isSubmitting}
                  >
                    {isSubmitting ? 'Checking...' : 'Check Answer'}
                  </button>
                ) : (
                  <button className={styles.nextBtn} onClick={handleNextCard}>
                    Next Card
                    <span>→</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.errorCard}>
            <div className={styles.errorIcon}>❓</div>
            <h2>No flashcards available</h2>
            <p>This upload doesn&apos;t have any flashcards yet.</p>
            <Link href="/dashboard" className={styles.backBtn}>
              Back to Dashboard
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
