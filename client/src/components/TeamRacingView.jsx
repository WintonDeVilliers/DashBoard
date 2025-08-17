import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LiveTimingBoard from './LiveTimingBoard';
import styles from '../styles/RacingComponents.module.css';

export default function TeamRacingView({ teamData, companyMetrics }) {
  const sortedTeams = useMemo(() => {
    if (!teamData) return [];
    return [...teamData].sort((a, b) => b.team_achievement_rate - a.team_achievement_rate);
  }, [teamData]);

  const topTeams = useMemo(() => {
    return sortedTeams.slice(0, 10);
  }, [sortedTeams]);

  if (!teamData || teamData.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2>No Team Data Available</h2>
        <p>Upload sales data to view team racing championship</p>
      </div>
    );
  }

  return (
    <section className={styles.teamRacingView}>
      <div className={styles.container}>
        {/* Hero Section */}
        <div className={styles.hero}>
          <h2 className={styles.heroTitle}>TEAM RACING CHAMPIONSHIP</h2>
          <p className={styles.heroSubtitle}>
            Supervisor performance in our high-speed sales competition
          </p>
        </div>

        {/* Racing Track View */}
        <Card className={styles.racingTrackCard}>
          <CardHeader className={styles.trackHeader}>
            <CardTitle>Live Racing Positions</CardTitle>
            <div className={styles.liveIndicator}>
              <div className={styles.liveDot}></div>
              <span>Live Timing</span>
            </div>
          </CardHeader>
          
          <CardContent className={styles.trackContent}>
            <div className={styles.racingTrack} data-testid="racing-track">
              {topTeams.map((team, index) => (
                <div key={team.id} className={styles.trackLane} data-testid={`track-lane-${index}`}>
                  {/* Track Lane */}
                  <div className={styles.laneBackground}>
                    <div className={styles.startLine}></div>
                    <div className={styles.finishLine}></div>
                    <div className={styles.performanceGradient}></div>
                    
                    {/* Car Position */}
                    <div 
                      className={styles.carPosition}
                      style={{ 
                        left: `${Math.min(team.track_position, 100)}%`,
                        animationDelay: `${index * 0.2}s`
                      }}
                      data-testid={`car-position-${team.id}`}
                    >
                      <div className={styles.carContainer}>
                        <span className={styles.carEmoji}>{team.vehicle_type}</span>
                        <div 
                          className={styles.achievementBadge}
                          style={{ backgroundColor: team.performance_color }}
                        >
                          {team.team_achievement_rate.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Team Info */}
                  <div className={styles.teamInfo} data-testid={`team-info-${team.id}`}>
                    <div className={styles.teamDetails}>
                      <span 
                        className={styles.position}
                        style={{ color: team.performance_color }}
                      >
                        {index + 1}.
                      </span>
                      <div className={styles.teamData}>
                        <div className={styles.teamName}>{team.supervisor_name}</div>
                        <div className={styles.teamMeta}>
                          Team Size: {team.team_size} | Avg: {team.avg_performance.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div className={styles.salesData}>
                      <div className={styles.totalSales}>
                        R{(team.total_sales / 1000000).toFixed(1)}M
                      </div>
                      <div className={styles.target}>
                        Target: R{(team.team_target / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Finish Line */}
              <div className={styles.finishLineSection}>
                <div className={styles.finishLineText}>
                  <span>🏁</span>
                  <span>FINISH LINE - 100% TARGET</span>
                  <span>🏁</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Complete Championship Standings */}
        <Card className={styles.leaderboardCard}>
          <CardHeader className={styles.leaderboardHeader}>
            <CardTitle>Complete Championship Standings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.leaderboardTable} data-testid="championship-standings">
              <div className={styles.tableHeader}>
                <div className={styles.headerCell}>Position</div>
                <div className={styles.headerCell}>Driver (Supervisor)</div>
                <div className={styles.headerCell}>Team Size</div>
                <div className={styles.headerCell}>Achievement</div>
                <div className={styles.headerCell}>Sales</div>
                <div className={styles.headerCell}>Target</div>
                <div className={styles.headerCell}>Vehicle</div>
              </div>
              
              <div className={styles.tableBody}>
                {sortedTeams.map((team, index) => (
                  <div 
                    key={team.id} 
                    className={styles.tableRow}
                    data-testid={`leaderboard-row-${team.id}`}
                  >
                    <div className={styles.tableCell}>
                      <div className={styles.positionContainer}>
                        <span 
                          className={styles.positionNumber}
                          style={{ color: team.performance_color }}
                        >
                          {index + 1}
                        </span>
                        {index < 3 && <span className={styles.positionChange}>🏆</span>}
                      </div>
                    </div>
                    <div className={styles.tableCell}>
                      <div className={styles.driverInfo}>
                        <div className={styles.driverName}>{team.supervisor_name}</div>
                        <div className={styles.circuitName}>
                          {team.circuit === 'monaco' ? 'Monaco Circuit' : 'Kyalami Circuit'}
                        </div>
                      </div>
                    </div>
                    <div className={styles.tableCell}>
                      <span data-testid={`team-size-${team.id}`}>{team.team_size}</span>
                    </div>
                    <div className={styles.tableCell}>
                      <span 
                        className={styles.achievementRate}
                        style={{ color: team.performance_color }}
                        data-testid={`achievement-rate-${team.id}`}
                      >
                        {team.team_achievement_rate.toFixed(1)}%
                      </span>
                    </div>
                    <div className={styles.tableCell}>
                      <span className={styles.salesAmount} data-testid={`sales-amount-${team.id}`}>
                        R{(team.total_sales / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <div className={styles.tableCell}>
                      <span className={styles.targetAmount} data-testid={`target-amount-${team.id}`}>
                        R{(team.team_target / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <div className={styles.tableCell}>
                      <span className={styles.vehicleEmoji}>{team.vehicle_type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
