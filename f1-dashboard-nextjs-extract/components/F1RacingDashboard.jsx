import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Import F1 Dashboard Components
import TeamRacingView from './TeamRacingView';
import PitCrewView from './PitCrewView';
import TotalProgressView from './TotalProgressView';

// Import utility functions  
import { processExcelData } from '@/utils/excelProcessor';
import * as XLSX from 'xlsx';

/**
 * F1 Racing Dashboard - Main Component for Next.js Integration
 * 
 * This component provides the complete F1 Racing Dashboard functionality
 * as a single, self-contained component that can be integrated into any Next.js page.
 * 
 * Features:
 * - Excel file upload and processing
 * - Team Racing view with Monaco & Kyalami circuits
 * - Pit Crew view showing consultants grouped by supervisors
 * - Total Progress view with performance metrics
 * - Corporate banking theme with F1 racing metaphor
 * 
 * @param {Object} props
 * @param {Array} props.initialTeams - Optional initial teams data
 * @param {Array} props.initialConsultants - Optional initial consultants data
 * @param {Object} props.initialMetrics - Optional initial metrics data
 * @param {Function} props.onDataProcessed - Callback when Excel data is processed
 * @param {string} props.className - Additional CSS classes
 */
export default function F1RacingDashboard({ 
  initialTeams = [], 
  initialConsultants = [], 
  initialMetrics = null,
  onDataProcessed = () => {},
  className = '' 
}) {
  const [teamsData, setTeamsData] = useState(initialTeams);
  const [consultantsData, setConsultantsData] = useState(initialConsultants);
  const [metricsData, setMetricsData] = useState(initialMetrics);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('team-racing');
  const { toast } = useToast();

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an Excel file (.xlsx or .xls)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // First read the Excel file
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

      // Process the raw data
      const result = await processExcelData(rawData);
      
      setTeamsData(result.teams || []);
      setConsultantsData(result.consultants || []);
      setMetricsData(result.company || null);
      
      // Call optional callback with processed data
      onDataProcessed({
        teams: result.teams,
        consultants: result.consultants,
        metrics: result.company
      });

      toast({
        title: "File Processed Successfully",
        description: `Loaded ${result.teams?.length || 0} teams and ${result.consultants?.length || 0} consultants`,
      });
    } catch (error) {
      console.error('File processing error:', error);
      toast({
        title: "Processing Error",
        description: error.message || "Failed to process the Excel file",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = () => {
    setTeamsData([]);
    setConsultantsData([]);
    setMetricsData(null);
    toast({
      title: "Data Cleared",
      description: "All dashboard data has been cleared",
    });
  };

  const hasData = teamsData.length > 0 || consultantsData.length > 0;

  return (
    <div className={`f1-racing-dashboard ${className}`}>
      <div className="space-y-6">
        {/* Header Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-racing text-racing-navy">
              🏁 F1 Racing Sales Dashboard
            </CardTitle>
            <p className="text-muted-foreground">
              Transform your sales data into an engaging Formula 1 racing experience
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1">
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-racing-orange file:text-white hover:file:bg-racing-orange/90"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Upload Excel file with sales performance data
                </p>
              </div>
              {hasData && (
                <Button 
                  variant="outline" 
                  onClick={handleClearData}
                  className="text-racing-red border-racing-red hover:bg-racing-red hover:text-white"
                >
                  Clear Data
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 border-4 border-racing-orange border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-muted-foreground">Processing Excel file...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Content */}
        {hasData && !isLoading && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="team-racing" className="font-racing">
                🏎️ Team Racing
              </TabsTrigger>
              <TabsTrigger value="pit-crew" className="font-racing">
                👥 Pit Crew
              </TabsTrigger>
              <TabsTrigger value="progress" className="font-racing">
                📊 Progress
              </TabsTrigger>
            </TabsList>

            <TabsContent value="team-racing" className="space-y-4">
              <TeamRacingView teams={teamsData} />
            </TabsContent>

            <TabsContent value="pit-crew" className="space-y-4">
              <PitCrewView consultants={consultantsData} teams={teamsData} />
            </TabsContent>

            <TabsContent value="progress" className="space-y-4">
              <TotalProgressView metrics={metricsData} teams={teamsData} />
            </TabsContent>
          </Tabs>
        )}

        {/* Empty State */}
        {!hasData && !isLoading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="text-6xl">🏁</div>
                <h3 className="text-xl font-semibold">Ready to Start Racing!</h3>
                <p className="text-muted-foreground max-w-md">
                  Upload your Excel file with sales performance data to transform it into an exciting F1 racing dashboard experience.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}