// Sales Performance Data Schema (JavaScript version)
export const SalesPerformanceSchema = {
  // Individual consultant/salesperson record
  consultant: {
    id: 'string',
    name: 'string',
    supervisor_name: 'string',
    team_name: 'string',
    current_sales: 'number',
    sales_target: 'number',
    real_apps_vol: 'number',
    real_apps_target: 'number',
    leads_generated: 'number',
    calls_made: 'number',
    meetings_held: 'number',
    achievement_rate: 'number',
    apps_achievement_rate: 'number',
    daily_average: 'number',
    days_active: 'number',
    position: 'number'
  },
  
  // Team/Supervisor aggregated data
  team: {
    id: 'string',
    team_name: 'string',
    supervisor_name: 'string',
    team_size: 'number',
    total_sales: 'number',
    team_target: 'number',
    team_achievement_rate: 'number',
    avg_performance: 'number',
    circuit: 'string', // 'Monaco' or 'Kyalami'
    vehicle_type: 'string',
    performance_color: 'string',
    track_position: 'number',
    consultants: 'array'
  },
  
  // Company-wide metrics
  company: {
    total_sales_actual: 'number',
    total_sales_target: 'number',
    overall_achievement: 'number',
    total_consultants: 'number',
    total_supervisors: 'number',
    performance_distribution: {
      superstar: 'number',
      target_achieved: 'number', 
      on_track: 'number',
      needs_boost: 'number',
      recovery_mode: 'number'
    },
    monthly_progress: 'array'
  }
};

// Performance categorization thresholds
export const PerformanceThresholds = {
  SUPERSTAR: 120,
  TARGET_ACHIEVED: 100,
  ON_TRACK: 80,
  NEEDS_BOOST: 60,
  RECOVERY_MODE: 0
};

// Racing vehicle assignments based on performance
export const VehicleTypes = {
  FORMULA_1: '🏎️',      // 120%+ - Superstar
  SPORTS_CAR: '🚗',     // 100%+ - Target Achieved  
  SUV: '🚙',            // 80%+ - On Track
  VAN: '🚐',            // 60%+ - Needs Boost
  TRUCK: '🛻'           // <60% - Recovery Mode
};

// Performance color coding for visualizations
export const PerformanceColors = {
  SUPERSTAR: '#FF6B35',      // Racing Orange - 120%+
  TARGET_ACHIEVED: '#4ECDC4', // Teal - 100%+
  ON_TRACK: '#45B7D1',       // Blue - 80%+
  NEEDS_BOOST: '#FFA07A',    // Light Coral - 60%+
  RECOVERY_MODE: '#FF6B6B'   // Red - <60%
};

// Racing circuit configurations
export const CircuitConfigs = {
  monaco: {
    name: 'Monaco Grand Prix',
    flag: '🇲🇨',
    length: '3.337 km',
    laps: 31,
    corners: ['Sainte Devote', 'Casino Square', 'Swimming Pool', 'Rascasse'],
    track_positions: [
      { x: 0.15, y: 0.75 }, // Start/Finish
      { x: 0.25, y: 0.85 }, // Sainte Devote
      { x: 0.40, y: 0.90 }, // Beau Rivage
      { x: 0.55, y: 0.85 }, // Casino Square
      { x: 0.68, y: 0.75 }, // Mirabeau
      { x: 0.75, y: 0.60 }, // Loews Hairpin
      { x: 0.80, y: 0.45 }, // Portier
      { x: 0.75, y: 0.30 }, // Tunnel exit
      { x: 0.65, y: 0.20 }, // Nouvelle Chicane
      { x: 0.50, y: 0.15 }, // Tabac
      { x: 0.35, y: 0.20 }, // Swimming Pool
      { x: 0.25, y: 0.35 }, // La Rascasse
      { x: 0.20, y: 0.50 }, // Anthony Noghes
      { x: 0.15, y: 0.65 }  // Back to start
    ]
  },
  kyalami: {
    name: 'Kyalami Grand Prix',
    flag: '🇿🇦',
    length: '4.522 km',
    altitude: '1,665m',
    laps: 31,
    corners: ['Turn 1', 'Crowthorne', 'Jukskei Sweep', 'Mineshaft'],
    track_positions: [
      { x: 0.25, y: 0.70 }, // Start/Finish
      { x: 0.35, y: 0.80 }, // Turn 1 approach
      { x: 0.50, y: 0.85 }, // Turn 1
      { x: 0.65, y: 0.80 }, // Turn 2
      { x: 0.75, y: 0.65 }, // Turn 3
      { x: 0.80, y: 0.50 }, // Turn 4
      { x: 0.75, y: 0.35 }, // Turn 5
      { x: 0.65, y: 0.25 }, // Turn 6
      { x: 0.50, y: 0.20 }, // Turn 7
      { x: 0.35, y: 0.25 }, // Turn 8
      { x: 0.25, y: 0.35 }, // Turn 9
      { x: 0.20, y: 0.50 }  // Back straight
    ]
  }
};

// Utility functions for performance calculations
export const PerformanceUtils = {
  getPerformanceCategory(achievementRate) {
    if (achievementRate >= PerformanceThresholds.SUPERSTAR) return 'superstar';
    if (achievementRate >= PerformanceThresholds.TARGET_ACHIEVED) return 'target_achieved';
    if (achievementRate >= PerformanceThresholds.ON_TRACK) return 'on_track';
    if (achievementRate >= PerformanceThresholds.NEEDS_BOOST) return 'needs_boost';
    return 'recovery_mode';
  },

  getVehicleIcon(achievementRate) {
    if (achievementRate >= 120) return VehicleTypes.FORMULA_1;
    if (achievementRate >= 100) return VehicleTypes.SPORTS_CAR;
    if (achievementRate >= 80) return VehicleTypes.SUV;
    if (achievementRate >= 60) return VehicleTypes.VAN;
    return VehicleTypes.TRUCK;
  },

  getPerformanceColor(achievementRate) {
    if (achievementRate >= 120) return PerformanceColors.SUPERSTAR;
    if (achievementRate >= 100) return PerformanceColors.TARGET_ACHIEVED;
    if (achievementRate >= 80) return PerformanceColors.ON_TRACK;
    if (achievementRate >= 60) return PerformanceColors.NEEDS_BOOST;
    return PerformanceColors.RECOVERY_MODE;
  }
};