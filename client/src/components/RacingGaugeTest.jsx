// RacingGaugeTest.jsx
import React from 'react';
import styles from '../styles/RacingGauge.module.css';

const RacingGaugeTest = ({ value, max = 240 }) => {
  const rotation = Math.min((value / max) * 180 - 90, 90);

  return (
    <div className={styles.gaugeContainer}>
      <div className={styles.backgroundHalfRound}>
        {/* Removed milestone indicators */}
        <div 
          className={styles.pointer} 
          style={{ transform: `rotate(${rotation}deg)` }}
        />
      </div>

      <div className={styles.centerLabel}>
        <span className={styles.currentValue}>{value.toFixed(1)}</span>
        <span className={styles.maxValue}>/{max}</span>
      </div>
    </div>
  );
};

export default RacingGaugeTest;