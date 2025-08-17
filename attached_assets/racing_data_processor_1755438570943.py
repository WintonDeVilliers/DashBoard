import pandas as pd
import numpy as np
from datetime import datetime

class RacingDataProcessor:
    """Specialized data processor for racing gamification dashboard"""
    
    def __init__(self, excel_file_path):
        self.excel_file_path = excel_file_path
        self.raw_data = None
        self.processed_data = None
        
    def load_sales_performance_data(self):
        """Load and process the Sales Performance sheet"""
        try:
            # Read the Sales Performance sheet
            self.raw_data = pd.read_excel(self.excel_file_path, sheet_name='Sales Perfromance')
            return self.raw_data
        except Exception as e:
            raise Exception(f"Error loading Sales Performance data: {str(e)}")
    
    def process_for_racing_dashboard(self):
        """Process data specifically for racing dashboard views"""
        if self.raw_data is None:
            self.load_sales_performance_data()
        
        df = self.raw_data.copy()
        
        # Clean and standardize the data
        df = self.clean_data(df)
        
        # Calculate racing metrics
        df = self.calculate_racing_metrics(df)
        
        # Add racing positions and lap information
        df = self.add_racing_positions(df)
        
        self.processed_data = df
        return df
    
    def clean_data(self, df):
        """Clean and standardize the sales data"""
        # Remove rows with missing consultant names
        df = df.dropna(subset=['Consultant Name'])
        
        # Fill missing supervisor names
        df['Supervisor Name'] = df['Supervisor Name'].fillna('Unassigned')
        
        # Ensure numeric columns are properly formatted
        numeric_columns = [
            'RealAppsTarget', 'TotalRealAppsVol', 'Real Apps % to Target',
            'SalesValTarget', 'TotalSalesVal', 'Sales Val % to Target',
            'LoanDealsVol', 'LoanSaleVal', 'CardDealsVol', 'CardSaleVal',
            'CreditCardDealTarget', 'Creditcard  % to target'
        ]
        
        for col in numeric_columns:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        
        return df
    
    def calculate_racing_metrics(self, df):
        """Calculate metrics needed for racing dashboard"""
        # Primary achievement rate (Sales Value)
        df['primary_achievement'] = df['Sales Val % to Target'].fillna(0)
        
        # Secondary achievement rate (Real Apps)
        df['secondary_achievement'] = df['Real Apps % to Target'].fillna(0)
        
        # Overall performance score (weighted average)
        df['overall_performance'] = (df['primary_achievement'] * 0.7 + df['secondary_achievement'] * 0.3)
        
        # Racing speed calculation (for vehicle movement)
        df['racing_speed'] = np.clip(df['overall_performance'] / 100, 0, 1.5)  # Cap at 150%
        
        # Performance category for vehicle type
        df['vehicle_type'] = df['overall_performance'].apply(self.get_vehicle_type)
        
        # Performance color
        df['performance_color'] = df['overall_performance'].apply(self.get_performance_color)
        
        return df
    
    def get_vehicle_type(self, performance):
        """Assign vehicle type based on performance"""
        if performance >= 120:
            return "🏎️"  # Formula 1 car - top performers
        elif performance >= 100:
            return "🚗"   # Sports car - target achievers
        elif performance >= 80:
            return "🚙"   # SUV - on track
        elif performance >= 60:
            return "🚐"   # Van - needs boost
        else:
            return "🛻"   # Truck - recovery mode
    
    def get_performance_color(self, performance):
        """Get color based on performance level"""
        if performance >= 120:
            return "#FF6B35"  # Orange-red for superstars
        elif performance >= 100:
            return "#4ECDC4"  # Teal for target achieved
        elif performance >= 80:
            return "#45B7D1"  # Blue for on track
        elif performance >= 60:
            return "#FFA07A"  # Light salmon for needs boost
        else:
            return "#FF6B6B"  # Red for recovery mode
    
    def add_racing_positions(self, df):
        """Add racing positions and lap information"""
        # Sort by overall performance
        df = df.sort_values('overall_performance', ascending=False).reset_index(drop=True)
        
        # Add race positions
        df['race_position'] = range(1, len(df) + 1)
        
        # Calculate lap progress (based on performance percentage)
        df['lap_progress'] = df['overall_performance'] / 100
        df['completed_laps'] = np.floor(df['lap_progress'])
        df['current_lap_progress'] = df['lap_progress'] - df['completed_laps']
        
        # Track position (for racing view)
        max_performance = df['overall_performance'].max()
        df['track_position'] = (df['overall_performance'] / max_performance) * 100
        
        return df
    
    def get_team_summary(self):
        """Get team-level summary for gauge view"""
        if self.processed_data is None:
            self.process_for_racing_dashboard()
        
        df = self.processed_data
        
        # Group by supervisor (team)
        team_summary = df.groupby('Supervisor Name').agg({
            'SalesValTarget': 'sum',
            'TotalSalesVal': 'sum',
            'RealAppsTarget': 'sum',
            'TotalRealAppsVol': 'sum',
            'overall_performance': 'mean',
            'Consultant Name': 'count'
        }).reset_index()
        
        # Calculate team achievement rates
        team_summary['team_sales_achievement'] = (
            team_summary['TotalSalesVal'] / team_summary['SalesValTarget'] * 100
        ).fillna(0)
        
        team_summary['team_apps_achievement'] = (
            team_summary['TotalRealAppsVol'] / team_summary['RealAppsTarget'] * 100
        ).fillna(0)
        
        # Rename columns for clarity
        team_summary = team_summary.rename(columns={
            'Supervisor Name': 'team_name',
            'Consultant Name': 'team_size',
            'overall_performance': 'avg_performance'
        })
        
        # Sort alphabetically by team name
        team_summary = team_summary.sort_values('team_name')
        
        return team_summary
    
    def get_total_company_metrics(self):
        """Get company-wide metrics for total gauge"""
        if self.processed_data is None:
            self.process_for_racing_dashboard()
        
        df = self.processed_data
        
        total_metrics = {
            'total_sales_target': df['SalesValTarget'].sum(),
            'total_sales_actual': df['TotalSalesVal'].sum(),
            'total_apps_target': df['RealAppsTarget'].sum(),
            'total_apps_actual': df['TotalRealAppsVol'].sum(),
            'overall_sales_achievement': (df['TotalSalesVal'].sum() / df['SalesValTarget'].sum() * 100) if df['SalesValTarget'].sum() > 0 else 0,
            'overall_apps_achievement': (df['TotalRealAppsVol'].sum() / df['RealAppsTarget'].sum() * 100) if df['RealAppsTarget'].sum() > 0 else 0,
            'avg_individual_performance': df['overall_performance'].mean(),
            'total_consultants': len(df),
            'top_performer': df.loc[df['overall_performance'].idxmax(), 'Consultant Name'] if not df.empty else 'N/A'
        }
        
        return total_metrics
    
    def get_racing_leaderboard(self, top_n=10):
        """Get top performers for racing view"""
        if self.processed_data is None:
            self.process_for_racing_dashboard()
        
        df = self.processed_data.head(top_n)
        
        return df[['Consultant Name', 'Supervisor Name', 'overall_performance', 
                  'vehicle_type', 'performance_color', 'race_position', 
                  'track_position', 'TotalSalesVal', 'SalesValTarget',
                  'lap_progress', 'completed_laps', 'current_lap_progress']].copy()
    
    def get_racing_leaderboard_by_race(self, race_name='Monaco', top_n=10):
        """Get top performers filtered by race (Monaco or Kyalami)"""
        if self.processed_data is None:
            self.process_for_racing_dashboard()
        
        df = self.processed_data.copy()
        
        # Filter by race based on actual supervisor assignments
        monaco_supervisors = [
            'Ashley Moyo', 'Mixo Makhubele', 'Nonhle Zondi', 'Rodney Naidu',
            'Samantha Govender', 'Samuel Masubelele', 'Taedi Moletsane', 
            'Thabo Mosweu', 'Thobile Phakhathi'
        ]
        
        kyalami_supervisors = [
            'Busisiwe Mabuza', 'Cindy Visser', 'Matimba Ngobeni', 'Mfundo Mdlalose',
            'Mondli Nhlapho', 'Mosima Moshidi', 'Salome Baloyi', 'Shadleigh White', 'Tshepo Moeketsi'
        ]
        
        if race_name == 'Monaco':
            df = df[df['Supervisor Name'].isin(monaco_supervisors)]
        elif race_name == 'Kyalami':
            df = df[df['Supervisor Name'].isin(kyalami_supervisors)]
        
        # Re-rank within the race
        df = df.sort_values('overall_performance', ascending=False).reset_index(drop=True)
        df['race_position'] = range(1, len(df) + 1)
        
        # Update track positions relative to race leaders
        if not df.empty:
            max_performance = df['overall_performance'].max()
            df['track_position'] = (df['overall_performance'] / max_performance) * 100
        
        # Add lap progress data for course map
        df['lap_progress'] = df['overall_performance'] / 100
        df['completed_laps'] = np.floor(df['lap_progress'])
        df['current_lap_progress'] = df['lap_progress'] - df['completed_laps']
        
        return df.head(top_n)[['Consultant Name', 'Supervisor Name', 'overall_performance', 
                              'vehicle_type', 'performance_color', 'race_position', 
                              'track_position', 'TotalSalesVal', 'SalesValTarget',
                              'lap_progress', 'completed_laps', 'current_lap_progress']].copy()
    
    def get_race_teams_split(self):
        """Get teams split between Monaco and Kyalami races"""
        if self.processed_data is None:
            self.process_for_racing_dashboard()
        
        df = self.processed_data
        teams = df['Supervisor Name'].unique()
        
        # Use actual supervisor assignments
        monaco_teams = [
            'Ashley Moyo', 'Mixo Makhubele', 'Nonhle Zondi', 'Rodney Naidu',
            'Samantha Govender', 'Samuel Masubelele', 'Taedi Moletsane', 
            'Thabo Mosweu', 'Thobile Phakhathi'
        ]
        
        kyalami_teams = [
            'Busisiwe Mabuza', 'Cindy Visser', 'Matimba Ngobeni', 'Mfundo Mdlalose',
            'Mondli Nhlapho', 'Mosima Moshidi', 'Salome Baloyi', 'Shadleigh White', 'Tshepo Moeketsi'
        ]
        
        return {
            'Monaco': sorted(monaco_teams),
            'Kyalami': sorted(kyalami_teams)
        }
    
    def get_team_summary_by_race(self, race_name='Monaco'):
        """Get team-level summary filtered by race"""
        if self.processed_data is None:
            self.process_for_racing_dashboard()
        
        df = self.processed_data.copy()
        
        # Filter by race based on actual supervisor assignments
        monaco_supervisors = [
            'Ashley Moyo', 'Mixo Makhubele', 'Nonhle Zondi', 'Rodney Naidu',
            'Samantha Govender', 'Samuel Masubelele', 'Taedi Moletsane', 
            'Thabo Mosweu', 'Thobile Phakhathi'
        ]
        
        kyalami_supervisors = [
            'Busisiwe Mabuza', 'Cindy Visser', 'Matimba Ngobeni', 'Mfundo Mdlalose',
            'Mondli Nhlapho', 'Mosima Moshidi', 'Salome Baloyi', 'Shadleigh White', 'Tshepo Moeketsi'
        ]
        
        if race_name == 'Monaco':
            df = df[df['Supervisor Name'].isin(monaco_supervisors)]
        elif race_name == 'Kyalami':
            df = df[df['Supervisor Name'].isin(kyalami_supervisors)]
        
        # Group by supervisor (team)
        team_summary = df.groupby('Supervisor Name').agg({
            'SalesValTarget': 'sum',
            'TotalSalesVal': 'sum',
            'RealAppsTarget': 'sum',
            'TotalRealAppsVol': 'sum',
            'overall_performance': 'mean',
            'Consultant Name': 'count'
        }).reset_index()
        
        # Calculate team achievement rates
        team_summary['team_sales_achievement'] = (
            team_summary['TotalSalesVal'] / team_summary['SalesValTarget'] * 100
        ).fillna(0)
        
        team_summary['team_apps_achievement'] = (
            team_summary['TotalRealAppsVol'] / team_summary['RealAppsTarget'] * 100
        ).fillna(0)
        
        # Rename columns for clarity
        team_summary = team_summary.rename(columns={
            'Supervisor Name': 'team_name',
            'Consultant Name': 'team_size',
            'overall_performance': 'avg_performance'
        })
        
        # Sort by team achievement
        team_summary = team_summary.sort_values('team_sales_achievement', ascending=False)
        
        return team_summary