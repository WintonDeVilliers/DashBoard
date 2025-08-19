import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import styles from "@/styles/RacingComponents.module.css";

export default function PitCrewView({ consultants, teams }) {
  const groupedConsultants = useMemo(() => {
    if (!consultants || consultants.length === 0) return {};

    // Group consultants by their supervisor (team field)
    return consultants.reduce((groups, consultant) => {
      const supervisorName = consultant.team || "Unknown Supervisor";
      if (!groups[supervisorName]) {
        groups[supervisorName] = [];
      }
      groups[supervisorName].push(consultant);
      return groups;
    }, {});
  }, [consultants]);

  const getPerformanceIcon = (achievementRate) => {
    if (achievementRate >= 120) return "⭐";
    if (achievementRate >= 100) return "🏆";
    if (achievementRate >= 80) return "🔥";
    if (achievementRate >= 60) return "⚡";
    return "🔧";
  };

  const getPerformanceColor = (achievementRate) => {
    if (achievementRate >= 120) return "#22c55e"; // green for superstar
    if (achievementRate >= 100) return "#3b82f6"; // blue for target achieved
    if (achievementRate >= 80) return "#f59e0b"; // yellow for on track
    if (achievementRate >= 60) return "#f97316"; // orange for needs boost
    return "#ef4444"; // red for recovery mode
  };

  if (!consultants || consultants.length === 0) {
    return null;
  }

  return (
    <div className={styles.pitCrewView}>
      <div className={styles.hero}>
        <h2 className={styles.heroTitle}>TEAM RACING CHAMPIONSHIP</h2>
        <p className={styles.heroSubtitle}>
          Consultant Performance (PIT CREW))
        </p>
      </div>
      {/* <h2 className={styles.sectionTitle}>TEAM RACING CHAMPIONSHIP</h2>
      <p className={styles.sectionSubtitle}>Consultant Performance (PIT CREW)</p> */}

      <div className={styles.pitCrewContainer}>
        {Object.entries(groupedConsultants).map(
          ([supervisorName, teamMembers]) => {
            const sortedMembers = [...teamMembers].sort(
              (a, b) => (b.achievementRate || 0) - (a.achievementRate || 0),
            );

            return (
              <Card key={supervisorName} className={styles.pitCrewCard}>
                <CardHeader className={styles.pitCrewCardHeader}>
                  <CardTitle>🏎️ Driver: {supervisorName}</CardTitle>
                  <div className={styles.crewStats}>
                    Pit Crew Size: {teamMembers.length} | Avg Performance:{" "}
                    {(
                      teamMembers.reduce(
                        (sum, m) => sum + (m.achievementRate || 0),
                        0,
                      ) / teamMembers.length
                    ).toFixed(1)}
                    % | Total Apps:{" "}
                    {teamMembers.reduce(
                      (sum, m) => sum + (m.real_apps_vol || 0),
                      0,
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className={styles.crewGrid}>
                    {sortedMembers.map((consultant, index) => (
                      <div
                        key={consultant.id}
                        className={styles.crewMember}
                        style={{
                          borderColor: getPerformanceColor(
                            consultant.achievementRate || 0,
                          ),
                          backgroundColor: `${getPerformanceColor(consultant.achievementRate || 0)}15`,
                        }}
                        data-testid={`crew-member-${consultant.id}`}
                      >
                        <div className={styles.memberHeader}>
                          <span className={styles.memberIcon}>
                            {getPerformanceIcon(
                              consultant.achievementRate || 0,
                            )}
                          </span>
                          <span className={styles.memberPosition}>
                            #{index + 1}
                          </span>
                        </div>

                        <div className={styles.memberInfo}>
                          <div
                            className={styles.memberName}
                            data-testid={`member-name-${consultant.id}`}
                          >
                            {consultant.name}
                          </div>
                          <div className={styles.memberRole}>
                            Pit Crew Member
                          </div>
                          <div
                            className={styles.memberAchievement}
                            style={{
                              color: getPerformanceColor(
                                consultant.achievementRate || 0,
                              ),
                            }}
                          >
                            {(consultant.achievementRate || 0).toFixed(1)}%
                          </div>
                        </div>

                        <div className={styles.memberStats}>
                          <div className={styles.memberSales}>
                            Current Sales Value : R
                            {((consultant.sales || 0) / 1000000).toFixed(1)}M
                          </div>
                          <div className={styles.memberTarget}>
                            Target: R
                            {((consultant.target || 0) / 1000000).toFixed(1)}M
                          </div>
                          <div className={styles.memberRole}>
                            Role: {consultant.role || "Consultant"}
                          </div>
                          <div className={styles.memberPerformance}>
                            Level: {consultant.performanceLevel || "Unknown"}
                          </div>

                          <div className={styles.memberCircuit}>
                            Circuit: {consultant.circuit || "TBD"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          },
        )}
      </div>
    </div>
  );
}
