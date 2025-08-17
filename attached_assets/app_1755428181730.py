import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import numpy as np
from datetime import datetime, timedelta
import io
import base64
import os
from utils.racing_data_processor import RacingDataProcessor
from utils.racing_visualizations import (
    create_total_gauge_view, 
    create_team_racing_view, 
    create_course_map_view,
    create_team_performance_summary
)

# Configure page
st.set_page_config(
    page_title="Sales Racing Dashboard",
    page_icon="🏁",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize session state
if 'racing_processor' not in st.session_state:
    st.session_state.racing_processor = None
if 'individual_data' not in st.session_state:
    st.session_state.individual_data = None
if 'team_data' not in st.session_state:
    st.session_state.team_data = None
if 'company_metrics' not in st.session_state:
    st.session_state.company_metrics = None
if 'last_update' not in st.session_state:
    st.session_state.last_update = None

def main():
    st.title("🏁 Sales Racing Dashboard")
    st.markdown("### Interactive Sales Gamification & Competition Tracking")
    
    # Sidebar for file upload and controls
    with st.sidebar:
        st.header("📁 Data Management")
        
        # File upload
        uploaded_file = st.file_uploader(
            "Upload Direct Sales Gamification Excel File",
            type=['xlsx', 'xls'],
            help="Upload your Excel file with Sales Performance sheet containing racing gamification data."
        )
        
        # Option to use existing file
        use_existing = st.checkbox("Use existing Direct Sales Gamification file", value=True)
        
        excel_file_path = None
        
        if use_existing:
            # Check if the file exists
            existing_file = "attached_assets/Direct Sales Gamification_Racing Targets_1755242584815_1755260744945.xlsx"
            if os.path.exists(existing_file):
                excel_file_path = existing_file
                st.success("✅ Using existing gamification file!")
            else:
                st.error("❌ Existing file not found. Please upload a new file.")
        
        if uploaded_file is not None:
            # Save uploaded file temporarily
            excel_file_path = f"temp_{uploaded_file.name}"
            with open(excel_file_path, "wb") as f:
                f.write(uploaded_file.getbuffer())
            st.success(f"✅ File uploaded successfully!")
        
        if excel_file_path:
            try:
                # Process racing data
                processor = RacingDataProcessor(excel_file_path)
                individual_data = processor.process_for_racing_dashboard()
                team_data = processor.get_team_summary()
                company_metrics = processor.get_total_company_metrics()
                
                # Store in session state
                st.session_state.racing_processor = processor
                st.session_state.individual_data = individual_data
                st.session_state.team_data = team_data
                st.session_state.company_metrics = company_metrics
                st.session_state.last_update = datetime.now()
                
                st.info(f"📊 {len(individual_data)} consultants loaded")
                st.info(f"👥 {len(team_data)} teams identified")
                
                # Show data preview
                with st.expander("Racing Data Preview"):
                    st.write("**Top 5 Performers:**")
                    preview_cols = ['Consultant Name', 'Supervisor Name', 'overall_performance', 'vehicle_type']
                    st.dataframe(individual_data[preview_cols].head())
                    
            except Exception as e:
                st.error(f"❌ Error processing racing data: {str(e)}")
                st.info("Please ensure your Excel file contains the 'Sales Perfromance' sheet")
        
        # Auto-refresh toggle
        st.header("⚙️ Settings")
        auto_refresh = st.checkbox("Auto-refresh (30s)", value=False)
        
        if auto_refresh:
            st.rerun()
        
        # Manual refresh button
        if st.button("🔄 Refresh Data"):
            if uploaded_file is not None:
                st.rerun()
    
    # Main content area
    if st.session_state.individual_data is not None:
        # Display last update time
        if st.session_state.last_update:
            st.caption(f"Last updated: {st.session_state.last_update.strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Key metrics row
        metrics = st.session_state.company_metrics
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric(
                "💰 Total Sales",
                f"R{metrics['total_sales_actual']/1000000:.1f}M",
                delta=f"{metrics['overall_sales_achievement']-100:+.1f}% vs Target"
            )
        
        with col2:
            st.metric(
                "🎯 Sales Target",
                f"R{metrics['total_sales_target']/1000000:.1f}M",
                delta=f"{metrics['overall_sales_achievement']:.1f}% Achieved"
            )
        
        with col3:
            st.metric(
                "📊 Avg Performance",
                f"{metrics['avg_individual_performance']:.1f}%",
                delta=f"{metrics['avg_individual_performance']-100:+.1f}% vs Target"
            )
        
        with col4:
            st.metric(
                "🏆 Racing Champion",
                metrics['top_performer'],
                delta=f"#{st.session_state.individual_data.iloc[0]['race_position']} Position"
            )
        
        st.divider()
        
        # Racing Dashboard Views
        st.subheader("🏁 Monaco Sales Grand Prix Dashboard")
        
        # Create tabs for the 3 specific racing views
        tab1, tab2, tab3, tab4 = st.tabs(["⚡ Total Gauge", "🏎️ Team Racing", "🗺️ Monaco Course", "🗺️ Kyalami Course"])
        
        with tab1:
            # Total Gauge View
            st.markdown("### ⚡ Total Company Performance Gauge")
            
            # Full-width large gauge
            fig_gauge = create_total_gauge_view(st.session_state.company_metrics)
            st.plotly_chart(fig_gauge, use_container_width=True)
            
            st.divider()
            
            # Performance summary and team overview below gauge
            col1, col2 = st.columns(2)
            
            with col1:
                # Performance summary
                st.markdown("#### 📊 Performance Summary")
                metrics = st.session_state.company_metrics
                
                st.info(f"""
                **Company Overview:**
                - 👥 Total Consultants: {metrics['total_consultants']}
                - 💰 Sales Achievement: {metrics['overall_sales_achievement']:.1f}%
                - 📋 Apps Achievement: {metrics['overall_apps_achievement']:.1f}%
                - 🏆 Champion: {metrics['top_performer']}
                """)
            
            with col2:
                # Team performance summary
                st.markdown("#### 👥 Team Performance Leaderboard")
                team_perf = create_team_performance_summary(st.session_state.team_data)
                st.plotly_chart(team_perf, use_container_width=True)
        
        with tab2:
            # Team Racing View with Race Toggle
            st.markdown("### 🏎️ Team Racing Championship")
            
            # Race selection toggle
            col1, col2 = st.columns([1, 3])
            with col1:
                selected_race = st.selectbox(
                    "🏁 Select Race:",
                    ["Monaco", "Kyalami"],
                    index=0
                )
            
            with col2:
                race_emoji = "🏎️" if selected_race == "Monaco" else "🦁"
                st.info(f"{race_emoji} Now viewing {selected_race} Grand Prix results")
            
            # Get race-specific data
            race_individual_data = st.session_state.racing_processor.get_racing_leaderboard_by_race(selected_race, top_n=10)
            race_team_data = st.session_state.racing_processor.get_team_summary_by_race(selected_race)
            
            # Create and display team racing view
            fig_racing = create_team_racing_view(race_team_data, race_individual_data)
            st.plotly_chart(fig_racing, use_container_width=True)
            
            # Racing statistics
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.markdown("##### 🔧 Pit Crew - Agent Performance")
                if not race_individual_data.empty:
                    leaders = race_individual_data.head(3)
                    for idx, (_, row) in enumerate(leaders.iterrows()):
                        emoji = ["🥇", "🥈", "🥉"][idx]
                        st.markdown(f"{emoji} **{row['Consultant Name']}** - {row['overall_performance']:.1f}%")
                else:
                    st.write("No pit crew in this race yet")
            
            with col2:
                st.markdown("##### 🚀 Pole Position - Drivers")
                if not race_team_data.empty:
                    top_teams = race_team_data.nlargest(3, 'team_sales_achievement')
                    for idx, (_, team) in enumerate(top_teams.iterrows()):
                        emoji = ["🏆", "🥈", "🥉"][idx]
                        st.markdown(f"{emoji} **{team['team_name']}** - {team['team_sales_achievement']:.1f}%")
                else:
                    st.write("No drivers in this race yet")
            
            with col3:
                st.markdown("##### 🏃 Pit Stop Needed")
                if not race_individual_data.empty:
                    behind = race_individual_data.tail(3)
                    for _, row in behind.iterrows():
                        gap = 100 - row['overall_performance']
                        st.markdown(f"⚠️ **{row['Consultant Name']}** - {gap:.1f}% behind")
                else:
                    st.write("All racers performing well!")
            
            # Race statistics summary
            st.markdown("<br>", unsafe_allow_html=True)  # Add some spacing
            st.divider()
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                st.metric("🏁 Race Participants", len(race_individual_data))
            with col2:
                st.metric("🏆 Teams Racing", len(race_team_data))
            with col3:
                avg_performance = race_individual_data['overall_performance'].mean() if not race_individual_data.empty else 0
                st.metric("📊 Avg Performance", f"{avg_performance:.1f}%")
            with col4:
                top_speed = race_individual_data['overall_performance'].max() if not race_individual_data.empty else 0
                st.metric("🚀 Top Performance", f"{top_speed:.1f}%")
        
        with tab3:
            # Monaco Course Map View
            st.markdown("### 🗺️ Monaco Grand Prix Course Map")
            
            # Get Monaco team data
            monaco_team_data = st.session_state.racing_processor.get_team_summary_by_race('Monaco')
            
            # Create and display Monaco course map with actual track image
            monaco_image_path = "attached_assets/monaco_map_bg_1755264624179.png"
            fig_monaco_course = create_course_map_view(monaco_team_data, monaco_image_path, "Monaco")
            st.plotly_chart(fig_monaco_course, use_container_width=True)
            
            # Live race information for Monaco supervisors
            col1, col2 = st.columns(2)
            
            with col1:
                st.markdown("#### 🏁 Monaco Supervisor Performance")
                
                # Top lap leaders (supervisors)
                st.markdown("**🏆 Monaco Supervisor Lap Leaders:**")
                if not monaco_team_data.empty:
                    for i, (_, team) in enumerate(monaco_team_data.head(5).iterrows()):
                        daily_target = team['SalesValTarget'] / 31
                        daily_achievement = team['TotalSalesVal'] / 31
                        laps_completed = daily_achievement / daily_target if daily_target > 0 else 0
                        st.write(f"{i+1}. **{team['team_name']}**: {int(laps_completed):.0f} laps completed")
                else:
                    st.write("No Monaco supervisors found")
            
            with col2:
                st.markdown("#### 📊 Monaco Team Statistics")
                # Show team performance metrics
                st.markdown("**Monaco Supervisor Achievement:**")
                if not monaco_team_data.empty:
                    for i, (_, team) in enumerate(monaco_team_data.head(5).iterrows()):
                        st.write(f"{i+1}. **{team['team_name']}**: {team['team_sales_achievement']:.1f}% achievement")
                else:
                    st.write("No Monaco supervisors found")
        
        with tab4:
            # Kyalami Course Map View  
            st.markdown("### 🗺️ Kyalami Grand Prix Course Map")
            
            # Get Kyalami team data
            kyalami_team_data = st.session_state.racing_processor.get_team_summary_by_race('Kyalami')
            
            # Create and display Kyalami course map with actual track image
            kyalami_image_path = "attached_assets/kyalami_map_bg_1755264624180.png"
            fig_kyalami_course = create_course_map_view(kyalami_team_data, kyalami_image_path, "Kyalami")
            st.plotly_chart(fig_kyalami_course, use_container_width=True)
            
            # Live race information for Kyalami supervisors
            col1, col2 = st.columns(2)
            
            with col1:
                st.markdown("#### 🏁 Kyalami Supervisor Performance")
                
                # Top lap leaders (supervisors)
                st.markdown("**🏆 Kyalami Supervisor Lap Leaders:**")
                if not kyalami_team_data.empty:
                    for i, (_, team) in enumerate(kyalami_team_data.head(5).iterrows()):
                        daily_target = team['SalesValTarget'] / 31
                        daily_achievement = team['TotalSalesVal'] / 31
                        laps_completed = daily_achievement / daily_target if daily_target > 0 else 0
                        st.write(f"{i+1}. **{team['team_name']}**: {int(laps_completed):.0f} laps completed")
                else:
                    st.write("No Kyalami supervisors found")
            
            with col2:
                st.markdown("#### 📊 Kyalami Team Statistics")
                # Show team performance metrics
                st.markdown("**Kyalami Supervisor Achievement:**")
                if not kyalami_team_data.empty:
                    for i, (_, team) in enumerate(kyalami_team_data.head(5).iterrows()):
                        st.write(f"{i+1}. **{team['team_name']}**: {team['team_sales_achievement']:.1f}% achievement")
                else:
                    st.write("No Kyalami supervisors found")
    else:
        st.warning("📊 Please load racing data using the sidebar to view the Monaco Sales Grand Prix Dashboard.")
        st.info("ℹ️ Check the 'Use existing Direct Sales Gamification file' checkbox in the sidebar to load data.")

if __name__ == "__main__":
    main()