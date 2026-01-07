'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { uploadService } from '@/services';
import {
  ArrowLeft,
  Type,
  Sparkles,
  FileText,
  ListChecks,
  Layers,
  Cpu,
  CheckCircle
} from 'lucide-react';
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
  const progressPercent = Math.min((charCount / 2000) * 100, 100);

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
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <CheckCircle size={64} />
          </div>
          <h2 className={styles.successTitle}>Content Uploaded!</h2>
          <p className={styles.successText}>
            Your content is being processed. We're generating a summary, key points, and flashcards for you.
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
                    placeholder="Paste your notes, article, or essay here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={12}
                  />
                  <div className={styles.progressRow}>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                    <span className={styles.charCount}>
                      {charCount.toLocaleString()} / 2,000
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isLoading || !isValidLength}
              >
                <Sparkles size={18} />
                {isLoading ? 'Processing...' : 'Generate Summary & Flashcards'}
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
