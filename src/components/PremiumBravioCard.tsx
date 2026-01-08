'use client';

import React from 'react';
import styles from './PremiumBravioCard.module.css';

interface PremiumBravioCardProps {
  balance: number;
}

const PremiumBravioCard: React.FC<PremiumBravioCardProps> = ({ balance }) => {
  const formattedBalance = balance.toLocaleString();
  const usdValue = (balance / 200).toFixed(2);

  return (
    <div className={styles.wrapper}>
      <div className={styles.perspectiveWrapper}>
        {/* External glow */}
        <div className={styles.externalGlow}></div>

        {/* Main card */}
        <div className={styles.card}>
          {/* Internal texture & sheen */}
          <div className={styles.internalFinishing}>
            <div className={styles.noise}></div>
            <div className={styles.sheen}></div>
          </div>

          {/* 3D rim lighting */}
          <div className={styles.rimLight}></div>

          {/* Content */}
          <div className={styles.content}>
            {/* Chip */}
            <div className={styles.header}>
              <div className={styles.chip}>
                <div className={styles.chipGrid}>
                  <div className={styles.chipCell}></div>
                  <div className={styles.chipCell}></div>
                  <div className={styles.chipCell}></div>
                  <div className={styles.chipCell}></div>
                  <div className={styles.chipCell}></div>
                  <div className={styles.chipCell}></div>
                </div>
              </div>
            </div>

            {/* Balance */}
            <div className={styles.balanceSection}>
              <h1 className={styles.balanceAmount}>{formattedBalance}</h1>
              <span className={styles.balanceCurrency}>Broins</span>
            </div>

            {/* Footer */}
            <div className={styles.footer}>
              <div className={styles.usdSection}>
                <p className={styles.usdLabel}>Estimated Value</p>
                <p className={styles.usdValue}>
                  ${usdValue} <span className={styles.usdUnit}>USD</span>
                </p>
              </div>

              <div className={styles.logo}>
                <span>B</span>
              </div>
            </div>
          </div>

          {/* Vignette */}
          <div className={styles.vignette}></div>
        </div>
      </div>
    </div>
  );
};

export default PremiumBravioCard;
