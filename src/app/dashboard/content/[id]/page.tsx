'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Sparkles,
  Target,
  Brain,
  ChevronRight,
  Trash2,
  Play,
  FileText,
  Clock,
  Coins,
  ArrowLeft,
  RotateCw,
  Check,
  Lightbulb
} from 'lucide-react';
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
  const [activeFlashcard, setActiveFlashcard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  }, [uploadId]);

  useEffect(() => {
    if (uploadId) {
      fetchData();
    }
  }, [uploadId, fetchData]);

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
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleNextFlashcard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setActiveFlashcard((prev) => (prev + 1) % flashcards.length);
    }, 200);
  };

  const handleFlipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const getCorrectAnswer = (flashcard: Flashcard) => {
    const correctAnswer = flashcard.answers?.find(a => a.isCorrect);
    return correctAnswer?.text || 'No answer available';
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <motion.div
            className={styles.spinner}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p>Loading content...</p>
        </div>
      </div>
    );
  }

  if (notFound || !upload) {
    return (
      <div className={styles.container}>
        <motion.div
          className={styles.notFound}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.notFoundIcon}>
            <FileText size={64} />
          </div>
          <h2 className={styles.notFoundTitle}>Content Not Found</h2>
          <p className={styles.notFoundText}>
            The content you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <Link href="/dashboard/content" className={styles.notFoundBtn}>
            <ArrowLeft size={18} />
            Back to Content
          </Link>
        </motion.div>
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
        <ArrowLeft size={18} /> Back to Content
      </Link>

      {/* Header */}
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.headerTop}>
          <h1 className={styles.title}>{upload.title || 'Untitled'}</h1>
          <span className={`${styles.statusBadge} ${styles[upload.status.toLowerCase()]}`}>
            {upload.status}
          </span>
        </div>
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <Clock size={16} />
            {formatDate(upload.createdAt)}
          </span>
          <span className={styles.metaItem}>
            <Coins size={16} />
            {upload.broinsCost} Broins
          </span>
          {isCompleted && (
            <span className={styles.metaItem}>
              <Brain size={16} />
              {upload.flashcardCount} Flashcards
            </span>
          )}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        className={styles.actions}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {isCompleted && (
          <Link href={`/practice/${uploadId}`} className={`${styles.actionBtn} ${styles.primary}`}>
            <Play size={18} />
            Start Practice
          </Link>
        )}
        <button onClick={handleDelete} className={`${styles.actionBtn} ${styles.danger}`}>
          <Trash2 size={18} />
          Delete
        </button>
      </motion.div>

      {/* Error State */}
      {isFailed && (
        <motion.div
          className={styles.errorState}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className={styles.errorTitle}>Processing Failed</div>
          <p className={styles.errorText}>
            {upload.summary || 'There was an error processing your content. Please try uploading again.'}
          </p>
        </motion.div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <motion.div
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.processingState}>
            <motion.div
              className={styles.processingIcon}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles size={48} />
            </motion.div>
            <h3 className={styles.processingTitle}>Processing Your Content</h3>
            <p className={styles.processingText}>
              Our AI is analyzing your content and generating a summary, key points, and flashcards.
              This usually takes less than a minute.
            </p>
          </div>
        </motion.div>
      )}

      {/* Summary Section - Redesigned */}
      {isCompleted && upload.summary && (
        <motion.div
          className={styles.summarySection}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className={styles.summaryGlow} />
          <div className={styles.summaryContent}>
            <div className={styles.summaryHeader}>
              <div className={styles.summaryIconWrapper}>
                <BookOpen size={24} />
              </div>
              <div>
                <h2 className={styles.summaryTitle}>Summary</h2>
                <p className={styles.summarySubtitle}>AI-generated overview of your content</p>
              </div>
            </div>
            <motion.div
              className={styles.summaryTextWrapper}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className={styles.summaryText}>{upload.summary}</p>
            </motion.div>
            <div className={styles.summaryStats}>
              <div className={styles.summaryStat}>
                <span className={styles.summaryStatValue}>{upload.summary.split(' ').length}</span>
                <span className={styles.summaryStatLabel}>Words</span>
              </div>
              <div className={styles.summaryStatDivider} />
              <div className={styles.summaryStat}>
                <span className={styles.summaryStatValue}>{upload.summary.split('.').length - 1}</span>
                <span className={styles.summaryStatLabel}>Key Sentences</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Key Points Section - Redesigned */}
      {isCompleted && upload.keyPoints && upload.keyPoints.length > 0 && (
        <motion.div
          className={styles.keyPointsSection}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className={styles.keyPointsHeader}>
            <div className={styles.keyPointsIconWrapper}>
              <Target size={24} />
            </div>
            <div>
              <h2 className={styles.keyPointsTitle}>Key Points</h2>
              <p className={styles.keyPointsSubtitle}>{upload.keyPoints.length} essential takeaways</p>
            </div>
          </div>
          <div className={styles.keyPointsGrid}>
            {upload.keyPoints.map((point, index) => (
              <motion.div
                key={index}
                className={styles.keyPointCard}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.02, x: 8 }}
              >
                <div className={styles.keyPointNumber}>
                  <span>{index + 1}</span>
                </div>
                <div className={styles.keyPointContent}>
                  <p>{point}</p>
                </div>
                <div className={styles.keyPointAccent} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Flashcards Preview - Interactive Design */}
      {isCompleted && flashcards.length > 0 && (
        <motion.div
          className={styles.flashcardsSection}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className={styles.flashcardsHeader}>
            <div className={styles.flashcardsHeaderLeft}>
              <div className={styles.flashcardsIconWrapper}>
                <Brain size={24} />
              </div>
              <div>
                <h2 className={styles.flashcardsTitle}>Flashcards</h2>
                <p className={styles.flashcardsSubtitle}>
                  {flashcards.length} cards to master your knowledge
                </p>
              </div>
            </div>
            <div className={styles.flashcardsProgress}>
              <span className={styles.progressLabel}>Preview</span>
              <span className={styles.progressCount}>
                {activeFlashcard + 1} / {Math.min(flashcards.length, 4)}
              </span>
            </div>
          </div>

          {/* Interactive Flashcard */}
          <div className={styles.flashcardContainer}>
            <div className={styles.flashcardWrapper}>
              <motion.div
                className={styles.flashcard}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                onClick={handleFlipCard}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front Side */}
                <motion.div
                  className={styles.flashcardFront}
                  animate={!isFlipped ? { y: [0, -5, 0] } : {}}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className={styles.flashcardCorner} />
                  <div className={styles.flashcardCorner} />
                  <div className={styles.flashcardCorner} />
                  <div className={styles.flashcardCorner} />

                  <div className={styles.flashcardBadge}>
                    <Lightbulb size={14} />
                    Question {activeFlashcard + 1}
                  </div>
                  <p className={styles.flashcardQuestion}>
                    {flashcards[activeFlashcard]?.question}
                  </p>
                  <div className={styles.flashcardHint}>
                    <RotateCw size={14} />
                    Click to reveal answer
                  </div>
                </motion.div>

                {/* Back Side */}
                <div className={styles.flashcardBack}>
                  <div className={styles.flashcardBackIcon}>
                    <Check size={28} />
                  </div>
                  <h4 className={styles.flashcardAnswerLabel}>Answer</h4>
                  <p className={styles.flashcardAnswer}>
                    {flashcards[activeFlashcard] && getCorrectAnswer(flashcards[activeFlashcard])}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Card Navigation Dots */}
            <div className={styles.flashcardNav}>
              {flashcards.slice(0, 4).map((_, index) => (
                <button
                  key={index}
                  className={`${styles.navDot} ${activeFlashcard === index ? styles.active : ''}`}
                  onClick={() => {
                    setIsFlipped(false);
                    setActiveFlashcard(index);
                  }}
                />
              ))}
            </div>

            {/* Next Button */}
            {flashcards.length > 1 && (
              <motion.button
                className={styles.nextCardBtn}
                onClick={handleNextFlashcard}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Next Card
                <ChevronRight size={18} />
              </motion.button>
            )}
          </div>

          {/* Practice CTA */}
          <motion.div
            className={styles.practiceCtaCard}
            whileHover={{ scale: 1.01 }}
          >
            <div className={styles.practiceCtaContent}>
              <Sparkles className={styles.practiceCtaIcon} size={32} />
              <div>
                <h3 className={styles.practiceCtaTitle}>Ready to master this content?</h3>
                <p className={styles.practiceCtaText}>
                  Start a practice session with all {flashcards.length} flashcards
                </p>
              </div>
            </div>
            <Link href={`/practice/${uploadId}`} className={styles.practiceCtaBtn}>
              <Play size={18} />
              Start Practice
            </Link>
          </motion.div>
        </motion.div>
      )}

      {/* Original Content */}
      <motion.div
        className={styles.section}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIconWrapper}>
            <FileText size={20} />
          </div>
          <h2 className={styles.sectionTitle}>Original Content</h2>
        </div>
        <div className={styles.originalContent}>
          {upload.content || upload.contentPreview || 'Content not available'}
        </div>
      </motion.div>
    </div>
  );
}
