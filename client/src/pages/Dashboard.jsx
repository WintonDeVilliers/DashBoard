import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import TotalProgressView from '../components/TotalProgressView';
import TeamRacingView from '../components/TeamRacingView';
import MonacoCircuitView from '../components/MonacoCircuitView';
import KyalamiCircuitView from '../components/KyalamiCircuitView';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import styles from '../styles/Dashboard.module.css';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('total');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [uploadingFile, setUploadingFile] = useState(false);
  const { toast } = useToast();
  
  // Client-side Excel processing function to work around API routing issues
  const processExcelDataClientSide = async (rawData, sheetName) => {
    const ExcelColumnMappings = {
      name: ['Name', 'Full Name', 'Employee Name', 'Supervisor', 'Consultant'],
      achievement: ['Achievement %', 'Achievement Rate', 'Achievement', '% Achievement'],
      target: ['Target', 'Goal', 'Quota', 'Target Amount'],
      sales: ['Sales', 'Actual Sales', 'Revenue', 'Sales Amount'],
      team: ['Team', 'Team Name', 'Department', 'Division'],
      role: ['Role', 'Position', 'Job Title']
    };
    
    const availableColumns = Object.keys(rawData[0]);
    const mappings = {};
    
    for (const [field, variations] of Object.entries(ExcelColumnMappings)) {
      for (const variation of variations) {
        const found = availableColumns.find(col => 
          col.toLowerCase().includes(variation.toLowerCase()) ||
          variation.toLowerCase().includes(col.toLowerCase())
        );
        if (found) {
          mappings[field] = found;
          break;
        }
      }
    }
    
    if (!mappings.name) {
      throw new Error(`Name column not found. Available: ${availableColumns.join(', ')}`);
    }
    
    const processedData = rawData.map((row, index) => {
      const name = row[mappings.name];
      if (!name || name.toString().trim() === '') return null;
      
      let achievementRate = 0;
      if (mappings.achievement && row[mappings.achievement]) {
        achievementRate = parseFloat(row[mappings.achievement].toString().replace('%', '').trim()) || 0;
      } else if (mappings.sales && mappings.target) {
        const sales = parseFloat(row[mappings.sales]) || 0;
        const target = parseFloat(row[mappings.target]) || 0;
        achievementRate = target > 0 ? (sales / target) * 100 : 0;
      }
      
      let performanceLevel = 'Recovery Mode';
      let vehicleType = 'Entry Level';
      if (achievementRate >= 120) {
        performanceLevel = 'Superstar';
        vehicleType = 'Formula 1';
      } else if (achievementRate >= 100) {
        performanceLevel = 'Target Achieved';
        vehicleType = 'Sports Car';
      } else if (achievementRate >= 80) {
        performanceLevel = 'On Track';
        vehicleType = 'Touring Car';
      } else if (achievementRate >= 60) {
        performanceLevel = 'Needs Boost';
        vehicleType = 'Compact Car';
      }
      
      return {
        id: `${name.replace(/\s+/g, '_')}_${index}`,
        name: name.toString().trim(),
        team: mappings.team ? (row[mappings.team] || 'Default Team').toString().trim() : 'Default Team',
        role: mappings.role ? (row[mappings.role] || 'Consultant').toString().trim() : 'Consultant',
        achievementRate: Math.round(achievementRate * 100) / 100,
        target: mappings.target ? parseFloat(row[mappings.target]) || 0 : 0,
        sales: mappings.sales ? parseFloat(row[mappings.sales]) || 0 : 0,
        performanceLevel,
        vehicleType,
        circuit: Math.random() > 0.5 ? 'Monaco' : 'Kyalami',
        position: index + 1
      };
    }).filter(row => row !== null);
    
    processedData.sort((a, b) => b.achievementRate - a.achievementRate);
    processedData.forEach((person, index) => { person.position = index + 1; });
    
    return { 
      data: processedData, 
      summary: { totalRecords: processedData.length, sheetName, mappingsUsed: mappings }
    };
  };

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check for locally stored data first, then fall back to API
  const [localData, setLocalData] = useState(null);
  
  useEffect(() => {
    const storedData = localStorage.getItem('f1DashboardData');
    const storedSummary = localStorage.getItem('f1DashboardSummary');
    if (storedData && storedSummary) {
      setLocalData({
        data: JSON.parse(storedData),
        summary: JSON.parse(storedSummary)
      });
    }
  }, []);

  // Fetch company metrics (with fallback to local data)
  const { data: companyMetrics, isLoading: metricsLoading, error: metricsError, refetch: refetchMetrics } = useQuery({
    queryKey: ['/api/company-metrics'],
    retry: false,
    enabled: !localData // Only fetch from API if no local data
  });

  // Fetch team data (with fallback to local data)
  const { data: teamData, isLoading: teamsLoading, refetch: refetchTeams } = useQuery({
    queryKey: ['/api/teams'],
    retry: false,
    enabled: !localData // Only fetch from API if no local data
  });
  
  // Use local data if available, otherwise use API data
  const displayData = localData ? {
    teams: localData.data,
    companyMetrics: {
      totalConsultants: localData.data.length,
      averageAchievement: Math.round(localData.data.reduce((sum, p) => sum + p.achievementRate, 0) / localData.data.length),
      topPerformer: localData.data[0]?.name || 'N/A',
      totalRevenue: localData.data.reduce((sum, p) => sum + p.sales, 0)
    }
  } : {
    teams: teamData,
    companyMetrics: companyMetrics
  };

  // Analyze Excel file structure
  const analyzeExcelFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append('excelFile', file);

      const response = await fetch('/api/analyze-excel', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status} ${response.statusText}`);
      }

      const analysis = await response.json();
      console.log('Excel Analysis:', analysis);
      
      toast({
        title: "Excel Analysis Complete",
        description: `Found ${analysis.availableSheets.length} sheet(s). Processing...`
      });
      
      return analysis;
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not analyze Excel file structure"
      });
      throw error;
    }
  };

  // Handle Excel file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast({
        variant: "destructive",
        title: "Invalid File",
        description: "Please upload an Excel file (.xlsx or .xls)"
      });
      return;
    }

    setUploadingFile(true);
    
    try {
      // Use client-side Excel processing since the API routing is being intercepted by Vite
      console.log('Processing Excel file on client side...');
      console.log('File to upload:', file.name, 'Size:', file.size, 'Type:', file.type);
      
      // Read file as array buffer
      const fileBuffer = await file.arrayBuffer();
      
      // Import XLSX library (already loaded via CDN in index.html)
      if (typeof XLSX === 'undefined') {
        throw new Error('XLSX library not loaded. Please refresh the page.');
      }
      
      // Parse the Excel file
      const workbook = XLSX.read(fileBuffer, { type: 'array' });
      console.log('Available sheets:', workbook.SheetNames);
      
      // Look for common sheet names or use first sheet
      let sheetName = null;
      const commonSheetNames = ['Sales Performance', 'Sales', 'Data', 'Sheet1', 'Performance'];
      
      for (const commonName of commonSheetNames) {
        if (workbook.Sheets[commonName]) {
          sheetName = commonName;
          break;
        }
      }
      
      if (!sheetName) {
        sheetName = workbook.SheetNames[0];
      }
      
      if (!workbook.Sheets[sheetName]) {
        throw new Error('No valid worksheet found');
      }
      
      console.log('Using sheet:', sheetName);
      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      
      console.log('Raw data rows:', rawData.length);
      if (rawData.length > 0) {
        console.log('First row columns:', Object.keys(rawData[0]));
        console.log('Sample data:', rawData[0]);
      }
      
      if (rawData.length === 0) {
        throw new Error('Excel sheet is empty');
      }
      
      // Process the data client-side using the same logic from the server
      const result = await processExcelDataClientSide(rawData, sheetName);
      
      console.log('File uploaded and processed successfully:', result);
      
      // Store the data in localStorage to persist it temporarily
      localStorage.setItem('f1DashboardData', JSON.stringify(result.data));
      localStorage.setItem('f1DashboardSummary', JSON.stringify(result.summary));
      
      // Update local state immediately
      setLocalData({
        data: result.data,
        summary: result.summary
      });
      
      toast({
        title: "Excel Upload Success!",
        description: `Processed ${result.data.length} records from ${sheetName}. Your F1 racing leaderboard is ready!`
      });
      
      // Reset file input
      event.target.value = '';

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message
      });
    } finally {
      setUploadingFile(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    refetchMetrics();
    refetchTeams();
    toast({
      title: "Dashboard Refreshed",
      description: "Data updated successfully"
    });
  };

  const tabButtons = [
    { id: 'total', label: '🏆 Total Progress', icon: '🏆' },
    { id: 'teams', label: '🏁 Team Racing', icon: '🏁' },
    { id: 'monaco', label: '🇲🇨 Monaco', icon: '🇲🇨' },
    { id: 'kyalami', label: '🇿🇦 Kyalami', icon: '🇿🇦' }
  ];

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <span>F1</span>
            </div>
            <h1>SALES RACING DASHBOARD</h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className={styles.desktopNav}>
            {tabButtons.map(tab => (
              <Button
                key={tab.id}
                data-testid={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
                variant={activeTab === tab.id ? "default" : "secondary"}
              >
                {tab.label}
              </Button>
            ))}
          </nav>
          
          <div className={styles.headerRight}>
            <div className={styles.timeDisplay}>
              <div className={styles.sessionLabel}>Live Session</div>
              <div className={styles.currentTime} data-testid="current-time">
                {formatTime(currentTime)}
              </div>
            </div>
            <div className={styles.statusIndicator}></div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className={styles.mobileNav}>
        <div className={styles.mobileNavContent}>
          {tabButtons.map(tab => (
            <Button
              key={tab.id}
              data-testid={`mobile-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`${styles.mobileTabBtn} ${activeTab === tab.id ? styles.active : ''}`}
              variant={activeTab === tab.id ? "default" : "secondary"}
              size="sm"
            >
              {tab.icon} {tab.label.split(' ')[1] || tab.label}
            </Button>
          ))}
        </div>
      </nav>

      {/* File Upload Section */}
      {!displayData.companyMetrics && !localData && !metricsLoading && (
        <div className={styles.uploadSection}>
          <div className={styles.uploadCard}>
            <h2>Upload Sales Performance Data</h2>
            <p>Upload an Excel file with 'Sales Performance' worksheet to get started</p>
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={uploadingFile}
              data-testid="file-upload"
              className={styles.fileInput}
            />
            {uploadingFile && (
              <div className={styles.uploadingIndicator}>
                <div className={styles.spinner}></div>
                <span>Processing Excel file...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={styles.mainContent}>
        {metricsError && (
          <div className={styles.errorState}>
            <h2>No Data Available</h2>
            <p>Please upload an Excel file with sales performance data to view the dashboard.</p>
          </div>
        )}

        {!localData && (metricsLoading || teamsLoading) ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'total' && (
              <TotalProgressView 
                companyMetrics={displayData.companyMetrics}
                teamData={displayData.teams}
              />
            )}
            {activeTab === 'teams' && (
              <TeamRacingView 
                teamData={displayData.teams}
                companyMetrics={displayData.companyMetrics}
              />
            )}
            {activeTab === 'monaco' && (
              <MonacoCircuitView 
                teamData={displayData.teams?.filter(team => team.circuit === 'Monaco')}
                companyMetrics={displayData.companyMetrics}
              />
            )}
            {activeTab === 'kyalami' && (
              <KyalamiCircuitView 
                teamData={displayData.teams?.filter(team => team.circuit === 'Kyalami')}
                companyMetrics={displayData.companyMetrics}
              />
            )}
          </>
        )}
      </main>

      {/* Floating Action Button */}
      <div className={styles.floatingActions}>
        <Button
          data-testid="refresh-btn"
          onClick={handleRefresh}
          className={styles.refreshBtn}
          size="icon"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </Button>
      </div>
    </div>
  );
}
