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
    achievement_rate: 'number',
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
    circuit: 'string', // 'monaco' or 'kyalami'
    vehicle_type: 'string',
    performance_color: 'string',
    track_position: 'number'
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

// Excel column mappings for flexibility
export const ExcelColumnMappings = {
  consultant_name: ['Name', 'Consultant Name', 'Employee Name', 'Salesperson', 'Full Name', 'Employee', 'Rep Name', 'Agent Name', 'Consultant'],
  supervisor_name: ['Supervisor', 'Manager', 'Team Lead', 'Supervisor Name', 'Manager Name', 'Team Leader', 'Lead', 'Boss'],
  current_sales: ['Current Sales', 'Sales', 'Total Sales', 'SalesVal', 'TotalSalesVal', 'Sales Amount', 'Amount', 'Revenue', 'YTD Sales', 'Actual Sales', 'Sales Value'],
  sales_target: ['Target', 'Sales Target', 'Target Sales', 'SalesValTarget', 'Goal', 'Quota', 'Target Amount', 'Sales Goal', 'Target Value'],
  team_name: ['Team', 'Team Name', 'Department', 'Unit', 'Division', 'Group', 'Branch', 'Office']
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
  SUPERSTAR: '#FFD700',      // Gold - 120%+
  TARGET_ACHIEVED: '#00FF00', // Green - 100%+
  ON_TRACK: '#FFA500',       // Orange - 80%+
  NEEDS_BOOST: '#FF6B6B',    // Red - 60%+
  RECOVERY_MODE: '#8B0000'   // Dark Red - <60%
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
