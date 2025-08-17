import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TrackVisualization from './TrackVisualization';
import LiveTimingBoard from './LiveTimingBoard';
import { CircuitConfigs } from '../../../shared/schema.js';
import styles from '../styles/TrackVisualization.module.css';

export default function MonacoCircuitView({ teamData, companyMetrics }) {
  const monacoConfig = CircuitConfigs.monaco;
  
  const monacoTeams = useMemo(() => {
    if (!teamData) return [];
    return teamData.filter(team => team.circuit === 'monaco')
                  .sort((a, b) => b.team_achievement_rate - a.team_achievement_rate);
  }, [teamData]);

  const monacoStats = useMemo(() => {
    if (!monacoTeams.length) return null;
    
    const totalTarget = monacoTeams.reduce((sum, team) => sum + team.team_target, 0);
    const totalSales = monacoTeams.reduce((sum, team) => sum + team.total_sales, 0);
    const achievement = totalTarget > 0 ? (totalSales / totalTarget) * 100 : 0;
    
    return {
      totalTarget,
      totalSales,
      achievement,
      teamCount: monacoTeams.length,
      consultantCount: monacoTeams.reduce((sum, team) => sum + team.team_size, 0)
    };
  }, [monacoTeams]);

  const fastestLaps = useMemo(() => {
    return monacoTeams.slice(0, 3).map(team => ({
      ...team,
      dailyRate: team.total_sales / 31 // Assuming 31 days in month
    }));
  }, [monacoTeams]);

  if (!teamData || monacoTeams.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2>No Monaco Circuit Data Available</h2>
        <p>No teams assigned to Monaco circuit or no data available</p>
      </div>
    );
  }

  return (
    <section className={styles.circuitView}>
      <div className={styles.container}>
        {/* Hero Section */}
        <div className={styles.hero}>
          <h2 className={styles.heroTitle}>🇲🇨 MONACO GRAND PRIX</h2>
          <p className={styles.heroSubtitle}>
            Premium performance tracking on the legendary Monaco circuit
          </p>
        </div>

        <div className={styles.circuitGrid}>
          {/* Track Map Section */}
          <div className={styles.trackSection}>
            <Card className={styles.trackCard}>
              <CardHeader className={styles.trackHeader}>
                <CardTitle>Circuit de Monaco</CardTitle>
                <div className={styles.circuitInfo}>
                  <span>🏁</span>
                  <span>{monacoConfig.length}</span>
                  <span>•</span>
                  <span>{monacoConfig.laps} laps</span>
                </div>
              </CardHeader>
              
              <CardContent className={styles.trackContent}>
                <TrackVisualization 
                  circuit="monaco"
                  teams={monacoTeams}
                  config={monacoConfig}
                  className={styles.monacoTrack}
                />
              </CardContent>
            </Card>

            {/* Live Timing Board */}
            <Card className={styles.timingCard}>
              <CardHeader className={styles.timingHeader}>
                <CardTitle>Live Timing - Monaco</CardTitle>
                <div className={styles.liveIndicator}>
                  <div className={styles.liveDot}></div>
                  <span>Live</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <LiveTimingBoard 
                  teams={monacoTeams.slice(0, 10)}
                  circuit="monaco"
                  data-testid="monaco-timing-board"
                />
              </CardContent>
            </Card>
          </div>

          {/* Monaco Statistics Sidebar */}
          <div className={styles.sidebarSection}>
            {/* Circuit Information */}
            <Card className={styles.infoCard}>
              <CardHeader>
                <CardTitle>Circuit Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.infoList} data-testid="circuit-info">
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Circuit Length:</span>
                    <span className={styles.infoValue}>{monacoConfig.length}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Total Laps:</span>
                    <span className={styles.infoValue}>{monacoConfig.laps} days</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Active Drivers:</span>
                    <span className={styles.infoValue} data-testid="monaco-drivers">
                      {monacoStats?.teamCount || 0} supervisors
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Pit Crew:</span>
                    <span className={styles.infoValue} data-testid="monaco-consultants">
                      {monacoStats?.consultantCount || 0} consultants
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Record Pace:</span>
                    <span className={styles.infoValue} data-testid="monaco-record">
                      {monacoTeams[0]?.supervisor_name || 'N/A'} - {monacoTeams[0]?.team_achievement_rate.toFixed(0) || 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monaco Team Stats */}
            <Card className={styles.statsCard}>
              <CardHeader>
                <CardTitle>Monaco Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.statsList} data-testid="monaco-stats">
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Team Target:</span>
                    <span className={styles.statValue}>
                      R{((monacoStats?.totalTarget || 0) / 1000000).toFixed(0)}M
                    </span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Current Sales:</span>
                    <span className={styles.statValue} data-testid="monaco-current-sales">
                      R{((monacoStats?.totalSales || 0) / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Achievement:</span>
                    <span className={styles.statValue} data-testid="monaco-achievement">
                      {(monacoStats?.achievement || 0).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: `${Math.min(monacoStats?.achievement || 0, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className={styles.progressLabels}>
                    <span>0%</span>
                    <span className={styles.currentProgress}>
                      {(monacoStats?.achievement || 0).toFixed(0)}%
                    </span>
                    <span>120%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fastest Laps */}
            <Card className={styles.fastestCard}>
              <CardHeader>
                <CardTitle>Fastest Daily Laps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.fastestList} data-testid="fastest-laps">
                  {fastestLaps.map((team, index) => (
                    <div key={team.id} className={styles.fastestItem}>
                      <div className={styles.fastestDriver}>
                        <span className={styles.fastestVehicle}>{team.vehicle_type}</span>
                        <span className={styles.fastestName}>{team.supervisor_name}</span>
                      </div>
                      <span 
                        className={styles.fastestTime}
                        style={{ color: team.performance_color }}
                        data-testid={`fastest-lap-${index}`}
                      >
                        {(team.dailyRate / 1000000).toFixed(1)}M/day
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
