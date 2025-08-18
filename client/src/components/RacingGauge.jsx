import { useEffect, useRef, useMemo } from 'react';
import styles from '../styles/RacingComponents.module.css';

export default function RacingGauge({ 
  value = 0, 
  target = 240000000, // Default target in Rand
  size = 350, 
  className = '',
  showLabels = true,
  showCenter = true,
  isMonetary = true // Flag to show Rand values instead of percentages
}) {
  const svgRef = useRef(null);
  const animationRef = useRef(null);

  const gaugeConfig = useMemo(() => {
    const radius = (size - 80) / 2;
    const centerX = size / 2;
    const centerY = size - 60; // Position center lower for semi-circle
    const strokeWidth = 40;
    
    // Calculate progress percentage (max 120% for over-achievement display)
    const maxDisplay = 120;
    const progressPercent = Math.min(value / target * 100, maxDisplay);
    
    // Speedometer spans from 180 degrees to 0 degrees (bottom half circle)
    const startAngle = Math.PI; // Start from left (180 degrees)
    const endAngle = 0; // End at right (0 degrees)  
    const totalAngle = Math.PI; // 180 degrees total
    const progressAngle = startAngle - (progressPercent / 100) * totalAngle;
    
    return {
      radius,
      centerX,
      centerY,
      strokeWidth,
      progressPercent,
      startAngle,
      endAngle,
      totalAngle,
      progressAngle,
      maxDisplay
    };
  }, [value, target, size]);

  const getProgressColor = (percent) => {
    if (percent >= 100) return '#22c55e'; // Green for target achieved
    if (percent >= 80) return '#eab308';  // Yellow for on track
    if (percent >= 60) return '#f97316';  // Orange for needs boost
    return '#ef4444'; // Red for recovery mode
  };

  const progressColor = getProgressColor(gaugeConfig.progressPercent);

  // Create SVG path for semi-circle arc
  const createArcPath = (centerX, centerY, radius, startAngle, endAngle) => {
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";
    
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  };

  // Create speedometer sections with colors
  const speedometerSections = [
    { start: 180, end: 144, color: '#ef4444', label: '30M' }, // Red: 0-30M (left side)
    { start: 144, end: 108, color: '#f97316', label: '70M' }, // Orange: 30-70M
    { start: 108, end: 72, color: '#eab308', label: '90M' },  // Yellow: 70-90M
    { start: 72, end: 36, color: '#84cc16', label: '110M' },  // Light Green: 90-110M
    { start: 36, end: 0, color: '#22c55e', label: '240M' }    // Green: 110M+ (right side)
  ];

  // Generate milestone markers
  const milestones = [30, 50, 70, 90, 110, 130, 160, 190, 210, 240];

  return (
    <div className={`${styles.racingGauge} ${className}`} data-testid="racing-gauge">
      <svg 
        ref={svgRef}
        width={size} 
        height={size * 0.7} // Make height smaller for semi-circle
        viewBox={`0 0 ${size} ${size * 0.7}`}
        className={styles.gaugeSvg}
      >
        {/* Background Arc - Gray outer ring */}
        <path
          d={createArcPath(gaugeConfig.centerX, gaugeConfig.centerY, gaugeConfig.radius, gaugeConfig.startAngle, gaugeConfig.endAngle)}
          fill="none"
          stroke="#374151"
          strokeWidth={gaugeConfig.strokeWidth + 20}
          strokeLinecap="round"
          className={styles.backgroundArc}
        />
        
        {/* Colored sections */}
        {speedometerSections.map((section, index) => {
          const sectionStartAngle = (section.start * Math.PI) / 180;
          const sectionEndAngle = (section.end * Math.PI) / 180;
          
          return (
            <path
              key={index}
              d={createArcPath(gaugeConfig.centerX, gaugeConfig.centerY, gaugeConfig.radius, sectionStartAngle, sectionEndAngle)}
              fill="none"
              stroke={section.color}
              strokeWidth={gaugeConfig.strokeWidth}
              strokeLinecap="round"
              className={styles.sectionArc}
            />
          );
        })}
        
        {/* Progress Needle */}
        <g className={styles.needle}>
          <line
            x1={gaugeConfig.centerX}
            y1={gaugeConfig.centerY}
            x2={gaugeConfig.centerX + (gaugeConfig.radius - 20) * Math.cos(gaugeConfig.progressAngle)}
            y2={gaugeConfig.centerY + (gaugeConfig.radius - 20) * Math.sin(gaugeConfig.progressAngle)}
            stroke="#1f2937"
            strokeWidth="4"
            strokeLinecap="round"
            className={styles.needleLine}
          />
          
          {/* Needle center dot */}
          <circle
            cx={gaugeConfig.centerX}
            cy={gaugeConfig.centerY}
            r="8"
            fill="#1f2937"
            className={styles.needleCenter}
          />
        </g>
        
        {/* Milestone markers and labels */}
        {showLabels && milestones.map((milestone) => {
          const milestonePercent = (milestone / 240) * 100;
          const angle = gaugeConfig.startAngle - (milestonePercent / 100) * gaugeConfig.totalAngle;
          
          // Marker line
          const markerInnerX = gaugeConfig.centerX + (gaugeConfig.radius - 35) * Math.cos(angle);
          const markerInnerY = gaugeConfig.centerY + (gaugeConfig.radius - 35) * Math.sin(angle);
          const markerOuterX = gaugeConfig.centerX + (gaugeConfig.radius - 15) * Math.cos(angle);
          const markerOuterY = gaugeConfig.centerY + (gaugeConfig.radius - 15) * Math.sin(angle);
          
          // Label position - adjust for better visibility
          const labelRadius = gaugeConfig.radius + 35;
          const labelX = gaugeConfig.centerX + labelRadius * Math.cos(angle);
          const labelY = gaugeConfig.centerY + labelRadius * Math.sin(angle);
          
          const isTarget = milestone === 240;
          const color = isTarget ? '#ef4444' : '#e5e7eb';
          
          return (
            <g key={milestone}>
              <line
                x1={markerInnerX}
                y1={markerInnerY}
                x2={markerOuterX}
                y2={markerOuterY}
                stroke={color}
                strokeWidth={isTarget ? "3" : "2"}
                className={styles.milestoneMarker}
              />
              {/* Background circle for label visibility */}
              <circle
                cx={labelX}
                cy={labelY}
                r="14"
                fill="rgba(0, 0, 0, 0.7)"
                className={styles.labelBackground}
              />
              <text
                x={labelX}
                y={labelY}
                fill={color}
                fontSize="11"
                fontWeight={isTarget ? "bold" : "normal"}
                textAnchor="middle"
                dominantBaseline="middle"
                className={isTarget ? styles.targetLabel : styles.gaugeLabel}
              >
                {milestone}M
              </text>
            </g>
          );
        })}
      </svg>
      
      {/* Center Display */}
      {showCenter && (
        <div className={styles.gaugeCenter} data-testid="gauge-center">
          <div className={styles.gaugeValue} style={{ color: progressColor }}>
            {isMonetary 
              ? `R${(value / 1000000).toFixed(1)}M`
              : `${value.toFixed(0)}%`
            }
          </div>
          <div className={styles.gaugeLabel}>
            {isMonetary ? 'Total Sales' : 'Achievement Rate'}
          </div>
          <div className={styles.gaugeSubtext}>
            {isMonetary 
              ? `Target: R${(target / 1000000).toFixed(0)}M`
              : gaugeConfig.progressPercent >= 100 
                ? `+${(gaugeConfig.progressPercent - 100).toFixed(0)}% over target`
                : `${(100 - gaugeConfig.progressPercent).toFixed(0)}% to target`
            }
          </div>
        </div>
      )}
    </div>
  );
}