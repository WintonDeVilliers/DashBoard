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
        
        {/* Milestone Markers and Labels */}
        {showLabels && ([20, 40, 60, 80, 100, 120].map((milestone) => {
          const angle = -Math.PI * 0.625 + (milestone / 120) * (Math.PI * 0.75);
          const markerX1 = gaugeConfig.centerX + (gaugeConfig.radius - 10) * Math.cos(angle);
          const markerY1 = gaugeConfig.centerY + (gaugeConfig.radius - 10) * Math.sin(angle);
          const markerX2 = gaugeConfig.centerX + (gaugeConfig.radius + 5) * Math.cos(angle);
          const markerY2 = gaugeConfig.centerY + (gaugeConfig.radius + 5) * Math.sin(angle);
          const labelX = gaugeConfig.centerX + (gaugeConfig.radius + 20) * Math.cos(angle);
          const labelY = gaugeConfig.centerY + (gaugeConfig.radius + 20) * Math.sin(angle);
          
          const isTarget = milestone === 100;
          const color = isTarget ? '#FF6B6B' : '#6B7280';
          
          return (
            <g key={milestone}>
              <line
                x1={markerX1}
                y1={markerY1}
                x2={markerX2}
                y2={markerY2}
                stroke={color}
                strokeWidth={isTarget ? 3 : 2}
                opacity={isTarget ? 1 : 0.6}
              />
              <text
                x={labelX}
                y={labelY}
                fill={color}
                fontSize="12"
                textAnchor="middle"
                dominantBaseline="middle"
                className={isTarget ? styles.targetLabel : styles.gaugeLabel}
              >
                {milestone}%
              </text>
            </g>
          );
        }))}
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