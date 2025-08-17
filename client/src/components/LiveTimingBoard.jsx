import styles from '../styles/RacingComponents.module.css';

export default function LiveTimingBoard({ teams = [], circuit = 'monaco' }) {
  if (!teams || teams.length === 0) {
    return (
      <div className={styles.noTimingData}>
        <p>No timing data available</p>
      </div>
    );
  }

  const calculateLapProgress = (team) => {
    // Calculate current lap based on achievement rate
    // Each "lap" represents a milestone in sales achievement
    const totalLaps = 31; // Days in month
    const progressInLaps = (team.team_achievement_rate / 100) * totalLaps;
    const currentLap = Math.floor(progressInLaps);
    const lapProgress = progressInLaps - currentLap;
    
    return {
      currentLap: Math.min(currentLap, totalLaps),
      totalLaps,
      progress: lapProgress * 100
    };
  };

  const getGapToTarget = (team) => {
    const gap = team.total_sales - team.team_target;
    const gapInM = gap / 1000000;
    return gap >= 0 ? `+${gapInM.toFixed(1)}M` : `${gapInM.toFixed(1)}M`;
  };

  return (
    <div className={styles.timingBoard} data-testid={`timing-board-${circuit}`}>
      <div className={styles.timingList}>
        {teams.slice(0, 10).map((team, index) => {
          const lapInfo = calculateLapProgress(team);
          const gap = getGapToTarget(team);
          
          return (
            <div 
              key={team.id}
              className={`${styles.timingItem} ${styles.timingItemHover}`}
              data-testid={`timing-item-${team.id}`}
            >
              <div className={styles.timingLeft}>
                <div className={styles.timingPosition}>
                  <span 
                    className={styles.positionNumber}
                    style={{ color: team.performance_color }}
                  >
                    {index + 1}
                  </span>
                  <span className={styles.vehicleIcon} style={{transform: 'scaleX(-1)'}}>🏎️</span>
                </div>
                
                <div className={styles.driverInfo}>
                  <div className={styles.driverName} data-testid={`driver-name-${team.id}`}>
                    {team.supervisor_name}
                  </div>
                  <div className={styles.lapInfo} data-testid={`lap-info-${team.id}`}>
                    Lap {lapInfo.currentLap}/{lapInfo.totalLaps}
                  </div>
                </div>
              </div>
              
              <div className={styles.timingRight}>
                <div 
                  className={styles.achievementRate}
                  style={{ color: team.performance_color }}
                  data-testid={`achievement-rate-${team.id}`}
                >
                  {team.team_achievement_rate.toFixed(1)}%
                </div>
                <div 
                  className={`${styles.gapToTarget} ${gap.startsWith('+') ? styles.positive : styles.negative}`}
                  data-testid={`gap-to-target-${team.id}`}
                >
                  {gap}
                </div>
              </div>
              
              {/* Progress bar for current lap */}
              <div className={styles.lapProgressBar}>
                <div 
                  className={styles.lapProgress}
                  style={{ 
                    width: `${lapInfo.progress}%`,
                    backgroundColor: team.performance_color
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
      
      {teams.length === 0 && (
        <div className={styles.noDrivers}>
          <p>No drivers available for {circuit}</p>
        </div>
      )}
    </div>
  );
}
