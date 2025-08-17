import pandas as pd
import numpy as np

def load_sample_data():
    """Load sample sales data for demonstration"""
    
    # Sample sales team data
    salespeople = [
        "Ashley Moyo", "Mixo Makhubele", "Nonhle Zondi", "Rodney Naidu",
        "Samantha Govender", "Samuel Masubelele", "Taedi Moletsane", 
        "Thabo Mosweu", "Thobile Phakhathi", "Busisiwe Mabuza",
        "Cindy Visser", "Matimba Ngobeni", "Mfundo Mdlalose",
        "Mondli Nhlapho", "Mosima Moshidi", "Salome Baloyi",
        "Shadleigh White", "Tshepo Moeketsi"
    ]
    
    # Generate realistic sales data
    np.random.seed(42)  # For reproducible results
    
    data = []
    for person in salespeople:
        # Random target between 10M and 20M
        target = np.random.uniform(10000000, 20000000)
        
        # Achievement rate with some variation (60% to 140%)
        achievement_rate = np.random.normal(85, 25)
        achievement_rate = max(30, min(140, achievement_rate))  # Clamp between 30% and 140%
        
        # Calculate current sales based on achievement rate
        current_sales = target * (achievement_rate / 100)
        
        # Assign teams (Monaco vs Kyalami)
        team = "Monaco Grand Prix" if len(data) % 2 == 0 else "Kyalami Grand Prix"
        
        data.append({
            'salesperson': person,
            'current_sales': current_sales,
            'target': target,
            'team': team
        })
    
    df = pd.DataFrame(data)
    
    # Calculate metrics
    df['achievement_rate'] = (df['current_sales'] / df['target']) * 100
    df['gap_to_target'] = df['target'] - df['current_sales']
    
    return df

def calculate_team_performance(df):
    """Calculate team-based performance metrics"""
    if 'team' not in df.columns:
        return None
    
    team_stats = df.groupby('team').agg({
        'current_sales': 'sum',
        'target': 'sum',
        'achievement_rate': 'mean',
        'salesperson': 'count'
    }).reset_index()
    
    team_stats.columns = ['team', 'total_sales', 'total_target', 'avg_achievement', 'team_size']
    team_stats['team_achievement'] = (team_stats['total_sales'] / team_stats['total_target']) * 100
    team_stats['team_gap'] = team_stats['total_target'] - team_stats['total_sales']
    
    return team_stats

def format_currency(amount):
    """Format currency values for display"""
    if amount >= 1000000:
        return f"R{amount/1000000:.1f}M"
    elif amount >= 1000:
        return f"R{amount/1000:.1f}K"
    else:
        return f"R{amount:.0f}"

def get_performance_emoji(achievement_rate):
    """Get emoji based on performance level"""
    if achievement_rate >= 120:
        return "🏎️"
    elif achievement_rate >= 100:
        return "🚗"
    elif achievement_rate >= 80:
        return "🚙"
    elif achievement_rate >= 60:
        return "🚐"
    else:
        return "🛻"

def get_performance_status(achievement_rate):
    """Get status text based on performance level"""
    if achievement_rate >= 120:
        return "🔥 On Fire!"
    elif achievement_rate >= 100:
        return "✅ Target Achieved!"
    elif achievement_rate >= 80:
        return "📈 On Track"
    elif achievement_rate >= 60:
        return "⚡ Needs Boost"
    else:
        return "🚨 Recovery Mode"

def calculate_racing_position(df):
    """Calculate racing positions for each salesperson"""
    df_sorted = df.sort_values('achievement_rate', ascending=False)
    positions = {}
    
    for i, (_, row) in enumerate(df_sorted.iterrows()):
        positions[row['salesperson']] = i + 1
    
    return positions
