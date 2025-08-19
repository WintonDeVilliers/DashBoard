// Performance calculation constants
const PerformanceThresholds = {
  SUPERSTAR: 120,
  TARGET_ACHIEVED: 100,
  ON_TRACK: 80,
  NEEDS_BOOST: 60
};

const PerformanceColors = {
  SUPERSTAR: '#22c55e',
  TARGET_ACHIEVED: '#3b82f6', 
  ON_TRACK: '#f59e0b',
  NEEDS_BOOST: '#f97316',
  RECOVERY_MODE: '#ef4444'
};

const VehicleTypes = {
  SUPERSTAR: '🏎️',
  TARGET: '🏎️',
  ON: '🏎️', 
  NEEDS: '🏎️',
  RECOVERY: '🏎️'
};

export class PerformanceCalculator {
  static calculateAchievementRate(currentSales, target) {
    if (!target || target === 0) return 0;
    return (currentSales / target) * 100;
  }

  static getPerformanceCategory(achievementRate) {
    if (achievementRate >= PerformanceThresholds.SUPERSTAR) return 'SUPERSTAR';
    if (achievementRate >= PerformanceThresholds.TARGET_ACHIEVED) return 'TARGET_ACHIEVED';
    if (achievementRate >= PerformanceThresholds.ON_TRACK) return 'ON_TRACK';
    if (achievementRate >= PerformanceThresholds.NEEDS_BOOST) return 'NEEDS_BOOST';
    return 'RECOVERY_MODE';
  }

  static getPerformanceColor(achievementRate) {
    const category = this.getPerformanceCategory(achievementRate);
    return PerformanceColors[category];
  }

  static getVehicleType(achievementRate) {
    const category = this.getPerformanceCategory(achievementRate);
    return VehicleTypes[category.replace('_ACHIEVED', '').replace('_MODE', '').replace('_TRACK', '').replace('_BOOST', '')];
  }

  static calculateTeamMetrics(consultants) {
    if (!consultants.length) return null;

    const totalSales = consultants.reduce((sum, c) => sum + c.current_sales, 0);
    const totalTarget = consultants.reduce((sum, c) => sum + c.sales_target, 0);
    const avgAchievement = consultants.reduce((sum, c) => sum + c.achievement_rate, 0) / consultants.length;

    return {
      team_size: consultants.length,
      total_sales: totalSales,
      team_target: totalTarget,
      team_achievement_rate: this.calculateAchievementRate(totalSales, totalTarget),
      avg_performance: avgAchievement,
      vehicle_type: this.getVehicleType(avgAchievement),
      performance_color: this.getPerformanceColor(avgAchievement)
    };
  }

  static calculateDistribution(consultants) {
    return {
      superstar: consultants.filter(c => c.achievement_rate >= PerformanceThresholds.SUPERSTAR).length,
      target_achieved: consultants.filter(c => 
        c.achievement_rate >= PerformanceThresholds.TARGET_ACHIEVED && 
        c.achievement_rate < PerformanceThresholds.SUPERSTAR
      ).length,
      on_track: consultants.filter(c => 
        c.achievement_rate >= PerformanceThresholds.ON_TRACK && 
        c.achievement_rate < PerformanceThresholds.TARGET_ACHIEVED
      ).length,
      needs_boost: consultants.filter(c => 
        c.achievement_rate >= PerformanceThresholds.NEEDS_BOOST && 
        c.achievement_rate < PerformanceThresholds.ON_TRACK
      ).length,
      recovery_mode: consultants.filter(c => c.achievement_rate < PerformanceThresholds.NEEDS_BOOST).length
    };
  }

  static calculateMonthlyProgress(totalSales, totalTarget, daysInMonth = 31) {
    return Array.from({length: daysInMonth}, (_, day) => {
      const progressFactor = (day + 1) / daysInMonth;
      const actualProgress = (totalSales / totalTarget) * progressFactor * 100;
      const targetProgress = progressFactor * 100;
      
      return {
        day: day + 1,
        actual: Math.min(actualProgress, 120),
        target: targetProgress,
        date: new Date(2024, 0, day + 1).toISOString().split('T')[0]
      };
    });
  }

  static calculateTrackPosition(achievementRate, maxPosition = 100) {
    // Convert achievement rate to track position (0-100%)
    return Math.min((achievementRate / 120) * maxPosition, maxPosition);
  }

  static calculateLapProgress(achievementRate, totalLaps = 31) {
    const progressInLaps = (achievementRate / 100) * totalLaps;
    const currentLap = Math.floor(progressInLaps);
    const lapProgress = progressInLaps - currentLap;
    
    return {
      currentLap: Math.min(currentLap, totalLaps),
      totalLaps,
      progress: lapProgress,
      progressPercent: lapProgress * 100
    };
  }

  static getRankingChange(currentRank, previousRank) {
    if (!previousRank) return 0;
    return previousRank - currentRank;
  }

  static formatCurrency(amount, currency = 'R', decimals = 1) {
    if (amount >= 1000000) {
      return `${currency}${(amount / 1000000).toFixed(decimals)}M`;
    }
    if (amount >= 1000) {
      return `${currency}${(amount / 1000).toFixed(decimals)}K`;
    }
    return `${currency}${amount.toFixed(decimals)}`;
  }

  static getDailyTarget(monthlyTarget, daysInMonth = 31) {
    return monthlyTarget / daysInMonth;
  }

  static getDailyProgress(currentSales, daysElapsed) {
    if (daysElapsed === 0) return 0;
    return currentSales / daysElapsed;
  }

  static getProjectedTotal(dailyAverage, totalDays = 31) {
    return dailyAverage * totalDays;
  }

  static isOnTrackForTarget(currentSales, target, daysElapsed, totalDays = 31) {
    const expectedProgress = (daysElapsed / totalDays) * target;
    return currentSales >= expectedProgress * 0.9; // 90% threshold
  }
}
