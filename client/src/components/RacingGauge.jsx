//RacingGauge.jsx
import { useMemo } from 'react';
import styles from '../styles/RacingGauge.module.css';

export default function RacingGauge({ 
  value = 0, 
  target = 240000000, // Default target in Rand
  size = 350, 
  className = '',
  showLabels = true,
  showCenter = true,
  isMonetary = true // Flag to show Rand values instead of percentages
}) {
  const gaugeConfig = useMemo(() => {
    // Calculate progress percentage (max 120% for over-achievement display)
    const maxDisplay = 120;
    const progressPercent = Math.min(value / target * 100, maxDisplay);
    
    return {
      progressPercent,
      maxDisplay
    };
  }, [value, target]);

  const getProgressColor = (percent) => {
    if (percent >= 100) return '#22c55e'; // Green for target achieved
    if (percent >= 80) return '#eab308';  // Yellow for on track
    if (percent >= 60) return '#f97316';  // Orange for needs boost
    return '#ef4444'; // Red for recovery mode
  };

  const progressColor = getProgressColor(gaugeConfig.progressPercent);

  // Generate milestone markers based on target
  const milestones = useMemo(() => {
    const maxValue = target * (gaugeConfig.maxDisplay / 100);
    const maxInMil = maxValue / 1000000;
    const step = maxInMil / 8;
    return Array.from({ length: 8 }, (_, i) => 
      Math.round(step * (i + 1))
    );
  }, [target, gaugeConfig.maxDisplay]);

  // Calculate needle rotation: -90deg (left) to +90deg (right)
  const needleRotation = Math.min((gaugeConfig.progressPercent / 100) * 180 - 90, 90);

  return (
    <div className={`${styles.gaugeContainer} ${className}`} data-testid="racing-gauge" style={{ width: size, height: size * 0.57 }}>
      {/* Semi-circular speedometer background */}
      <div 
        className={styles.backgroundHalfRound} 
        style={{ 
          width: size, 
          height: size * 0.5,
          borderRadius: `${size}px ${size}px 0 0`,
          border: `${size * 0.033}px solid #f8f8f8`
        }}
      >
        {/* Milestone markers */}
        {showLabels && milestones.map((milestone, index) => {
          const milestonePercent = (milestone / (target / 1000000)) * 100;
          const angle = (milestonePercent / 100) * 180 - 90; // Convert to degrees (-90 to 90)
          const isTarget = milestone === Math.round(target / 1000000);
          
          return (
            <div
              key={milestone}
              className={styles.milestoneMarker}
              style={{
                position: 'absolute',
                bottom: '0',
                left: '50%',
                transformOrigin: 'bottom center',
                transform: `translateX(-50%) rotate(${angle}deg)`,
                width: isTarget ? '4px' : '2px',
                height: size * 0.12,
                backgroundColor: isTarget ? '#ef4444' : '#666',
                opacity: 0.8,
                zIndex: 2
              }}
            />
          );
        })}

        {/* Triangular needle pointer */}
        <div 
          className={styles.pointer} 
          style={{ 
            transform: `translateX(-50%) rotate(${needleRotation}deg)`,
            borderTopWidth: size * 0.32,
            borderLeftWidth: size * 0.015,
            borderRightWidth: size * 0.015,
            borderTopColor: progressColor
          }}
        />
      </div>

      {/* Center display */}
      {showCenter && (
        <div className={styles.centerLabel}>
          <span className={styles.currentValue} style={{ color: progressColor }}>
            {isMonetary 
              ? `R${(value / 1000000).toFixed(1)}M`
              : `${gaugeConfig.progressPercent.toFixed(0)}%`
            }
          </span>
          <span className={styles.maxValue}>
            {isMonetary 
              ? `/R${(target / 1000000).toFixed(0)}M`
              : '/100%'
            }
          </span>
        </div>
      )}
    </div>
  );
}