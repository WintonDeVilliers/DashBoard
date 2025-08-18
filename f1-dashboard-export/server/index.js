import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { ExcelProcessor } from '../shared/excelProcessor.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// In-memory storage for demo (replace with database in production)
let currentData = {
  consultants: [],
  teams: [],
  companyMetrics: null
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'F1 Dashboard API is running' });
});

app.post('/api/upload-excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Process the Excel file
    const processedData = await ExcelProcessor.processFile(req.file);
    
    // Store in memory (replace with database save in production)
    currentData = {
      consultants: processedData.consultants,
      teams: processedData.teams,
      companyMetrics: processedData.summary
    };

    res.json({
      success: true,
      message: 'Excel file processed successfully',
      data: {
        consultantsCount: processedData.consultants.length,
        teamsCount: processedData.teams.length,
        totalSales: processedData.summary.totalSales
      }
    });
  } catch (error) {
    console.error('Excel processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process Excel file', 
      details: error.message 
    });
  }
});

app.get('/api/consultants', (req, res) => {
  res.json(currentData.consultants);
});

app.get('/api/teams', (req, res) => {
  res.json(currentData.teams);
});

app.get('/api/company-metrics', (req, res) => {
  if (!currentData.companyMetrics) {
    return res.json({
      totalConsultants: 0,
      averageAchievement: 0,
      topPerformer: null,
      totalRevenue: 0,
      total_supervisors: 0,
      performance_distribution: {
        superstar: 0,
        target_achieved: 0,
        on_track: 0,
        needs_boost: 0,
        recovery_mode: 0
      },
      monthly_progress: null
    });
  }

  // Calculate enhanced metrics
  const metrics = {
    totalConsultants: currentData.consultants.length,
    averageAchievement: currentData.consultants.length > 0 
      ? currentData.consultants.reduce((sum, c) => sum + c.achievement_rate, 0) / currentData.consultants.length 
      : 0,
    topPerformer: currentData.consultants.length > 0 
      ? currentData.consultants.reduce((prev, current) => 
          (prev.achievement_rate > current.achievement_rate) ? prev : current
        ).name
      : null,
    totalRevenue: currentData.companyMetrics.totalSales,
    total_supervisors: currentData.teams.length,
    performance_distribution: calculatePerformanceDistribution(currentData.consultants),
    monthly_progress: null // Placeholder for future enhancement
  };

  res.json(metrics);
});

// Helper function to calculate performance distribution
function calculatePerformanceDistribution(consultants) {
  const distribution = {
    superstar: 0,
    target_achieved: 0,
    on_track: 0,
    needs_boost: 0,
    recovery_mode: 0
  };

  consultants.forEach(consultant => {
    const rate = consultant.achievement_rate;
    if (rate >= 120) distribution.superstar++;
    else if (rate >= 100) distribution.target_achieved++;
    else if (rate >= 80) distribution.on_track++;
    else if (rate >= 60) distribution.needs_boost++;
    else distribution.recovery_mode++;
  });

  return distribution;
}

app.listen(PORT, () => {
  console.log(`F1 Dashboard API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;