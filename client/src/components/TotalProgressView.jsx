import { useMemo, useEffect, useRef } from 'react';
import RacingGauge from './RacingGauge';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import styles from '../styles/RacingComponents.module.css';

export default function TotalProgressView({ companyMetrics, teamData, consultantData }) {
  const chartRef = useRef(null);

  // Get actual consultant names for each performance category
  const getConsultantsByCategory = (category) => {
    if (!consultantData) return [];
    
    return consultantData.filter(consultant => {
      const rate = consultant.achievementRate;
      switch(category) {
        case 'superstar': return rate >= 120;
        case 'target_achieved': return rate >= 100 && rate < 120;
        case 'on_track': return rate >= 80 && rate < 100;
        case 'needs_boost': return rate >= 60 && rate < 80;
        case 'recovery_mode': return rate < 60;
        default: return false;
      }
    }).slice(0, 2).map(c => c.name).join(', ') || 'No consultants';
  };

  const chartData = useMemo(() => {
    // Handle case where monthly_progress might not exist (from Excel data)
    if (!companyMetrics?.monthly_progress) {
      console.log('No monthly progress data available, using dummy data for visualization');
      // Create dummy progress data for demonstration when using Excel uploads
      return {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'Average Achievement',
            data: [65, 72, 78, companyMetrics?.averageAchievement || 75],
            borderColor: '#FF6B35',
            backgroundColor: 'rgba(255, 107, 53, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
          },
          {
            label: 'Target Line',
            data: [100, 100, 100, 100],
            borderColor: '#4ECDC4',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0
          }
        ]
      };
    }
    
    return {
      labels: companyMetrics.monthly_progress.map(item => `Day ${item.day}`),
      datasets: [
        {
          label: 'Actual Progress',
          data: companyMetrics.monthly_progress.map(item => item.actual),
          borderColor: '#FF6B35',
          backgroundColor: 'rgba(255, 107, 53, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        },
        {
          label: 'Target Line',
          data: companyMetrics.monthly_progress.map(item => item.target),
          borderColor: '#4ECDC4',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0
        }
      ]
    };
  }, [companyMetrics]);

  useEffect(() => {
    // Initialize Chart.js if chartData exists
    if (chartData && chartRef.current && window.Chart) {
      const ctx = chartRef.current.getContext('2d');
      
      // Destroy existing chart if it exists
      if (chartRef.current.chart) {
        chartRef.current.chart.destroy();
      }

      chartRef.current.chart = new window.Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false, // Disable all animations
          plugins: {
            legend: {
              labels: {
                color: '#ffffff'
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: '#9ca3af',
                maxTicksLimit: 8
              },
              grid: {
                color: 'rgba(156, 163, 175, 0.1)'
              }
            },
            y: {
              ticks: {
                color: '#9ca3af',
                callback: function(value) {
                  return value + '%';
                }
              },
              grid: {
                color: 'rgba(156, 163, 175, 0.1)'
              }
            }
          }
        }
      });
    }

    // Cleanup function
    return () => {
      if (chartRef.current?.chart) {
        chartRef.current.chart.destroy();
      }
    };
  }, [chartData]);

  if (!companyMetrics) {
    return null; // Hide when no data instead of showing empty state
  }

  const achievementRate = companyMetrics.averageAchievement || companyMetrics.overall_achievement || 0;
  const targetAmount = companyMetrics.total_sales_target || 240000000;
  const actualAmount = companyMetrics.totalRevenue || companyMetrics.total_sales_actual || 0;

  return (
    <section className={styles.totalView}>
      <div className={styles.container}>
        {/* Hero Section */}
        <div className={styles.hero}>
          <h2 className={styles.heroTitle}>Overview</h2>
          <p className={styles.heroSubtitle}>
            Formular-1 Race Statistics
          </p>
        </div>

        {/* Main Progress Gauge */}
        <Card className={styles.mainGaugeCard}>
          <CardHeader className={styles.gaugeHeader}>
            <CardTitle>Sales Championship Progress</CardTitle>
            <p>
              Target: R{(targetAmount / 1000000).toFixed(0)}M | 
              Current: R<span className={styles.currentAmount} data-testid="total-sales-actual">
                {(actualAmount / 1000000).toFixed(1)}
              </span>M
            </p>
          </CardHeader>
          <CardContent className={styles.gaugeContent}>
            <RacingGauge 
              value={actualAmount}
              target={targetAmount}
              size={400}
              className={styles.mainGauge}
              isMonetary={true}
            />
            
            {/* Performance Stats */}
            <div className={styles.performanceStats} data-testid="performance-stats">
              <div className={styles.statCard}>
                <div className={styles.statValue} data-testid="total-consultants">
                  {companyMetrics.totalConsultants || companyMetrics.total_consultants || 0}
                </div>
                <div className={styles.statLabel}>Total Consultants</div>
                <div className={styles.statSubtext}>Active Pit Crew</div>
              </div>
              
              <div className={styles.statCard}>
                <div className={styles.statValue} data-testid="total-supervisors">
                  {companyMetrics.total_supervisors}
                </div>
                <div className={styles.statLabel}>Active Supervisors</div>
                <div className={styles.statSubtext}>Racing Drivers</div>
              </div>
              
              <div className={styles.statCard}>
                <div className={styles.statValue} data-testid="top-performers">
                  {(companyMetrics.performance_distribution?.target_achieved || 0) + (companyMetrics.performance_distribution?.superstar || 0)}
                </div>
                <div className={styles.statLabel}>Top Performers</div>
                <div className={styles.statSubtext}>Pit Crew Podium Position</div>
              </div>
              
              <div className={styles.statCard}>
                <div className={styles.statValue} data-testid="need-support">
                  {(companyMetrics.performance_distribution?.recovery_mode || 0) + (companyMetrics.performance_distribution?.needs_boost || 0)}
                </div>
                <div className={styles.statLabel}>Pit Stop Requests</div>
                <div className={styles.statSubtext}>Pit Crew Needs Support </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Distribution */}
        <div className={styles.distributionGrid}>
          {/* Performance Categories */}
          <Card className={styles.categoriesCard}>
            <CardHeader>
              <CardTitle>Pit Crew Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.categoriesList} data-testid="performance-categories">
                <div className={styles.categoryItem}>
                  <div className={styles.categoryIcon}>🏎️</div>
                  <div className={styles.categoryLabel}>
                    Podium Pushers (120%+)
                    <div className={styles.categoryNames}>{getConsultantsByCategory('superstar')}</div>
                  </div>
                  <div className={styles.categoryBar}>
                    <div 
                      className={styles.categoryProgress}
                      style={{ 
                        width: `${(companyMetrics.performance_distribution?.superstar / companyMetrics.total_consultants) * 100}%`,
                        backgroundColor: '#FF6B35'
                      }}
                    ></div>
                  </div>
                  <div className={styles.categoryCount} data-testid="superstar-count">
                    {companyMetrics.performance_distribution?.superstar || 0}
                  </div>
                </div>

                <div className={styles.categoryItem}>
                  <div className={styles.categoryIcon}>🚗</div>
                  <div className={styles.categoryLabel}>
                    Pit Masters (100%+)
                    <div className={styles.categoryNames}>{getConsultantsByCategory('target_achieved')}</div>
                  </div>
                  <div className={styles.categoryBar}>
                    <div 
                      className={styles.categoryProgress}
                      style={{ 
                        width: `${(companyMetrics.performance_distribution?.target_achieved / companyMetrics.total_consultants) * 100}%`,
                        backgroundColor: '#4ECDC4'
                      }}
                    ></div>
                  </div>
                  <div className={styles.categoryCount} data-testid="target-achieved-count">
                    {companyMetrics.performance_distribution?.target_achieved || 0}
                  </div>
                </div>

                <div className={styles.categoryItem}>
                  <div className={styles.categoryIcon}>🚙</div>
                  <div className={styles.categoryLabel}>
                    Pit Crew Stabilizers (80%+)
                    <div className={styles.categoryNames}>{getConsultantsByCategory('on_track')}</div>
                  </div>
                  <div className={styles.categoryBar}>
                    <div 
                      className={styles.categoryProgress}
                      style={{ 
                        width: `${(companyMetrics.performance_distribution?.on_track / companyMetrics.total_consultants) * 100}%`,
                        backgroundColor: '#45B7D1'
                      }}
                    ></div>
                  </div>
                  <div className={styles.categoryCount} data-testid="on-track-count">
                    {companyMetrics.performance_distribution?.on_track || 0}
                  </div>
                </div>

                <div className={styles.categoryItem}>
                  <div className={styles.categoryIcon}>🚐</div>
                  <div className={styles.categoryLabel}>
                    Fueler Frenzy (60%+)
                    <div className={styles.categoryNames}>{getConsultantsByCategory('needs_boost')}</div>
                  </div>
                  <div className={styles.categoryBar}>
                    <div 
                      className={styles.categoryProgress}
                      style={{ 
                        width: `${(companyMetrics.performance_distribution?.needs_boost / companyMetrics.total_consultants) * 100}%`,
                        backgroundColor: '#FFA07A'
                      }}
                    ></div>
                  </div>
                  <div className={styles.categoryCount} data-testid="needs-boost-count">
                    {companyMetrics.performance_distribution?.needs_boost || 0}
                  </div>
                </div>

                <div className={styles.categoryItem}>
                  <div className={styles.categoryIcon}>🛻</div>
                  <div className={styles.categoryLabel}>
                    Under the Wrench (&lt;60%)
                    <div className={styles.categoryNames}>{getConsultantsByCategory('recovery_mode')}</div>
                  </div>
                  <div className={styles.categoryBar}>
                    <div 
                      className={styles.categoryProgress}
                      style={{ 
                        width: `${(companyMetrics.performance_distribution?.recovery_mode / companyMetrics.total_consultants) * 100}%`,
                        backgroundColor: '#FF6B6B'
                      }}
                    ></div>
                  </div>
                  <div className={styles.categoryCount} data-testid="recovery-mode-count">
                    {companyMetrics.performance_distribution?.recovery_mode || 0}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Progress Chart */}
          <Card className={styles.progressCard}>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.chartContainer} data-testid="progress-chart">
                <canvas ref={chartRef} className={styles.progressCanvas}></canvas>
              </div>
              <div className={styles.chartLegend}>
                <div className={styles.legendItem}>
                  <span>Month Start</span>
                  <span className={styles.currentPosition}>Current Position</span>
                  <span>Month End</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
