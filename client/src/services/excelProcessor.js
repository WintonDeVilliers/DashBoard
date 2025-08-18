import * as XLSX from 'xlsx';
import { ExcelColumnMappings } from '../../shared/schema.js';

export class ExcelProcessor {
  static async processFile(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Look for 'Sales Performance' sheet or use first sheet
      let sheetName = 'Sales Performance';
      if (!workbook.Sheets[sheetName]) {
        sheetName = workbook.SheetNames[0];
      }
      
      if (!workbook.Sheets[sheetName]) {
        throw new Error('No valid worksheet found in Excel file');
      }

      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet);
      
      if (rawData.length === 0) {
        throw new Error('Excel worksheet is empty');
      }

      return this.transformData(rawData);
    } catch (error) {
      console.error('Excel processing error:', error);
      throw new Error(`Failed to process Excel file: ${error.message}`);
    }
  }

  static transformData(rawData) {
    const columnMappings = this.findColumnMappings(rawData[0]);
    const consultants = [];
    const teamMap = new Map();
    let totalSales = 0;
    let totalTarget = 0;

    // Process each row
    rawData.forEach((row, index) => {
      const consultant = {
        id: `consultant_${index + 1}`,
        name: this.getColumnValue(row, columnMappings.consultant_name) || `Consultant ${index + 1}`,
        supervisor_name: this.getColumnValue(row, columnMappings.supervisor_name) || 'Unknown Supervisor',
        team_name: this.getColumnValue(row, columnMappings.team_name) || 'Unknown Team',
        current_sales: parseFloat(this.getColumnValue(row, columnMappings.current_sales)) || 0,
        sales_target: parseFloat(this.getColumnValue(row, columnMappings.sales_target)) || 0,
        real_apps_vol: parseInt(this.getColumnValue(row, columnMappings.real_apps_vol)) || 0,
        real_apps_target: parseInt(this.getColumnValue(row, columnMappings.real_apps_target)) || 0,
        leads_generated: parseInt(this.getColumnValue(row, columnMappings.leads_generated)) || 0,
        calls_made: parseInt(this.getColumnValue(row, columnMappings.calls_made)) || 0,
        meetings_held: parseInt(this.getColumnValue(row, columnMappings.meetings_held)) || 0,
        achievement_rate: 0,
        daily_average: 0,
        days_active: 31,
        position: 0,
        apps_achievement_rate: 0
      };

      // Calculate achievement rate
      if (consultant.sales_target > 0) {
        consultant.achievement_rate = (consultant.current_sales / consultant.sales_target) * 100;
      }
      
      // Calculate apps achievement rate
      if (consultant.real_apps_target > 0) {
        consultant.apps_achievement_rate = (consultant.real_apps_vol / consultant.real_apps_target) * 100;
      }
      
      consultant.daily_average = consultant.current_sales / consultant.days_active;
      consultants.push(consultant);
      
      // Aggregate team data
      this.aggregateTeamData(consultant, teamMap);
      
      totalSales += consultant.current_sales;
      totalTarget += consultant.sales_target;
    });

    return this.finalizeProcessing(consultants, teamMap, totalSales, totalTarget);
  }

  static findColumnMappings(firstRow) {
    const mappings = {};
    const columns = Object.keys(firstRow);
    
    for (const [field, possibleNames] of Object.entries(ExcelColumnMappings)) {
      for (const column of columns) {
        if (possibleNames.some(name => column.toLowerCase().includes(name.toLowerCase()))) {
          mappings[field] = column;
          break;
        }
      }
    }
    
    return mappings;
  }

  static getColumnValue(row, columnName) {
    return columnName ? row[columnName] : null;
  }

  static aggregateTeamData(consultant, teamMap) {
    const teamKey = consultant.supervisor_name;
    if (!teamMap.has(teamKey)) {
      teamMap.set(teamKey, {
        id: `team_${teamMap.size + 1}`,
        team_name: consultant.team_name,
        supervisor_name: consultant.supervisor_name,
        team_size: 0,
        total_sales: 0,
        team_target: 0,
        team_achievement_rate: 0,
        avg_performance: 0,
        consultants: [],
        circuit: this.getCircuitAssignment(consultant.supervisor_name),
        vehicle_type: '',
        performance_color: '',
        track_position: 0
      });
    }
    
    const team = teamMap.get(teamKey);
    team.team_size++;
    team.total_sales += consultant.current_sales;
    team.team_target += consultant.sales_target;
    team.consultants.push(consultant);
  }

  static finalizeProcessing(consultants, teamMap, totalSales, totalTarget) {
    // Calculate team metrics
    const teams = Array.from(teamMap.values()).map(team => {
      if (team.team_target > 0) {
        team.team_achievement_rate = (team.total_sales / team.team_target) * 100;
      }
      
      team.avg_performance = team.consultants.reduce((sum, c) => sum + c.achievement_rate, 0) / team.team_size;
      team.vehicle_type = this.getVehicleType(team.team_achievement_rate);
      team.performance_color = this.getPerformanceColor(team.team_achievement_rate);
      team.track_position = Math.min(team.team_achievement_rate, 120);
      
      return team;
    });

    // Sort and assign positions
    consultants.sort((a, b) => b.achievement_rate - a.achievement_rate);
    consultants.forEach((consultant, index) => {
      consultant.position = index + 1;
    });

    return {
      consultants,
      teams,
      summary: {
        totalConsultants: consultants.length,
        totalTeams: teams.length,
        totalSales,
        totalTarget,
        overallAchievement: totalTarget > 0 ? (totalSales / totalTarget) * 100 : 0
      }
    };
  }

  static getVehicleType(achievementRate) {
    if (achievementRate >= 120) return '🏎️';
    if (achievementRate >= 100) return '🚗';
    if (achievementRate >= 80) return '🚙';
    if (achievementRate >= 60) return '🚐';
    return '🛻';
  }

  static getPerformanceColor(achievementRate) {
    if (achievementRate >= 120) return '#FF6B35';
    if (achievementRate >= 100) return '#4ECDC4';
    if (achievementRate >= 80) return '#45B7D1';
    if (achievementRate >= 60) return '#FFA07A';
    return '#FF6B6B';
  }

  static getCircuitAssignment(supervisorName) {
    // Monaco circuit supervisors
    const monacoSupervisors = [
      'Ashley Moyo',
      'Mixo Makhubele', 
      'Nonhle Zondi',
      'Rodney Naidu',
      'Samantha Govender',
      'Samuel Masubelele',
      'Taedi Moletsane',
      'Thabo Mosweu',
      'Thobile Phakhathi'
    ];
    
    // Kyalami circuit supervisors
    const kyalamiSupervisors = [
      'Busisiwe Mabuza',
      'Cindy Visser',
      'Matimba Ngobeni',
      'Mfundo Mdlalose',
      'Mondli Nhlapho',
      'Mosima Moshidi',
      'Salome Baloyi',
      'Shadleigh White',
      'Tshepo Moeketsi'
    ];
    
    if (monacoSupervisors.includes(supervisorName)) {
      return 'Monaco';
    } else if (kyalamiSupervisors.includes(supervisorName)) {
      return 'Kyalami';
    } else {
      // Fallback for unknown supervisors - assign based on name hash for consistency
      return supervisorName.charCodeAt(0) % 2 === 0 ? 'Monaco' : 'Kyalami';
    }
  }
}
