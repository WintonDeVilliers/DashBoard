import { useEffect, useRef } from 'react';
import styles from '../styles/TrackVisualization.module.css';

export default function TrackVisualization({ teams = [], circuit = 'monaco', className = '' }) {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const carsRef = useRef(new Map());
  const animationRef = useRef(null);

  // Track points by circuit
  const TRACKS = {
    monaco: [
      { x: 0.05, y: 0.9 },  { x: 0.15, y: 0.75 }, { x: 0.25, y: 0.7 },
      { x: 0.35, y: 0.65 }, { x: 0.4, y: 0.55 },  { x: 0.42, y: 0.45 },
      { x: 0.45, y: 0.35 }, { x: 0.55, y: 0.3 },  { x: 0.65, y: 0.25 },
      { x: 0.75, y: 0.25 }, { x: 0.8, y: 0.3 },   { x: 0.82, y: 0.4 },
      { x: 0.85, y: 0.5 },  { x: 0.87, y: 0.6 },  { x: 0.85, y: 0.7 },
      { x: 0.8, y: 0.8 },   { x: 0.05, y: 0.9 }
    ],
    kyalami: [
      { x: 0.05, y: 0.85 }, { x: 0.12, y: 0.78 }, { x: 0.22, y: 0.72 },
      { x: 0.34, y: 0.68 }, { x: 0.46, y: 0.65 }, { x: 0.58, y: 0.63 },
      { x: 0.68, y: 0.58 }, { x: 0.76, y: 0.52 }, { x: 0.83, y: 0.44 },
      { x: 0.89, y: 0.36 }, { x: 0.92, y: 0.28 }, { x: 0.88, y: 0.2 },
      { x: 0.82, y: 0.14 }, { x: 0.74, y: 0.09 }, { x: 0.64, y: 0.06 },
      { x: 0.52, y: 0.05 }, { x: 0.4, y: 0.07 }, { x: 0.28, y: 0.12 },
      { x: 0.18, y: 0.18 }, { x: 0.1, y: 0.26 }, { x: 0.06, y: 0.35 },
      { x: 0.04, y: 0.45 }, { x: 0.03, y: 0.55 }, { x: 0.04, y: 0.65 },
      { x: 0.05, y: 0.75 }, { x: 0.05, y: 0.85 }
    ]
  };

  const trackPoints = TRACKS[circuit] || TRACKS['monaco'];

  useEffect(() => {
    if (!containerRef.current || !window.PIXI) return;
    
    // Clean up any existing content first
    if (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    
    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const app = new window.PIXI.Application({
      width: 800,
      height: 400,
      backgroundColor: 0x1a1a1a,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: true
    });
    
    appRef.current = app;
    containerRef.current.appendChild(app.view);

    // Draw the track path with smoother curves
    const track = new window.PIXI.Graphics();
    track.lineStyle(4, 0xFF6B35, 1);
    track.moveTo(trackPoints[0].x * app.screen.width, trackPoints[0].y * app.screen.height);
    
    // Use quadratic curves for smoother track rendering
    for (let i = 1; i < trackPoints.length - 1; i++) {
      const current = trackPoints[i];
      const next = trackPoints[i + 1];
      const cpX = (current.x + next.x) / 2 * app.screen.width;
      const cpY = (current.y + next.y) / 2 * app.screen.height;
      track.quadraticCurveTo(
        current.x * app.screen.width, 
        current.y * app.screen.height,
        cpX, 
        cpY
      );
    }
    // Close the track
    track.lineTo(trackPoints[trackPoints.length - 1].x * app.screen.width, trackPoints[trackPoints.length - 1].y * app.screen.height);
    app.stage.addChild(track);

    // Draw start/finish line
    const startLine = new window.PIXI.Graphics();
    startLine.lineStyle(6, 0xFFFFFF, 1);
    const start = trackPoints[0];
    startLine.moveTo((start.x - 0.02) * app.screen.width, (start.y - 0.02) * app.screen.height);
    startLine.lineTo((start.x + 0.02) * app.screen.width, (start.y + 0.02) * app.screen.height);
    app.stage.addChild(startLine);

    // Create cars with improved positioning
    const cars = new Map();
    teams.slice(0, 10).forEach((team, index) => {
      const car = new window.PIXI.Graphics();
      const color = parseInt(team.performance_color?.replace('#','') || '808080', 16);

      // F1-style polygon with improved shape
      car.beginFill(color);
      car.drawPolygon([0,-8, 6,6, 0,4, -6,6]);
      car.endFill();
      car.pivot.set(0, 0);

      app.stage.addChild(car);
      // Distribute cars better around the track
      const initialPosition = (team.track_position / 100) + (index * 0.02);
      cars.set(team.id, { 
        container: car, 
        t: initialPosition % 1,
        speed: 0.0005 + (team.team_achievement_rate / 10000) // Variable speed based on performance
      });
    });
    carsRef.current = cars;

    // Smoother animation with easing
    const animate = () => {
      cars.forEach(({ container, t, speed }) => {
        const pathLength = trackPoints.length - 1;
        const idx = Math.floor(t * pathLength);
        const nextIdx = (idx + 1) % trackPoints.length;
        const ratio = (t * pathLength) - idx;

        // Smooth interpolation
        const x = trackPoints[idx].x * (1 - ratio) + trackPoints[nextIdx].x * ratio;
        const y = trackPoints[idx].y * (1 - ratio) + trackPoints[nextIdx].y * ratio;

        container.x = x * app.screen.width;
        container.y = y * app.screen.height;

        // Smooth rotation calculation
        const dx = trackPoints[nextIdx].x - trackPoints[idx].x;
        const dy = trackPoints[nextIdx].y - trackPoints[idx].y;
        const targetRotation = Math.atan2(dy, dx);
        container.rotation = targetRotation;
      });

      // Update positions with variable speeds
      cars.forEach(carData => {
        carData.t = (carData.t + carData.speed) % 1;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (appRef.current) {
        appRef.current.destroy(true, true);
        appRef.current = null;
      }
    };
  }, [teams, circuit, trackPoints]);

  return <div ref={containerRef} className={`${styles.trackContainer} ${className}`} />;
}
