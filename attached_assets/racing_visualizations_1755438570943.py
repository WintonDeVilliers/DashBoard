import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import pandas as pd
import numpy as np
import math

def create_total_gauge_view(company_metrics):
    """Create a total company progress gauge similar to the provided image"""
    
    # Get the overall sales achievement percentage
    achievement_pct = company_metrics['overall_sales_achievement']
    target_value = company_metrics['total_sales_target']
    actual_value = company_metrics['total_sales_actual']
    
    # Create gauge chart
    # Calculate percentage based on 240M target
    gauge_percentage = (actual_value / 240000000) * 100
    
    fig = go.Figure(go.Indicator(
        mode = "gauge+number+delta",
        value = gauge_percentage,
        domain = {'x': [0, 1], 'y': [0, 1]},
        title = {'text': f"Total Sales Progress<br><span style='font-size:0.8em;color:gray'>Target: R240M | Actual: R{actual_value/1000000:.0f}M</span>"},
        delta = {'reference': 100, 'suffix': "%"},
        gauge = {
            'axis': {
                'range': [None, 120],  # Allow for over-achievement
                'tickvals': [12.5, 20.8, 29.2, 37.5, 45.8, 54.2, 66.7, 79.2, 87.5, 100],  # Custom tick positions
                'ticktext': ['30', '50', '70', '90', '110', '130', '160', '190', '210', '240'],  # Custom labels
                'tickfont': {'size': 12, 'color': 'black'}
            },
            'bar': {'color': "darkblue", 'thickness': 0.3},
            'steps': [
                {'range': [0, 12.5], 'color': "#FF6B6B"},    # Red - 0-30M
                {'range': [12.5, 20.8], 'color': "#FF8E53"},  # Orange-red - 30-50M
                {'range': [20.8, 29.2], 'color': "#FFA500"},  # Orange - 50-70M
                {'range': [29.2, 37.5], 'color': "#FFB347"},  # Light orange - 70-90M
                {'range': [37.5, 45.8], 'color': "#FFD700"},  # Yellow - 90-110M
                {'range': [45.8, 54.2], 'color': "#F0E68C"},  # Light yellow - 110-130M
                {'range': [54.2, 66.7], 'color': "#ADFF2F"},  # Yellow-green - 130-160M
                {'range': [66.7, 79.2], 'color': "#90EE90"},  # Light green - 160-190M
                {'range': [79.2, 87.5], 'color': "#32CD32"},  # Green - 190-210M
                {'range': [87.5, 120], 'color': "#228B22"}    # Dark green - 210M+
            ],
            'threshold': {
                'line': {'color': "red", 'width': 4},
                'thickness': 0.75,
                'value': 100  # 240M target line
            }
        }
    ))
    
    # Custom tick labels are now handled in the gauge axis configuration above
    # No need for additional annotations since tickvals and ticktext provide the proper labels
    
    fig.update_layout(
        height=600,  # Increased height for better visibility and label alignment
        font={'color': "darkblue", 'family': "Arial"},
        plot_bgcolor='white'
    )
    
    return fig

def create_team_racing_view(team_data, individual_data):
    """Create team racing view with supervisors/teams and their achievement rates"""
    
    # Use team data instead of individual data - sort by team achievement
    top_performers = team_data.sort_values('team_sales_achievement', ascending=False).head(10)
    
    fig = go.Figure()
    
    # Create racing track lanes
    track_width = 100
    lane_height = 8
    
    for i, (_, team) in enumerate(top_performers.iterrows()):
        lane_y = i * lane_height
        
        # Draw track lane background
        fig.add_shape(
            type="rect",
            x0=0, y0=lane_y-2, x1=track_width, y1=lane_y+2,
            fillcolor="lightgray",
            opacity=0.3,
            layer="below",
            line=dict(width=1, color="gray")
        )
        
        # Calculate vehicle position based on team achievement
        team_achievement = team['team_sales_achievement']
        vehicle_position = min(team_achievement, track_width-5)  # Cap at track width
        
        # Get vehicle type and color based on team performance
        vehicle_type = get_team_vehicle_type(team_achievement)
        performance_color = get_team_performance_color(team_achievement)
        
        # Add vehicle at position
        fig.add_trace(go.Scatter(
            x=[vehicle_position],
            y=[lane_y],
            mode='markers+text',
            marker=dict(size=25, color=performance_color),
            text=vehicle_type,
            textposition="middle center",
            textfont=dict(size=18),
            name=team['team_name'],
            hovertemplate=f'<b>{team["team_name"]} Team</b><br>' +
                         f'Team Achievement: {team["team_sales_achievement"]:.1f}%<br>' +
                         f'Team Size: {team["team_size"]} members<br>' +
                         f'Avg Performance: {team["avg_performance"]:.1f}%<br>' +
                         f'Total Sales: R{team["TotalSalesVal"]:,.0f}<br>' +
                         f'Team Target: R{team["SalesValTarget"]:,.0f}<br>' +
                         '<extra></extra>',
            showlegend=False
        ))
        
        # Add supervisor name label
        fig.add_annotation(
            x=-5, y=lane_y,
            text=f"{i+1}. {team['team_name']}",
            showarrow=False,
            font=dict(size=10),
            xanchor="right"
        )
        
        # Add team achievement percentage
        fig.add_annotation(
            x=vehicle_position+8, y=lane_y,
            text=f"{team['team_sales_achievement']:.0f}%",
            showarrow=False,
            font=dict(size=10, color=performance_color, weight="bold"),
            xanchor="left"
        )
    
    # Add finish line
    fig.add_shape(
        type="line",
        x0=100, y0=-5, x1=100, y1=len(top_performers)*lane_height,
        line=dict(color="red", width=3, dash="dash")
    )
    
    # Add checkered pattern at finish line
    for i in range(len(top_performers)):
        y_pos = i * lane_height
        fig.add_shape(
            type="rect",
            x0=98, y0=y_pos-2, x1=100, y1=y_pos+2,
            fillcolor="black" if i % 2 == 0 else "white",
            opacity=0.8,
            line=dict(width=1, color="black")
        )
    
    fig.add_annotation(
        x=100, y=len(top_performers)*lane_height+5,
        text="🏁 FINISH LINE",
        showarrow=False,
        font=dict(size=14, color="red")
    )
    
    fig.update_layout(
        title="🏁 Team Racing Championship - Supervisor Performance",
        xaxis=dict(range=[-15, 120], showticklabels=False, showgrid=False),
        yaxis=dict(range=[-5, len(top_performers)*lane_height+10], showticklabels=False, showgrid=False),
        height=max(400, len(top_performers)*50),
        plot_bgcolor='white',
        showlegend=False
    )
    
    return fig

def get_team_vehicle_type(team_achievement):
    """Get vehicle type based on team achievement rate"""
    if team_achievement >= 120:
        return "🏎️"  # Formula 1 car - top performing teams
    elif team_achievement >= 100:
        return "🚗"   # Sports car - target achieved
    elif team_achievement >= 80:
        return "🚙"   # SUV - on track
    elif team_achievement >= 60:
        return "🚐"   # Van - needs boost
    else:
        return "🛻"   # Truck - recovery mode

def get_team_performance_color(team_achievement):
    """Get color based on team achievement level"""
    if team_achievement >= 120:
        return "#FF6B35"  # Orange-red for superstars
    elif team_achievement >= 100:
        return "#4ECDC4"  # Teal for target achieved
    elif team_achievement >= 80:
        return "#45B7D1"  # Blue for on track
    elif team_achievement >= 60:
        return "#FFA07A"  # Light salmon for needs boost
    else:
        return "#FF6B6B"  # Red for recovery mode

def create_course_map_view(team_data, track_image_path, race_name="Monaco"):
    """Create course map view showing supervisor performance with actual track background"""
    
    # Get top teams for course map
    teams = team_data.head(10)
    
    # Create figure with track background
    fig = go.Figure()
    
    # Add the track background image
    from PIL import Image
    import base64
    import io
    
    # Load and encode the track image
    try:
        img = Image.open(track_image_path)
        img_width, img_height = img.size
        
        # Convert image to base64 for plotly
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        # Add background image
        fig.add_layout_image(
            dict(
                source=f"data:image/png;base64,{img_str}",
                xref="x",
                yref="y",
                x=0,
                y=0,
                sizex=img_width,
                sizey=img_height,
                sizing="stretch",
                opacity=0.9,
                layer="below"
            )
        )
        
        # Set coordinate system based on image dimensions
        x_range = [0, img_width]
        y_range = [0, img_height]
        
    except Exception as e:
        # Fallback to simple track if image loading fails
        x_range = [-10, 10]
        y_range = [-8, 8]
        img_width, img_height = 20, 16
    
    # Position supervisors on track based on their lap progress
    for i, (_, team) in enumerate(teams.iterrows()):
        # Calculate daily lap progress based on sales achievement
        # Each "lap" represents daily target achievement (target/31 days)
        daily_target = team['SalesValTarget'] / 31  # Daily target
        daily_achievement = team['TotalSalesVal'] / 31  # Daily actual
        laps_completed = daily_achievement / daily_target if daily_target > 0 else 0
        
        # Current lap progress (fractional part)
        current_lap_progress = laps_completed - int(laps_completed)
        
        # Position calculation - place supervisors along track perimeter based on actual track layout
        if race_name == "Monaco":
            # Monaco track path positions (following the actual track layout)
            track_positions = [
                (img_width * 0.15, img_height * 0.75),  # Start/Finish straight
                (img_width * 0.25, img_height * 0.85),  # Sainte Devote
                (img_width * 0.40, img_height * 0.90),  # Beau Rivage
                (img_width * 0.55, img_height * 0.85),  # Casino Square
                (img_width * 0.68, img_height * 0.75),  # Mirabeau
                (img_width * 0.75, img_height * 0.60),  # Loews Hairpin
                (img_width * 0.80, img_height * 0.45),  # Portier
                (img_width * 0.75, img_height * 0.30),  # Tunnel exit
                (img_width * 0.65, img_height * 0.20),  # Nouvelle Chicane
                (img_width * 0.50, img_height * 0.15),  # Tabac
                (img_width * 0.35, img_height * 0.20),  # Swimming Pool
                (img_width * 0.25, img_height * 0.35),  # La Rascasse
                (img_width * 0.20, img_height * 0.50),  # Anthony Noghes
                (img_width * 0.15, img_height * 0.65),  # Back to start
            ]
        else:  # Kyalami
            # Kyalami track path positions (following the actual track layout)
            track_positions = [
                (img_width * 0.25, img_height * 0.70),  # Start/Finish
                (img_width * 0.35, img_height * 0.80),  # Turn 1 approach
                (img_width * 0.50, img_height * 0.85),  # Turn 1
                (img_width * 0.65, img_height * 0.80),  # Turn 2
                (img_width * 0.75, img_height * 0.65),  # Turn 3
                (img_width * 0.80, img_height * 0.50),  # Turn 4
                (img_width * 0.75, img_height * 0.35),  # Turn 5
                (img_width * 0.65, img_height * 0.25),  # Turn 6 
                (img_width * 0.50, img_height * 0.20),  # Turn 7
                (img_width * 0.35, img_height * 0.25),  # Turn 8
                (img_width * 0.25, img_height * 0.35),  # Turn 9
                (img_width * 0.20, img_height * 0.50),  # Back straight
            ]
        
        # Get position based on current lap progress
        pos_index = int(current_lap_progress * len(track_positions))
        pos_index = min(pos_index, len(track_positions) - 1)
        x_pos, y_pos = track_positions[pos_index]
        
        # Add some random offset to avoid exact overlaps
        x_pos += (i % 3 - 1) * img_width * 0.02
        y_pos += ((i // 3) % 3 - 1) * img_height * 0.02
        
        # Get vehicle type and color based on team performance
        vehicle_type = get_team_vehicle_type(team['team_sales_achievement'])
        performance_color = get_team_performance_color(team['team_sales_achievement'])
        
        # Add supervisor vehicle with enhanced visibility
        fig.add_trace(go.Scatter(
            x=[x_pos],
            y=[y_pos],
            mode='markers+text',
            marker=dict(
                size=35, 
                color=performance_color, 
                line=dict(color='black', width=3),
                symbol='circle'
            ),
            text=vehicle_type,
            textposition="middle center",
            textfont=dict(size=20, color='white', family="Arial Black"),
            name=team['team_name'],
            hovertemplate=f'<b>{team["team_name"]} Team</b><br>' +
                         f'Laps Completed: {int(laps_completed):.0f}<br>' +
                         f'Current Lap: {current_lap_progress*100:.1f}%<br>' +
                         f'Team Achievement: {team["team_sales_achievement"]:.1f}%<br>' +
                         f'Daily Target: R{daily_target:,.0f}<br>' +
                         f'Daily Actual: R{daily_achievement:,.0f}<br>' +
                         f'Team Size: {team["team_size"]} members<br>' +
                         '<extra></extra>',
            showlegend=False
        ))
        
        # Add supervisor name label with better visibility
        fig.add_annotation(
            x=x_pos,
            y=y_pos - img_height * 0.08,
            text=f"<b>{team['team_name']}</b>",
            showarrow=False,
            font=dict(size=10, color="white", family="Arial"),
            bgcolor="rgba(0,0,0,0.7)",
            bordercolor="white",
            borderwidth=1,
            borderpad=2
        )
    
    # Add lap leaders info
    if not teams.empty:
        lap_info = []
        for i, (_, team) in enumerate(teams.head(5).iterrows()):
            daily_target = team['SalesValTarget'] / 31
            daily_achievement = team['TotalSalesVal'] / 31
            laps_completed = daily_achievement / daily_target if daily_target > 0 else 0
            lap_info.append(f"{i+1}. {team['team_name']}: {int(laps_completed):.0f} laps")
        
        fig.add_annotation(
            x=img_width * 0.02,
            y=img_height * 0.02,
            text="🏆 LAP LEADERS:<br>" + "<br>".join(lap_info),
            showarrow=False,
            font=dict(size=11, color="black"),
            align="left",
            bordercolor="black",
            borderwidth=2,
            bgcolor="rgba(255,255,255,0.95)",
            xanchor="left",
            yanchor="bottom"
        )
    
    # Add start/finish line indicator
    start_x = img_width * 0.15 if race_name == "Monaco" else img_width * 0.25
    start_y = img_height * 0.75 if race_name == "Monaco" else img_height * 0.70
    
    fig.add_annotation(
        x=start_x,
        y=start_y,
        text="🏁 START/FINISH",
        showarrow=False,
        font=dict(size=12, color="red", weight="bold"),
        bgcolor="rgba(255,255,255,0.9)",
        bordercolor="red",
        borderwidth=2,
        borderpad=3
    )
    
    fig.update_layout(
        title=f"🏎️ {race_name} Grand Prix - Supervisor Performance Map",
        xaxis=dict(
            range=x_range, 
            showticklabels=False, 
            showgrid=False, 
            scaleanchor="y",
            scaleratio=1
        ),
        yaxis=dict(
            range=y_range, 
            showticklabels=False, 
            showgrid=False,
            autorange='reversed'  # Flip Y axis to match image orientation
        ),
        height=600,
        width=1000,
        plot_bgcolor='white',
        paper_bgcolor='white',
        showlegend=False,
        margin=dict(l=10, r=10, t=60, b=10)
    )
    
    return fig

def create_team_performance_summary(team_data):
    """Create team performance summary chart"""
    
    fig = go.Figure()
    
    # Create horizontal bar chart for teams
    fig.add_trace(go.Bar(
        y=team_data['team_name'],
        x=team_data['team_sales_achievement'],
        orientation='h',
        marker_color=team_data['team_sales_achievement'].apply(lambda x: 
            '#32CD32' if x >= 100 else '#FFD700' if x >= 80 else '#FFA500' if x >= 60 else '#FF6B6B'),
        text=team_data['team_sales_achievement'].apply(lambda x: f'{x:.1f}%'),
        textposition='outside',
        hovertemplate='<b>%{y}</b><br>' +
                     'Achievement: %{x:.1f}%<br>' +
                     'Team Size: %{customdata[0]}<br>' +
                     'Avg Performance: %{customdata[1]:.1f}%<br>' +
                     '<extra></extra>',
        customdata=np.column_stack((team_data['team_size'], team_data['avg_performance']))
    ))
    
    # Add target line
    fig.add_vline(x=100, line_dash="dash", line_color="red", 
                  annotation_text="Target", annotation_position="top")
    
    fig.update_layout(
        title='👥 Team Performance Summary',
        xaxis_title='Achievement Rate (%)',
        yaxis_title='Team',
        height=400,
        showlegend=False,
        plot_bgcolor='white'
    )
    
    return fig