import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import TotalProgressView from '../components/TotalProgressView';
import TeamRacingView from '../components/TeamRacingView';
import MonacoCircuitView from '../components/MonacoCircuitView';
import KyalamiCircuitView from '../components/KyalamiCircuitView';
import PitCrewView from '../components/PitCrewView';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import styles from '../styles/Dashboard.module.css';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('total');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [uploadingFile, setUploadingFile] = useState(false);
  const { toast } = useToast();
  
  // Function to clear local storage data
  const clearLocalData = () => {
    localStorage.removeItem('f1DashboardData');
    localStorage.removeItem('f1DashboardSummary');
    setLocalData(null);
    toast({
      title: "Data Cleared",
      description: "Local data has been cleared. Please upload a new file.",
    });
  };
  
  // Client-side Excel processing function to work around API routing issues
  const processExcelDataClientSide = async (rawData, sheetName) => {
    console.log('Raw data sample:', rawData[0]);
    console.log('Available columns in Excel:', Object.keys(rawData[0]));
    
    const ExcelColumnMappings = {
      name: ['Consultant Name', 'Name', 'Full Name', 'Employee Name'],
      supervisor: ['Supervisor Name', 'Supervisor', 'Team Lead', 'Manager'],
      achievement: ['Sales Val % to Target', 'Achievement %', 'Achievement Rate'],
      target: ['SalesValTarget', 'Target', 'Goal', 'Quota'],
      sales: ['TotalSalesVal', 'Sales', 'Actual Sales', 'Revenue'],
      team: ['Team', 'Team Name', 'Department', 'Division'],
      role: ['Role', 'Position', 'Job Title']
    };
    
    const availableColumns = Object.keys(rawData[0]);
    const mappings = {};
    
    for (const [field, variations] of Object.entries(ExcelColumnMappings)) {
      for (const variation of variations) {
        const found = availableColumns.find(col => 
          col === variation || // Exact match first
          col.toLowerCase().includes(variation.toLowerCase()) ||
          variation.toLowerCase().includes(col.toLowerCase())
        );
        if (found) {
          mappings[field] = found;
          break;
        }
      }
    }
    
    console.log('Column mappings found:', mappings);
    
    if (!mappings.name) {
      throw new Error(`Name column not found. Available: ${availableColumns.join(', ')}`);
    }
    
    const processedData = rawData.map((row, index) => {
      const name = row[mappings.name];
      if (!name || name.toString().trim() === '') return null;
      
      // Use correct column mapping for achievement rate (Sales Val % to Target)
      let achievementRate = 0;
      if (row['Sales Val % to Target']) {
        const rawValue = parseFloat(row['Sales Val % to Target']);
        // The data appears to be in decimal format (0.77 = 77%), so multiply by 100
        achievementRate = rawValue * 100;
      } else if (row['SalesValTarget'] && row['TotalSalesVal']) {
        const sales = parseFloat(row['TotalSalesVal']) || 0;
        const target = parseFloat(row['SalesValTarget']) || 0;
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
      
      const supervisorName = mappings.supervisor ? row[mappings.supervisor] : (row['Supervisor Name'] || 'Unknown Supervisor');
      console.log(`${name}: Achievement ${achievementRate}% (Supervisor: ${supervisorName})`);
      
      return {
        id: `${name.replace(/\s+/g, '_')}_${index}`,
        name: name.toString().trim(),
        team: supervisorName.toString().trim(), // Use supervisor as team
        role: 'Consultant',
        achievementRate: Math.round(achievementRate * 100) / 100,
        target: parseFloat(mappings.target ? row[mappings.target] : row['SalesValTarget']) || 0,
        sales: parseFloat(mappings.sales ? row[mappings.sales] : row['TotalSalesVal']) || 0,
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
  
  // Transform local data to match component expectations
  const displayData = localData ? (() => {
    const consultants = localData.data;
    
    // Group consultants by supervisor (team)
    const teamGroups = consultants.reduce((groups, consultant) => {
      const supervisorName = consultant.team || 'Unknown Supervisor';
      if (!groups[supervisorName]) {
        groups[supervisorName] = [];
      }
      groups[supervisorName].push(consultant);
      return groups;
    }, {});
    
    console.log('Team groups created:', Object.keys(teamGroups), 'teams with members:', Object.values(teamGroups).map(team => team.length));
    
    // Convert to team racing format
    const teams = Object.entries(teamGroups).map(([supervisorName, teamMembers], index) => {
      const teamAchievement = teamMembers.reduce((sum, member) => sum + member.achievementRate, 0) / teamMembers.length;
      const teamTarget = teamMembers.reduce((sum, member) => sum + member.target, 0);
      const teamSales = teamMembers.reduce((sum, member) => sum + member.sales, 0);
      
      // Determine performance color based on achievement
      let performanceColor = '#ef4444'; // red for low performance
      if (teamAchievement >= 120) performanceColor = '#22c55e'; // green for superstar
      else if (teamAchievement >= 100) performanceColor = '#3b82f6'; // blue for target achieved
      else if (teamAchievement >= 80) performanceColor = '#f59e0b'; // yellow for on track
      else if (teamAchievement >= 60) performanceColor = '#f97316'; // orange for needs boost
      
      return {
        id: `team_${index}`,
        supervisor_name: supervisorName,
        team_achievement_rate: teamAchievement,
        team_size: teamMembers.length,
        avg_performance: teamAchievement,
        total_sales: teamSales,
        team_target: teamTarget,
        track_position: Math.min(teamAchievement, 100),
        vehicle_type: '🏎️',
        performance_color: performanceColor,
        circuit: teamMembers[0]?.circuit || 'Monaco'
      };
    });
    
    console.log('Transformed teams data:', teams);
    
    const companyMetrics = {
      totalConsultants: consultants.length,
      averageAchievement: Math.round(consultants.reduce((sum, p) => sum + p.achievementRate, 0) / consultants.length),
      topPerformer: consultants[0]?.name || 'N/A',
      totalRevenue: consultants.reduce((sum, p) => sum + p.sales, 0),
      total_supervisors: teams.length,
      performance_distribution: {
        superstar: consultants.filter(c => c.achievementRate >= 120).length,
        target_achieved: consultants.filter(c => c.achievementRate >= 100 && c.achievementRate < 120).length,
        on_track: consultants.filter(c => c.achievementRate >= 80 && c.achievementRate < 100).length,
        needs_boost: consultants.filter(c => c.achievementRate >= 60 && c.achievementRate < 80).length,
        recovery_mode: consultants.filter(c => c.achievementRate < 60).length
      },
      monthly_progress: null // No monthly data from Excel
    };
    
    console.log('Generated company metrics:', companyMetrics);
    
    return {
      teams: teams,
      companyMetrics: companyMetrics
    };
  })() : {
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
    { id: 'pitcrew', label: '🔧 Pit Crew', icon: '🔧' },
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
            {activeTab === 'pitcrew' && localData && (
              <PitCrewView 
                consultants={localData.data}
                teams={displayData.teams}
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
        {localData && (
          <Button
            data-testid="clear-data-btn"
            onClick={clearLocalData}
            className={styles.clearBtn}
            size="icon"
            variant="outline"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </Button>
        )}
      </div>
    </div>
  );
}
