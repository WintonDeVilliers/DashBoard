import { useEffect, useRef, useMemo } from 'react';
import styles from '../styles/RacingComponents.module.css';

export default function RacingGauge({ 
  value = 0, 
  target = 100, 
  size = 250, 
  className = '',
  showLabels = true,
  showCenter = true 
}) {
  const svgRef = useRef(null);
  const animationRef = useRef(null);

  const gaugeConfig = useMemo(() => {
    const radius = (size - 40) / 2;
    const centerX = size / 2;
    const centerY = size / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeWidth = 20;
    
    // Calculate progress percentage (max 120% for over-achievement display)
    const maxDisplay = 120;
    const progressPercent = Math.min(value / target * 100, maxDisplay);
    const progressOffset = circumference - (progressPercent / maxDisplay) * circumference * 0.75; // 75% of circle
    
    return {
      radius,
      centerX,
      centerY,
      circumference,
      strokeWidth,
      progressPercent,
      progressOffset,
      maxDisplay
    };
  }, [value, target, size]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const progressCircle = svg.querySelector(`.${styles.progressArc}`);
    if (!progressCircle) return;

    // Animate the progress arc
    if (animationRef.current) {
      animationRef.current.cancel();
    }

    animationRef.current = progressCircle.animate([
      { strokeDashoffset: gaugeConfig.circumference },
      { strokeDashoffset: gaugeConfig.progressOffset }
    ], {
      duration: 2000,
      easing: 'ease-out',
      fill: 'forwards'
    });

    return () => {
      if (animationRef.current) {
        animationRef.current.cancel();
      }
    };
  }, [gaugeConfig]);

  const getProgressColor = (percent) => {
    if (percent >= 120) return '#FF6B35'; // Superstar
    if (percent >= 100) return '#4ECDC4'; // Target achieved
    if (percent >= 80) return '#45B7D1';  // On track
    if (percent >= 60) return '#FFA07A';  // Needs boost
    return '#FF6B6B'; // Recovery mode
  };

  const progressColor = getProgressColor(gaugeConfig.progressPercent);

  return (
    <div className={`${styles.racingGauge} ${className}`} data-testid="racing-gauge">
      <svg 
        ref={svgRef}
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        className={styles.gaugeSvg}
      >
        {/* Background Arc */}
        <circle
          cx={gaugeConfig.centerX}
          cy={gaugeConfig.centerY}
          r={gaugeConfig.radius}
          fill="none"
          stroke="hsl(0, 0%, 22%)"
          strokeWidth={gaugeConfig.strokeWidth}
          strokeDasharray={`${gaugeConfig.circumference * 0.75} ${gaugeConfig.circumference}`}
          strokeDashoffset={gaugeConfig.circumference * 0.125}
          className={styles.backgroundArc}
        />
        
        {/* Progress Arc */}
        <circle
          cx={gaugeConfig.centerX}
          cy={gaugeConfig.centerY}
          r={gaugeConfig.radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={gaugeConfig.strokeWidth}
          strokeDasharray={`${gaugeConfig.circumference * 0.75} ${gaugeConfig.circumference}`}
          strokeDashoffset={gaugeConfig.circumference}
          strokeLinecap="round"
          className={styles.progressArc}
        />
        
        {/* Target Line */}
        <line
          x1={gaugeConfig.centerX + (gaugeConfig.radius - 15) * Math.cos(-Math.PI * 0.375)}
          y1={gaugeConfig.centerY + (gaugeConfig.radius - 15) * Math.sin(-Math.PI * 0.375)}
          x2={gaugeConfig.centerX + (gaugeConfig.radius + 5) * Math.cos(-Math.PI * 0.375)}
          y2={gaugeConfig.centerY + (gaugeConfig.radius + 5) * Math.sin(-Math.PI * 0.375)}
          stroke="#FF6B6B"
          strokeWidth="3"
          className={styles.targetLine}
        />
        
        {/* Gauge Labels */}
        {showLabels && (
          <g className={styles.gaugeLabels}>
            {/* 0% */}
            <text
              x={gaugeConfig.centerX + (gaugeConfig.radius + 25) * Math.cos(-Math.PI * 0.625)}
              y={gaugeConfig.centerY + (gaugeConfig.radius + 25) * Math.sin(-Math.PI * 0.625)}
              textAnchor="middle"
              className={styles.gaugeLabel}
            >
              0%
            </text>
            
            {/* 60% */}
            <text
              x={gaugeConfig.centerX + (gaugeConfig.radius + 25) * Math.cos(-Math.PI * 0.5)}
              y={gaugeConfig.centerY + (gaugeConfig.radius + 25) * Math.sin(-Math.PI * 0.5)}
              textAnchor="middle"
              className={styles.gaugeLabel}
            >
              60%
            </text>
            
            {/* 100% Target */}
            <text
              x={gaugeConfig.centerX + (gaugeConfig.radius + 25) * Math.cos(-Math.PI * 0.375)}
              y={gaugeConfig.centerY + (gaugeConfig.radius + 25) * Math.sin(-Math.PI * 0.375)}
              textAnchor="middle"
              className={`${styles.gaugeLabel} ${styles.targetLabel}`}
            >
              100%
            </text>
            
            {/* 120% */}
            <text
              x={gaugeConfig.centerX + (gaugeConfig.radius + 25) * Math.cos(-Math.PI * 0.125)}
              y={gaugeConfig.centerY + (gaugeConfig.radius + 25) * Math.sin(-Math.PI * 0.125)}
              textAnchor="middle"
              className={styles.gaugeLabel}
            >
              120%
            </text>
          </g>
        )}
      </svg>
      
      {/* Center Display */}
      {showCenter && (
        <div className={styles.gaugeCenter} data-testid="gauge-center">
          <div className={styles.gaugeValue} style={{ color: progressColor }}>
            {value.toFixed(0)}<span className={styles.gaugeUnit}>%</span>
          </div>
          <div className={styles.gaugeLabel}>Achievement Rate</div>
          <div className={styles.gaugeSubtext}>
            {gaugeConfig.progressPercent >= 100 
              ? `+${(gaugeConfig.progressPercent - 100).toFixed(0)}% over target`
              : `${(100 - gaugeConfig.progressPercent).toFixed(0)}% to target`
            }
          </div>
        </div>
      )}
    </div>
  );
}
