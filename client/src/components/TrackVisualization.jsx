import { useEffect, useRef, useMemo } from 'react';
import styles from '../styles/TrackVisualization.module.css';

export default function TrackVisualization({ 
  circuit = 'monaco', 
  teams = [], 
  config = null,
  className = '' 
}) {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const carsRef = useRef(new Map());
  const animationRef = useRef(null);

  const trackData = useMemo(() => {
    if (!config || !teams.length) return null;
    
    return {
      positions: config.track_positions,
      teams: teams.slice(0, 10).map((team, index) => ({
        ...team,
        currentPosition: Math.min(team.track_position / 100, 1), // Normalize to 0-1
        displayIndex: index,
        targetPosition: config.track_positions[Math.floor((team.track_position / 100) * config.track_positions.length)] || config.track_positions[0]
      }))
    };
  }, [config, teams]);

  useEffect(() => {
    if (!containerRef.current || !trackData || !window.PIXI) return;

    // Initialize PixiJS application
    const app = new window.PIXI.Application({
      width: 800,
      height: 400,
      backgroundColor: 0x1a1a1a,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    });

    appRef.current = app;
    containerRef.current.appendChild(app.view);

    // Create track path graphics
    const trackPath = new window.PIXI.Graphics();
    const trackColor = circuit === 'monaco' ? 0xFF6B35 : 0x45B7D1;
    
    // Draw track path
    trackPath.lineStyle(4, trackColor, 0.8);
    trackPath.moveTo(
      trackData.positions[0].x * app.screen.width,
      trackData.positions[0].y * app.screen.height
    );
    
    trackData.positions.forEach(pos => {
      trackPath.lineTo(
        pos.x * app.screen.width,
        pos.y * app.screen.height
      );
    });
    
    // Close the loop
    trackPath.lineTo(
      trackData.positions[0].x * app.screen.width,
      trackData.positions[0].y * app.screen.height
    );
    
    app.stage.addChild(trackPath);

    // Create start/finish line
    const startLine = new window.PIXI.Graphics();
    startLine.lineStyle(6, 0xFF0000, 1);
    const startPos = trackData.positions[0];
    startLine.moveTo(
      (startPos.x - 0.02) * app.screen.width,
      (startPos.y - 0.02) * app.screen.height
    );
    startLine.lineTo(
      (startPos.x + 0.02) * app.screen.width,
      (startPos.y + 0.02) * app.screen.height
    );
    app.stage.addChild(startLine);

    // Create cars for each team
    const cars = new Map();
    
    trackData.teams.forEach((team, index) => {
      const carContainer = new window.PIXI.Container();
      
      // Create car body (simple rectangle)
      const carBody = new window.PIXI.Graphics();
      const carColor = parseInt(team.performance_color.replace('#', ''), 16);
      carBody.beginFill(carColor);
      carBody.drawRoundedRect(-8, -4, 16, 8, 2);
      carBody.endFill();
      
      // Add team number
      const teamNumber = new window.PIXI.Text(team.displayIndex + 1, {
        fontFamily: 'Arial',
        fontSize: 10,
        fill: 0xFFFFFF,
        fontWeight: 'bold'
      });
      teamNumber.anchor.set(0.5);
      
      carContainer.addChild(carBody);
      carContainer.addChild(teamNumber);
      
      // Position car on track
      const positionIndex = Math.floor(team.currentPosition * (trackData.positions.length - 1));
      const position = trackData.positions[positionIndex];
      
      carContainer.x = position.x * app.screen.width;
      carContainer.y = position.y * app.screen.height;
      
      // Add some offset to avoid overlapping
      const offset = (index % 3 - 1) * 15;
      carContainer.x += offset;
      carContainer.y += offset;
      
      app.stage.addChild(carContainer);
      cars.set(team.id, { container: carContainer, team, positionIndex });
    });

    carsRef.current = cars;

    // Animation loop for car movement
    const animateCars = () => {
      cars.forEach(({ container, team, positionIndex }) => {
        // Simple animation - cars move slightly along their current position
        const time = Date.now() * 0.001;
        const oscillation = Math.sin(time + team.displayIndex) * 2;
        
        const position = trackData.positions[positionIndex];
        container.x = position.x * app.screen.width + oscillation;
        container.y = position.y * app.screen.height + oscillation;
      });
      
      animationRef.current = requestAnimationFrame(animateCars);
    };

    animateCars();

    // Add legend
    const legend = new window.PIXI.Container();
    legend.x = 20;
    legend.y = app.screen.height - 80;

    const legendItems = [
      { color: 0xFF6B35, label: 'Leader' },
      { color: 0x4ECDC4, label: 'Target+' },
      { color: 0x45B7D1, label: 'On Track' }
    ];

    legendItems.forEach((item, index) => {
      const legendItem = new window.PIXI.Container();
      legendItem.y = index * 20;

      const dot = new window.PIXI.Graphics();
      dot.beginFill(item.color);
      dot.drawCircle(0, 0, 6);
      dot.endFill();

      const text = new window.PIXI.Text(item.label, {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 0xFFFFFF
      });
      text.x = 15;
      text.y = -6;

      legendItem.addChild(dot);
      legendItem.addChild(text);
      legend.addChild(legendItem);
    });

    app.stage.addChild(legend);

    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [circuit, trackData]);

  if (!trackData) {
    return (
      <div className={`${styles.trackContainer} ${className}`}>
        <div className={styles.noData}>
          <p>No track data available</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`${styles.trackContainer} ${className}`}
      data-testid={`track-visualization-${circuit}`}
    >
      {/* PixiJS canvas will be inserted here */}
    </div>
  );
}
