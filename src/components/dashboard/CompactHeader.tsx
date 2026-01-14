'use client';

import { useState } from 'react';
import { Star, Gift, Loader2, CheckCircle2 } from 'lucide-react';
import styles from './CompactHeader.module.css';

interface CompactHeaderProps {
  level: number;
  experience: number;
  experienceToNextLevel: number;
  totalExperienceForNextLevel: number;
  progressPercent: number;
  dailyBonusClaimed: boolean;
  dailyBonusAmount: number;
  onClaimDailyBonus: () => Promise<void>;
}

export default function CompactHeader({
  level,
  experience,
  experienceToNextLevel,
  totalExperienceForNextLevel,
  progressPercent,
  dailyBonusClaimed,
  dailyBonusAmount,
  onClaimDailyBonus,
}: CompactHeaderProps) {
  const [isClaiming, setIsClaiming] = useState(false);

  const handleClaim = async () => {
    if (dailyBonusClaimed || isClaiming) return;
    setIsClaiming(true);
    try {
      await onClaimDailyBonus();
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className={styles.compactHeader}>
      {/* Top Row - Level & Daily Bonus */}
      <div className={styles.topRow}>
        {/* Level Badge */}
        <div className={styles.levelBadge}>
          <div className={styles.levelIcon}>
            <Star size={16} />
          </div>
          <span className={styles.levelText}>Level {level}</span>
        </div>

        {/* Daily Bonus Button */}
        <button
          className={`${styles.dailyBonusBtn} ${dailyBonusClaimed ? styles.claimed : ''}`}
          onClick={handleClaim}
          disabled={dailyBonusClaimed || isClaiming}
        >
          {isClaiming ? (
            <>
              <Loader2 size={18} className={styles.spinner} />
              <span>Claiming...</span>
            </>
          ) : dailyBonusClaimed ? (
            <>
              <CheckCircle2 size={18} />
              <span>Claimed!</span>
            </>
          ) : (
            <>
              <Gift size={18} />
              <span>+{dailyBonusAmount} Daily</span>
            </>
          )}
        </button>
      </div>

      {/* XP Progress */}
      <div className={styles.xpSection}>
        <div className={styles.xpInfo}>
          <span className={styles.xpLabel}>XP Progress</span>
          <span className={styles.xpValues}>
            {experience.toLocaleString()} / {totalExperienceForNextLevel.toLocaleString()}
          </span>
        </div>
        <div className={styles.xpBarWrapper}>
          <div className={styles.xpBar}>
            <div
              className={styles.xpFill}
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            ></div>
          </div>
          <span className={styles.xpRemaining}>
            {experienceToNextLevel.toLocaleString()} XP to Level {level + 1}
          </span>
        </div>
      </div>
    </div>
  );
}
