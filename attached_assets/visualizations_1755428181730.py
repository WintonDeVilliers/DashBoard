import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import pandas as pd
import numpy as np

def create_leaderboard_chart(df):
    """Create an interactive leaderboard bar chart"""
    # Sort by achievement rate
    df_sorted = df.sort_values('achievement_rate', ascending=True)  # Ascending for horizontal bar chart
    
    # Create color scale based on achievement rate
    colors = []
    for rate in df_sorted['achievement_rate']:
        if rate >= 120:
            colors.append('#FF6B35')  # Orange-red for superstars
        elif rate >= 100:
            colors.append('#4ECDC4')  # Teal for target achieved
        elif rate >= 80:
            colors.append('#45B7D1')  # Blue for on track
        elif rate >= 60:
            colors.append('#FFA07A')  # Light salmon for needs boost
        else:
            colors.append('#FF6B6B')  # Red for recovery mode
    
    fig = go.Figure(data=[
        go.Bar(
            x=df_sorted['achievement_rate'],
            y=df_sorted['salesperson'],
            orientation='h',
            marker_color=colors,
            text=df_sorted['achievement_rate'].apply(lambda x: f'{x:.1f}%'),
            textposition='outside',
            hovertemplate='<b>%{y}</b><br>' +
                         'Achievement: %{x:.1f}%<br>' +
                         'Sales: $%{customdata[0]:,.0f}<br>' +
                         'Target: $%{customdata[1]:,.0f}<br>' +
                         'Gap: $%{customdata[2]:,.0f}<br>' +
                         '<extra></extra>',
            customdata=np.column_stack((df_sorted['current_sales'], 
                                      df_sorted['target'], 
                                      df_sorted['gap_to_target']))
        )
    ])
    
    # Add vertical line at 100%
    fig.add_vline(x=100, line_dash="dash", line_color="red", 
                  annotation_text="Target", annotation_position="top")
    
    fig.update_layout(
        title='🏆 Sales Achievement Leaderboard',
        xaxis_title='Achievement Rate (%)',
        yaxis_title='Salesperson',
        height=max(400, len(df) * 50),
        showlegend=False,
        plot_bgcolor='white'
    )
    
    return fig

def create_progress_chart(df):
    """Create a progress tracking chart for all salespeople"""
    fig = go.Figure()
    
    # Sort by achievement rate
    df_sorted = df.sort_values('achievement_rate', ascending=False)
    
    # Create progress bars
    for i, (_, row) in enumerate(df_sorted.iterrows()):
        # Background bar (target)
        fig.add_trace(go.Bar(
            x=[100],
            y=[row['salesperson']],
            orientation='h',
            marker_color='lightgray',
            name='Target',
            showlegend=False,
            width=0.6
        ))
        
        # Progress bar (current achievement)
        color = '#4ECDC4' if row['achievement_rate'] >= 100 else '#45B7D1'
        
        fig.add_trace(go.Bar(
            x=[min(row['achievement_rate'], 100)],
            y=[row['salesperson']],
            orientation='h',
            marker_color=color,
            name='Current',
            showlegend=False,
            width=0.6,
            text=f"{row['achievement_rate']:.1f}%",
            textposition='outside'
        ))
        
        # Overflow indicator for over-achievers
        if row['achievement_rate'] > 100:
            fig.add_trace(go.Bar(
                x=[row['achievement_rate'] - 100],
                y=[row['salesperson']],
                orientation='h',
                marker_color='#FF6B35',
                name='Over Achievement',
                showlegend=False,
                width=0.6,
                base=100
            ))
    
    fig.update_layout(
        title='📊 Individual Progress Tracking',
        xaxis_title='Achievement Rate (%)',
        yaxis_title='Salesperson',
        height=max(400, len(df) * 40),
        barmode='overlay',
        plot_bgcolor='white'
    )
    
    return fig

def create_racing_chart(df):
    """Create a racing track style visualization"""
    # Sort by achievement rate
    df_sorted = df.sort_values('achievement_rate', ascending=False)
    
    # Create racing track
    fig = go.Figure()
    
    # Track lanes
    track_positions = np.arange(len(df_sorted))
    max_achievement = df_sorted['achievement_rate'].max()
    
    # Draw track lanes
    for i, (_, row) in enumerate(df_sorted.iterrows()):
        # Track lane background
        fig.add_shape(
            type="rect",
            x0=0, y0=i-0.4, x1=100, y1=i+0.4,
            fillcolor="lightgray",
            opacity=0.3,
            layer="below",
            line=dict(width=0)
        )
        
        # Racing car position
        car_position = min(row['achievement_rate'], 120)  # Cap at 120% for display
        
        # Car emoji based on performance
        if row['achievement_rate'] >= 120:
            car_emoji = "🏎️"
            car_color = "#FF6B35"
        elif row['achievement_rate'] >= 100:
            car_emoji = "🚗"
            car_color = "#4ECDC4"
        elif row['achievement_rate'] >= 80:
            car_emoji = "🚙"
            car_color = "#45B7D1"
        else:
            car_emoji = "🚐"
            car_color = "#FFA07A"
        
        # Add car position
        fig.add_trace(go.Scatter(
            x=[car_position],
            y=[i],
            mode='markers+text',
            marker=dict(size=20, color=car_color, symbol='circle'),
            text=car_emoji,
            textposition="middle center",
            textfont=dict(size=16),
            name=row['salesperson'],
            hovertemplate='<b>%{fullData.name}</b><br>' +
                         'Position: %{x:.1f}%<br>' +
                         'Sales: $%{customdata[0]:,.0f}<br>' +
                         'Target: $%{customdata[1]:,.0f}<br>' +
                         '<extra></extra>',
            customdata=[[row['current_sales'], row['target']]]
        ))
    
    # Add finish line
    fig.add_vline(x=100, line_dash="dash", line_color="red", line_width=3,
                  annotation_text="🏁 FINISH LINE", annotation_position="top")
    
    # Add checkered flag pattern at finish line
    for i in range(len(df_sorted)):
        fig.add_shape(
            type="rect",
            x0=98, y0=i-0.4, x1=100, y1=i+0.4,
            fillcolor="black" if i % 2 == 0 else "white",
            opacity=0.7,
            layer="above",
            line=dict(width=1, color="black")
        )
    
    # Update layout
    fig.update_layout(
        title='🏎️ Sales Racing Track',
        xaxis_title='Achievement Rate (%)',
        yaxis=dict(
            tickmode='array',
            tickvals=list(range(len(df_sorted))),
            ticktext=[f"{i+1}. {row['salesperson']}" for i, (_, row) in enumerate(df_sorted.iterrows())]
        ),
        height=max(400, len(df) * 60),
        showlegend=False,
        plot_bgcolor='white',
        xaxis=dict(range=[0, 125])  # Show a bit beyond 100% for over-achievers
    )
    
    return fig

def create_achievement_gauge(achievement_rate, name):
    """Create a gauge chart for individual achievement"""
    fig = go.Figure(go.Indicator(
        mode="gauge+number+delta",
        value=achievement_rate,
        domain={'x': [0, 1], 'y': [0, 1]},
        title={'text': f"{name}"},
        delta={'reference': 100, 'suffix': "%"},
        gauge={
            'axis': {'range': [None, 150]},
            'bar': {'color': "darkblue"},
            'steps': [
                {'range': [0, 60], 'color': "lightgray"},
                {'range': [60, 80], 'color': "yellow"},
                {'range': [80, 100], 'color': "lightgreen"},
                {'range': [100, 150], 'color': "green"}
            ],
            'threshold': {
                'line': {'color': "red", 'width': 4},
                'thickness': 0.75,
                'value': 100
            }
        }
    ))
    
    fig.update_layout(height=250)
    return fig

def create_performance_distribution(df):
    """Create a performance distribution chart"""
    # Create performance bins
    bins = [0, 60, 80, 100, 120, float('inf')]
    labels = ['Recovery Mode', 'Needs Boost', 'On Track', 'Target Achieved', 'Superstar']
    
    df_copy = df.copy()
    df_copy['performance_bin'] = pd.cut(df_copy['achievement_rate'], bins=bins, labels=labels, right=False)
    distribution = df_copy['performance_bin'].value_counts()
    
    colors = ['#FF6B6B', '#FFA07A', '#45B7D1', '#4ECDC4', '#FF6B35']
    
    fig = go.Figure(data=[
        go.Pie(
            labels=distribution.index,
            values=distribution.values,
            marker_colors=colors,
            hovertemplate='<b>%{label}</b><br>' +
                         'Count: %{value}<br>' +
                         'Percentage: %{percent}<br>' +
                         '<extra></extra>'
        )
    ])
    
    fig.update_layout(
        title='🎯 Performance Distribution',
        height=400
    )
    
    return fig
