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
      { x: 68/571, y: 396/425 },       // Start point (Turn 1)
      { x: 107/571, y: 287.082/425 },  // Turn 1 descent
      { x: 107/571, y: 160/425 },      // Bottom of Turn 1
      { x: 221/571, y: 206/425 },      // Turn 3 (Beau Rivage)
      { x: 331/571, y: 231.507/425 },  // Turn 4-5 (Massenet/Casino)
      { x: 450/571, y: 192/425 },      // Turn 6 (Mirabeau Haute)
      { x: 569/571, y: 27/425 },       // Top-right (Portier entrance)
      { x: 417/571, y: 1.5/425 },      // Tunnel exit (Approximation)
      { x: 337.347/571, y: 77.3602/425 }, // Turn 10 (Nouvelle Chicane)
      { x: 361.452/571, y: 127.787/425 }, // Turn 11 (Tabac)
      { x: 141/571, y: 128.5/425 },    // Left edge (Piscine complex)
      { x: 78/571, y: 109/425 },       // Turn 14 (La Rascasse)
      { x: 45/571, y: 149/425 },       // Turn 15 (Anthony Noghes)
      { x: 1.93826/571, y: 424.843/425 }, // Bottom-left corner
      { x: 67.8014/571, y: 395.541/425 }, // Approach to start line
      { x: 68/571, y: 396/425 }        // Duplicated start point
    ],
    kyalami: [
      { x: 0.307635/509, y: 313.606/347 },   // Start/finish straight
      { x: 41.3076/509, y: 345.606/347 },    // Turn 1 (Leeukop)
      { x: 204/509, y: 274/347 },            // Turn 2 (Barbeque)
      { x: 213.503/509, y: 186.943/347 },    // Turn 3 (Mineshaft)
      { x: 279.301/509, y: 235.601/347 },    // Turn 4 (Grip)
      { x: 288.498/509, y: 345.959/347 },    // Turn 5 (Kink before Back Straight)
      { x: 342.807/509, y: 322.539/347 },    // Turn 6 (The Crocodiles)
      { x: 508.639/509, y: 149.654/347 },    // Turn 7 (Sunset)
      { x: 508.5/509, y: 41/347 },          // Turn 8 (Clubhouse)
      { x: 447.721/509, y: 0.414975/347 },   // Turn 9 (The Esses)
      { x: 315.393/509, y: 169.309/347 },    // Turn 10 (Schafer)
      { x: 225.655/509, y: 84.3616/347 },    // Turn 11 (Malmsbury)
      { x: 131.38/509, y: 195.325/347 },     // Turn 12 (Rocket)
      { x: 135.492/509, y: 246.029/347 },    // Turn 13 (Entry to final complex)
      { x: 2.94305/509, y: 309.871/347 },    // Turn 14 (Crowthorne)
      { x: 0.307635/509, y: 313.606/347 }    // Return to start/finish
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
