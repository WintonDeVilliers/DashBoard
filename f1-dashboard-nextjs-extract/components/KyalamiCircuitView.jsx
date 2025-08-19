import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TrackVisualization from './TrackVisualization';
import LiveTimingBoard from './LiveTimingBoard';
import { CircuitConfigs } from '../../../shared/schema.js';
import styles from '../styles/TrackVisualization.module.css';

export default function KyalamiCircuitView({ teamData, companyMetrics }) {
  const kyalamiConfig = CircuitConfigs.kyalami;
  
  const kyalamiTeams = useMemo(() => {
    if (!teamData) return [];
    return teamData.filter(team => team.circuit && team.circuit.toLowerCase() === 'kyalami')
                   .sort((a, b) => b.team_achievement_rate - a.team_achievement_rate);
  }, [teamData]);

  const kyalamiStats = useMemo(() => {
    if (!kyalamiTeams.length) return null;
    
    const totalTarget = kyalamiTeams.reduce((sum, team) => sum + team.team_target, 0);
    const totalSales = kyalamiTeams.reduce((sum, team) => sum + team.total_sales, 0);
    const achievement = totalTarget > 0 ? (totalSales / totalTarget) * 100 : 0;
    
    return {
      totalTarget,
      totalSales,
      achievement,
      teamCount: kyalamiTeams.length,
      consultantCount: kyalamiTeams.reduce((sum, team) => sum + team.team_size, 0)
    };
  }, [kyalamiTeams]);

  const fastestSectors = useMemo(() => {
    const shuffled = [...kyalamiTeams].sort(() => Math.random() - 0.5);
    return [
      { sector: 'Sector 1', leader: shuffled[0] },
      { sector: 'Sector 2', leader: shuffled[1] },
      { sector: 'Sector 3', leader: shuffled[2] }
    ].filter(item => item.leader);
  }, [kyalamiTeams]);

  if (!teamData || kyalamiTeams.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2>No Kyalami Circuit Data Available</h2>
        <p>No teams assigned to Kyalami circuit or no data available</p>
      </div>
    );
  }

  return (
    <section className={styles.circuitView}>
      <div className={styles.container}>
        {/* Hero Section */}
        <div className={styles.hero}>
          <h2 className={styles.heroTitle}>🇿🇦 KYALAMI GRAND PRIX</h2>
          <p className={styles.heroSubtitle}>
            High-altitude performance on South Africa's legendary racing circuit
          </p>
        </div>

        <div className={styles.circuitGrid}>
          {/* Track Map Section */}
          <div className={styles.trackSection}>
            <Card className={styles.trackCard}>
              <CardHeader className={styles.trackHeader}>
                <CardTitle>Kyalami Grand Prix Circuit</CardTitle>
                <div className={styles.circuitInfo}>
                  <span>🏁</span>
                  <span>{kyalamiConfig.length}</span>
                  <span>•</span>
                  <span>{kyalamiConfig.altitude}</span>
                </div>
              </CardHeader>
              
              <CardContent className={styles.trackContent}>
                <TrackVisualization 
                  circuit="kyalami"
                  teams={kyalamiTeams}
                  config={kyalamiConfig}
                  className={styles.kyalamiTrack}
                />
              </CardContent>
            </Card>

            {/* Live Timing Board */}
            <Card className={styles.timingCard}>
              <CardHeader className={styles.timingHeader}>
                <CardTitle>Live Timing - Kyalami</CardTitle>
                <div className={styles.liveIndicator}>
                  <div className={styles.liveDot}></div>
                  <span>Live</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <LiveTimingBoard 
                  teams={kyalamiTeams.slice(0, 10)}
                  circuit="kyalami"
                  data-testid="kyalami-timing-board"
                />
              </CardContent>
            </Card>
          </div>

          {/* Kyalami Statistics Sidebar */}
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
                    <span className={styles.infoValue}>{kyalamiConfig.length}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Altitude:</span>
                    <span className={styles.infoValue}>{kyalamiConfig.altitude}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Active Drivers:</span>
                    <span className={styles.infoValue} data-testid="kyalami-drivers">
                      {kyalamiStats?.teamCount || 0} supervisors
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Pit Crew:</span>
                    <span className={styles.infoValue} data-testid="kyalami-consultants">
                      {kyalamiStats?.consultantCount || 0} consultants
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Record Pace:</span>
                    <span className={styles.infoValue} data-testid="kyalami-record">
                      {kyalamiTeams[0]?.supervisor_name || 'N/A'} - {kyalamiTeams[0]?.team_achievement_rate.toFixed(0) || 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Kyalami Team Stats */}
            <Card className={styles.statsCard}>
              <CardHeader>
                <CardTitle>Kyalami Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.statsList} data-testid="kyalami-stats">
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Team Target:</span>
                    <span className={styles.statValue}>
                      R{((kyalamiStats?.totalTarget || 0) / 1000000).toFixed(0)}M
                    </span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Current Sales:</span>
                    <span className={styles.statValue} data-testid="kyalami-current-sales">
                      R{((kyalamiStats?.totalSales || 0) / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Achievement:</span>
                    <span className={styles.statValue} data-testid="kyalami-achievement">
                      {(kyalamiStats?.achievement || 0).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: `${Math.min(kyalamiStats?.achievement || 0, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className={styles.progressLabels}>
                    <span>0%</span>
                    <span className={styles.currentProgress}>
                      {(kyalamiStats?.achievement || 0).toFixed(0)}%
                    </span>
                    <span>120%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fastest Daily Laps */}
            <Card className={styles.fastestCard}>
              <CardHeader>
                <CardTitle>Fastest Daily Laps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.fastestList} data-testid="fastest-laps">
                  {kyalamiTeams.slice(0, 3).map((team, index) => (
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
                        {((team.total_sales / 31) / 1000000).toFixed(1)}M/day
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Track Conditions */}
            <Card className={styles.conditionsCard}>
              <CardHeader>
                <CardTitle>Track Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.conditionsList} data-testid="track-conditions">
                  <div className={styles.conditionItem}>
                    <span className={styles.conditionLabel}>Market Temp:</span>
                    <span className={styles.conditionValue}>Hot 🌡️</span>
                  </div>
                  <div className={styles.conditionItem}>
                    <span className={styles.conditionLabel}>Track Grip:</span>
                    <span className={styles.conditionValue}>Challenging 🏁</span>
                  </div>
                  <div className={styles.conditionItem}>
                    <span className={styles.conditionLabel}>Visibility:</span>
                    <span className={styles.conditionValue}>Clear ☀️</span>
                  </div>
                  <div className={styles.conditionItem}>
                    <span className={styles.conditionLabel}>Competition:</span>
                    <span className={styles.conditionValue}>Intense 🔥</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fastest Sectors */}
            <Card className={styles.sectorsCard}>
              <CardHeader>
                <CardTitle>Fastest Sectors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.sectorsList} data-testid="fastest-sectors">
                  {fastestSectors.map((item, index) => (
                    <div key={index} className={styles.sectorItem}>
                      <div className={styles.sectorInfo}>
                        <span className={styles.sectorVehicle}>{item.leader.vehicle_type}</span>
                        <span className={styles.sectorName}>{item.sector}</span>
                      </div>
                      <span 
                        className={styles.sectorLeader}
                        style={{ color: item.leader.performance_color }}
                        data-testid={`sector-leader-${index}`}
                      >
                        {item.leader.supervisor_name}
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
