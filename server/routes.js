import express from "express";
import { createServer } from "http";
import { storage } from "./storage.js";
import multer from "multer";
import * as XLSX from "xlsx";
import { ExcelColumnMappings, PerformanceThresholds, VehicleTypes, PerformanceColors, CircuitConfigs } from "../shared/schema.js";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export async function registerRoutes(app) {
  
  // Upload and process Excel file
  app.post("/api/upload-excel", upload.single('excelFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No Excel file uploaded" });
      }

      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      
      // Look for 'Sales Performance' sheet or use first sheet
      let sheetName = 'Sales Performance';
      if (!workbook.Sheets[sheetName]) {
        sheetName = workbook.SheetNames[0];
      }
      
      if (!workbook.Sheets[sheetName]) {
        return res.status(400).json({ error: "No valid worksheet found" });
      }

      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet);
      
      if (rawData.length === 0) {
        return res.status(400).json({ error: "Excel sheet is empty" });
      }

      // Process the Excel data
      const processedData = await processExcelData(rawData);
      
      // Store in memory
      const result = await storage.storeSalesData(processedData);
      
      res.json({
        message: "Excel data processed successfully",
        summary: result
      });

    } catch (error) {
      console.error("Excel processing error:", error);
      res.status(500).json({ error: "Failed to process Excel file: " + error.message });
    }
  });

  // Get company-wide metrics
  app.get("/api/company-metrics", async (req, res) => {
    try {
      const metrics = await storage.getCompanyMetrics();
      if (!metrics) {
        return res.status(404).json({ error: "No data available. Please upload Excel file first." });
      }
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all consultants
  app.get("/api/consultants", async (req, res) => {
    try {
      const consultants = await storage.getAllConsultants();
      res.json(consultants);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get team leaderboard
  app.get("/api/teams", async (req, res) => {
    try {
      const { circuit, limit = 20 } = req.query;
      
      let teams;
      if (circuit) {
        teams = await storage.getTeamsByCircuit(circuit);
      } else {
        teams = await storage.getTeamLeaderboard(parseInt(limit));
      }
      
      res.json(teams);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get top individual performers
  app.get("/api/top-performers", async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const performers = await storage.getTopPerformers(parseInt(limit));
      res.json(performers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get consultants by supervisor
  app.get("/api/consultants/supervisor/:name", async (req, res) => {
    try {
      const supervisorName = decodeURIComponent(req.params.name);
      const consultants = await storage.getConsultantsBySupervisor(supervisorName);
      res.json(consultants);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Search consultants
  app.get("/api/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ error: "Search query required" });
      }
      
      const results = await storage.searchConsultants(q);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update consultant performance (for real-time updates)
  app.patch("/api/consultant/:id/performance", async (req, res) => {
    try {
      const { id } = req.params;
      const { newSales } = req.body;
      
      if (typeof newSales !== 'number' || newSales < 0) {
        return res.status(400).json({ error: "Valid sales amount required" });
      }
      
      const updated = await storage.updateConsultantPerformance(id, newSales);
      if (!updated) {
        return res.status(404).json({ error: "Consultant not found" });
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get performance distribution
  app.get("/api/performance-distribution", async (req, res) => {
    try {
      const distribution = await storage.getPerformanceDistribution();
      if (!distribution) {
        return res.status(404).json({ error: "No data available" });
      }
      res.json(distribution);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Clear all data
  app.delete("/api/data", async (req, res) => {
    try {
      await storage.clearAllData();
      res.json({ message: "All data cleared successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to process Excel data
async function processExcelData(rawData) {
  const consultants = [];
  const teamMap = new Map();
  let totalSales = 0;
  let totalTarget = 0;

  // Find column mappings
  const columnMappings = findColumnMappings(rawData[0]);
  
  // Process each row
  rawData.forEach((row, index) => {
    const consultant = {
      id: `consultant_${index + 1}`,
      name: getColumnValue(row, columnMappings.consultant_name) || `Consultant ${index + 1}`,
      supervisor_name: getColumnValue(row, columnMappings.supervisor_name) || 'Unknown Supervisor',
      team_name: getColumnValue(row, columnMappings.team_name) || 'Unknown Team',
      current_sales: parseFloat(getColumnValue(row, columnMappings.current_sales)) || 0,
      sales_target: parseFloat(getColumnValue(row, columnMappings.sales_target)) || 0,
      achievement_rate: 0,
      daily_average: 0,
      days_active: 31,
      position: 0
    };

    // Calculate achievement rate
    if (consultant.sales_target > 0) {
      consultant.achievement_rate = (consultant.current_sales / consultant.sales_target) * 100;
    }
    
    consultant.daily_average = consultant.current_sales / consultant.days_active;
    
    consultants.push(consultant);
    
    // Aggregate team data
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
        circuit: Math.random() > 0.5 ? 'monaco' : 'kyalami', // Randomly assign circuit
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
    
    totalSales += consultant.current_sales;
    totalTarget += consultant.sales_target;
  });

  // Calculate team metrics and assign racing elements
  const teams = Array.from(teamMap.values()).map(team => {
    if (team.team_target > 0) {
      team.team_achievement_rate = (team.total_sales / team.team_target) * 100;
    }
    
    team.avg_performance = team.consultants.reduce((sum, c) => sum + c.achievement_rate, 0) / team.team_size;
    
    // Assign vehicle type and color based on performance
    team.vehicle_type = getVehicleType(team.team_achievement_rate);
    team.performance_color = getPerformanceColor(team.team_achievement_rate);
    
    // Calculate track position (0-100% based on achievement rate)
    team.track_position = Math.min(team.team_achievement_rate, 120);
    
    return team;
  });

  // Sort consultants by achievement rate and assign positions
  consultants.sort((a, b) => b.achievement_rate - a.achievement_rate);
  consultants.forEach((consultant, index) => {
    consultant.position = index + 1;
  });

  // Calculate performance distribution
  const distribution = {
    superstar: consultants.filter(c => c.achievement_rate >= PerformanceThresholds.SUPERSTAR).length,
    target_achieved: consultants.filter(c => c.achievement_rate >= PerformanceThresholds.TARGET_ACHIEVED && c.achievement_rate < PerformanceThresholds.SUPERSTAR).length,
    on_track: consultants.filter(c => c.achievement_rate >= PerformanceThresholds.ON_TRACK && c.achievement_rate < PerformanceThresholds.TARGET_ACHIEVED).length,
    needs_boost: consultants.filter(c => c.achievement_rate >= PerformanceThresholds.NEEDS_BOOST && c.achievement_rate < PerformanceThresholds.ON_TRACK).length,
    recovery_mode: consultants.filter(c => c.achievement_rate < PerformanceThresholds.NEEDS_BOOST).length
  };

  // Generate monthly progress (simulated daily cumulative progress)
  const monthlyProgress = Array.from({length: 31}, (_, day) => {
    const progressFactor = (day + 1) / 31;
    const actualProgress = (totalSales / totalTarget) * progressFactor * 100;
    const targetProgress = progressFactor * 100;
    return {
      day: day + 1,
      actual: Math.min(actualProgress, 120),
      target: targetProgress
    };
  });

  // Company metrics
  const company = {
    total_sales_actual: totalSales,
    total_sales_target: totalTarget,
    overall_achievement: totalTarget > 0 ? (totalSales / totalTarget) * 100 : 0,
    total_consultants: consultants.length,
    total_supervisors: teams.length,
    performance_distribution: distribution,
    monthly_progress: monthlyProgress
  };

  return {
    consultants,
    teams,
    company,
    raw: rawData
  };
}

// Helper functions
function findColumnMappings(firstRow) {
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

function getColumnValue(row, columnName) {
  return columnName ? row[columnName] : null;
}

function getVehicleType(achievementRate) {
  if (achievementRate >= PerformanceThresholds.SUPERSTAR) return VehicleTypes.FORMULA_1;
  if (achievementRate >= PerformanceThresholds.TARGET_ACHIEVED) return VehicleTypes.SPORTS_CAR;
  if (achievementRate >= PerformanceThresholds.ON_TRACK) return VehicleTypes.SUV;
  if (achievementRate >= PerformanceThresholds.NEEDS_BOOST) return VehicleTypes.VAN;
  return VehicleTypes.TRUCK;
}

function getPerformanceColor(achievementRate) {
  if (achievementRate >= PerformanceThresholds.SUPERSTAR) return PerformanceColors.SUPERSTAR;
  if (achievementRate >= PerformanceThresholds.TARGET_ACHIEVED) return PerformanceColors.TARGET_ACHIEVED;
  if (achievementRate >= PerformanceThresholds.ON_TRACK) return PerformanceColors.ON_TRACK;
  if (achievementRate >= PerformanceThresholds.NEEDS_BOOST) return PerformanceColors.NEEDS_BOOST;
  return PerformanceColors.RECOVERY_MODE;
}
