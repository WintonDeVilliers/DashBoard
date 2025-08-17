import pandas as pd
import numpy as np
import streamlit as st

class DataProcessor:
    """Handles data processing for the Formula 1 sales dashboard"""
    
    def __init__(self):
        self.required_columns = ['salesperson', 'current_sales', 'target']
    
    def process_excel_file(self, uploaded_file):
        """Process uploaded Excel file and return cleaned DataFrame"""
        try:
            # Try to read the specific sheets we know about
            try:
                df = pd.read_excel(uploaded_file, sheet_name='Sales Perfromance')  # Note: typo in sheet name
            except:
                try:
                    df = pd.read_excel(uploaded_file, sheet_name='Sales Performance')
                except:
                    # If specific sheet doesn't exist, read the first sheet
                    df = pd.read_excel(uploaded_file)
            
            # Clean and standardize column names safely
            df.columns = [str(col).lower().strip().replace(' ', '_').replace('%', 'pct') for col in df.columns]
            
            # Map specific columns from the Direct Sales Gamification file
            column_mapping = {
                'consultant_name': 'salesperson',
                'supervisor_name': 'supervisor',
                'totalsalesval': 'current_sales',
                'salesvaltarget': 'target',
                'sales_val_pct_to_target': 'achievement_rate_raw',
                'totalrealappsval': 'apps_actual',
                'realappstarget': 'apps_target',
                'real_apps_pct_to_target': 'apps_achievement_rate'
            }
            
            # Apply column mapping
            for old_col, new_col in column_mapping.items():
                if old_col in df.columns:
                    df = df.rename(columns={old_col: new_col})
            
            # If we still don't have the required columns, try more generic mapping
            if 'salesperson' not in df.columns:
                # Look for name columns
                name_cols = [col for col in df.columns if 'name' in col and not 'supervisor' in col]
                if name_cols:
                    df = df.rename(columns={name_cols[0]: 'salesperson'})
            
            if 'current_sales' not in df.columns:
                # Look for sales columns
                sales_cols = [col for col in df.columns if ('sales' in col or 'val' in col) and 'target' not in col]
                if sales_cols:
                    df = df.rename(columns={sales_cols[0]: 'current_sales'})
            
            if 'target' not in df.columns:
                # Look for target columns
                target_cols = [col for col in df.columns if 'target' in col and ('sales' in col or 'val' in col)]
                if target_cols:
                    df = df.rename(columns={target_cols[0]: 'target'})
            
            # Validate required columns
            missing_cols = [col for col in self.required_columns if col not in df.columns]
            if missing_cols:
                # Show available columns for debugging
                available_cols = list(df.columns)
                raise ValueError(f"Missing required columns: {missing_cols}. Available columns: {available_cols}")
            
            # Clean and process the data
            df = self._clean_data(df)
            
            # Calculate performance metrics
            df = self._calculate_metrics(df)
            
            return df
            
        except Exception as e:
            raise Exception(f"Error processing Excel file: {str(e)}")
    
    def _clean_data(self, df):
        """Clean and validate the data"""
        # Remove rows with missing essential data
        df = df.dropna(subset=self.required_columns)
        
        # Convert sales columns to numeric
        for col in ['current_sales', 'target']:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # Remove rows with invalid numeric data
        df = df.dropna(subset=['current_sales', 'target'])
        
        # Ensure positive values
        df = df[(df['current_sales'] >= 0) & (df['target'] > 0)]
        
        # Clean salesperson names
        df['salesperson'] = df['salesperson'].astype(str).str.strip()
        
        return df
    
    def _calculate_metrics(self, df):
        """Calculate performance metrics for racing dashboard"""
        # Calculate achievement rate
        df['achievement_rate'] = (df['current_sales'] / df['target']) * 100
        
        # Calculate gap to target
        df['gap_to_target'] = df['target'] - df['current_sales']
        
        # Add performance categories
        df['performance_category'] = df['achievement_rate'].apply(self._categorize_performance)
        
        # Add vehicle types based on performance
        df['vehicle_type'] = df['achievement_rate'].apply(self._assign_vehicle)
        
        # Add racing position
        df['racing_position'] = df['achievement_rate'].rank(ascending=False, method='min')
        
        return df
    
    def _categorize_performance(self, achievement_rate):
        """Categorize performance into racing tiers"""
        if achievement_rate >= 120:
            return "Superstar"
        elif achievement_rate >= 100:
            return "Target Achieved"
        elif achievement_rate >= 80:
            return "On Track"
        elif achievement_rate >= 60:
            return "Needs Boost"
        else:
            return "Recovery Mode"
    
    def _assign_vehicle(self, achievement_rate):
        """Assign vehicle type based on performance"""
        if achievement_rate >= 120:
            return "🏎️"  # Formula 1 car
        elif achievement_rate >= 100:
            return "🚗"  # Sports car
        elif achievement_rate >= 80:
            return "🚙"  # SUV
        elif achievement_rate >= 60:
            return "🚐"  # Van
        else:
            return "🛻"  # Truck
    
    def calculate_team_performance(self, df, team_column='team'):
        """Calculate team-based performance metrics"""
        if team_column not in df.columns:
            return None
        
        team_stats = df.groupby(team_column).agg({
            'current_sales': 'sum',
            'target': 'sum',
            'achievement_rate': 'mean'
        }).reset_index()
        
        team_stats['team_achievement'] = (team_stats['current_sales'] / team_stats['target']) * 100
        team_stats['team_gap'] = team_stats['target'] - team_stats['current_sales']
        
        return team_stats
