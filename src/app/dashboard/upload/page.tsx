'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { uploadService } from '@/services';
import styles from './upload.module.css';

export default function UploadPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedId, setUploadedId] = useState<string | null>(null);

  const charCount = content.length;
  const isValidLength = charCount >= 200 && charCount <= 2000;
  const estimatedCost = charCount > 0 ? 5 + Math.ceil(charCount / 500) * 5 : 0;

  const getCharCountClass = () => {
    if (charCount === 0) return '';
    if (charCount < 200) return styles.invalid;
    if (charCount > 2000) return styles.invalid;
    return styles.valid;
  };

  const getTextareaClass = () => {
    if (charCount === 0) return styles.textarea;
    if (!isValidLength) return `${styles.textarea} ${styles.invalid}`;
    return `${styles.textarea} ${styles.valid}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidLength) {
      setError('Content must be between 200 and 2,000 characters');
      return;
    }

    setIsLoading(true);

    try {
      const result = await uploadService.createUpload({
        content,
        title: title || undefined
      });
      setUploadedId(result.id);
      setUploadSuccess(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process content. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (uploadSuccess) {
    return (
      <div className={styles.container}>
        <div className={styles.uploadCard}>
          <div className={styles.successContainer}>
            <div className={styles.successIcon}>🎉</div>
            <h2 className={styles.successTitle}>Content Uploaded!</h2>
            <p className={styles.successText}>
              Your content is being processed. We&apos;re generating a summary, key points, and flashcards for you.
            </p>
            <Link href={`/dashboard/content/${uploadedId}`} className={styles.successBtn}>
              View Content
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/dashboard" className={styles.backLink}>
          <span>←</span> Back to Dashboard
        </Link>
        <h1 className={styles.title}>Upload Content</h1>
        <p className={styles.subtitle}>
          Paste your text and let AI break it down into summaries, key points, and flashcards.
        </p>
      </div>

      <div className={styles.uploadCard}>
        <div className={styles.infoBox}>
          <div className={styles.infoTitle}>
            <span>💡</span>
            How it works
          </div>
          <p className={styles.infoText}>
            Paste any text (200-2,000 characters) and our AI will analyze it to generate a clear summary,
            extract the most important key points, and create interactive flashcards to help you learn and remember.
          </p>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Title <span className={styles.labelOptional}>(optional)</span>
            </label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g., Biology Chapter 5, History Notes..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Content</label>
            <textarea
              className={getTextareaClass()}
              placeholder="Paste your study material, article, or notes here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
            />
            <div className={styles.contentMeta}>
              <span className={`${styles.charCount} ${getCharCountClass()}`}>
                {charCount.toLocaleString()} / 2,000 characters
                {charCount > 0 && charCount < 200 && ` (${200 - charCount} more needed)`}
                {charCount > 2000 && ` (${charCount - 2000} over limit)`}
              </span>
              {charCount > 0 && (
                <span className={styles.costEstimate}>
                  <Image src="/images/broin-coin.png" alt="Broins" width={18} height={18} />
                  Cost: {estimatedCost} Broins
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading || !isValidLength}
          >
            {isLoading ? (
              'Processing...'
            ) : (
              <>
                Generate Summary & Flashcards
                <span>→</span>
              </>
            )}
          </button>
        </form>

        <div className={styles.whatYouGet}>
          <h3 className={styles.whatYouGetTitle}>What you&apos;ll get:</h3>
          <div className={styles.featureList}>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>📋</span>
              <span className={styles.featureLabel}>Clear Summary</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>🎯</span>
              <span className={styles.featureLabel}>Key Points</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>🧠</span>
              <span className={styles.featureLabel}>Flashcards</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
