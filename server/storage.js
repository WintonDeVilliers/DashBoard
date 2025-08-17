import { randomUUID } from "crypto";

export class MemStorage {
  constructor() {
    this.salesData = new Map();
    this.teamData = new Map();
    this.companyMetrics = null;
    this.rawExcelData = null;
  }

  // Store processed Excel data
  async storeSalesData(processedData) {
    this.rawExcelData = processedData.raw;
    this.companyMetrics = processedData.company;
    
    // Store individual consultant data
    processedData.consultants.forEach(consultant => {
      this.salesData.set(consultant.id, consultant);
    });
    
    // Store team/supervisor data
    processedData.teams.forEach(team => {
      this.teamData.set(team.id, team);
    });
    
    return {
      consultants: processedData.consultants.length,
      teams: processedData.teams.length,
      company: this.companyMetrics
    };
  }

  // Get all consultant data
  async getAllConsultants() {
    return Array.from(this.salesData.values());
  }

  // Get all team data
  async getAllTeams() {
    return Array.from(this.teamData.values());
  }

  // Get company-wide metrics
  async getCompanyMetrics() {
    return this.companyMetrics;
  }

  // Get consultants by supervisor
  async getConsultantsBySupervisor(supervisorName) {
    return Array.from(this.salesData.values())
      .filter(consultant => consultant.supervisor_name === supervisorName);
  }

  // Get teams by circuit
  async getTeamsByCircuit(circuit) {
    return Array.from(this.teamData.values())
      .filter(team => team.circuit === circuit);
  }

  // Get top performers
  async getTopPerformers(limit = 10) {
    return Array.from(this.salesData.values())
      .sort((a, b) => b.achievement_rate - a.achievement_rate)
      .slice(0, limit);
  }

  // Get team leaderboard
  async getTeamLeaderboard(limit = 10) {
    return Array.from(this.teamData.values())
      .sort((a, b) => b.team_achievement_rate - a.team_achievement_rate)
      .slice(0, limit);
  }

  // Search consultants
  async searchConsultants(query) {
    const searchTerm = query.toLowerCase();
    return Array.from(this.salesData.values())
      .filter(consultant => 
        consultant.name.toLowerCase().includes(searchTerm) ||
        consultant.supervisor_name.toLowerCase().includes(searchTerm) ||
        consultant.team_name.toLowerCase().includes(searchTerm)
      );
  }

  // Get performance distribution
  async getPerformanceDistribution() {
    if (!this.companyMetrics) return null;
    return this.companyMetrics.performance_distribution;
  }

  // Update consultant performance (for real-time updates)
  async updateConsultantPerformance(consultantId, newSales) {
    const consultant = this.salesData.get(consultantId);
    if (!consultant) return null;

    const oldSales = consultant.current_sales;
    consultant.current_sales = newSales;
    consultant.achievement_rate = (newSales / consultant.sales_target) * 100;

    // Update team metrics
    const team = Array.from(this.teamData.values())
      .find(t => t.supervisor_name === consultant.supervisor_name);
    
    if (team) {
      team.total_sales = team.total_sales - oldSales + newSales;
      team.team_achievement_rate = (team.total_sales / team.team_target) * 100;
    }

    // Update company metrics
    if (this.companyMetrics) {
      this.companyMetrics.total_sales_actual = 
        this.companyMetrics.total_sales_actual - oldSales + newSales;
      this.companyMetrics.overall_achievement = 
        (this.companyMetrics.total_sales_actual / this.companyMetrics.total_sales_target) * 100;
    }

    return consultant;
  }

  // Clear all data
  async clearAllData() {
    this.salesData.clear();
    this.teamData.clear();
    this.companyMetrics = null;
    this.rawExcelData = null;
  }

  // Get raw Excel data for debugging
  async getRawExcelData() {
    return this.rawExcelData;
  }
}

export const storage = new MemStorage();
