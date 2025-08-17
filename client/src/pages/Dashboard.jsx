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

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch company metrics
  const { data: companyMetrics, isLoading: metricsLoading, error: metricsError, refetch: refetchMetrics } = useQuery({
    queryKey: ['/api/company-metrics'],
    retry: false
  });

  // Fetch team data
  const { data: teamData, isLoading: teamsLoading, refetch: refetchTeams } = useQuery({
    queryKey: ['/api/teams'],
    retry: false
  });

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
      const formData = new FormData();
      formData.append('excelFile', file);

      const response = await fetch('/api/upload-excel', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      toast({
        title: "Upload Successful",
        description: `Processed ${result.summary.consultants} consultants and ${result.summary.teams} teams`
      });

      // Refresh all data
      refetchMetrics();
      refetchTeams();
      
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
      {!companyMetrics && !metricsLoading && (
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

        {metricsLoading || teamsLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'total' && (
              <TotalProgressView 
                companyMetrics={companyMetrics}
                teamData={teamData}
              />
            )}
            {activeTab === 'teams' && (
              <TeamRacingView 
                teamData={teamData}
                companyMetrics={companyMetrics}
              />
            )}
            {activeTab === 'monaco' && (
              <MonacoCircuitView 
                teamData={teamData?.filter(team => team.circuit === 'monaco')}
                companyMetrics={companyMetrics}
              />
            )}
            {activeTab === 'kyalami' && (
              <KyalamiCircuitView 
                teamData={teamData?.filter(team => team.circuit === 'kyalami')}
                companyMetrics={companyMetrics}
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
