import { useEffect, useRef } from 'react';
import styles from '../styles/TrackVisualization.module.css';

export default function TrackVisualization({ teams = [], className = '' }) {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const carsRef = useRef(new Map());
  const animationRef = useRef(null);

  // Key normalized positions for Monaco Grand Prix (0-1 range)
  const trackPoints = [
    { x: 0.05, y: 0.9 },  // Sainte Dévote
    { x: 0.15, y: 0.75 }, // Beau Rivage
    { x: 0.25, y: 0.7 },  // Massenet
    { x: 0.35, y: 0.65 }, // Casino
    { x: 0.4, y: 0.55 },  // Mirabeau Haute
    { x: 0.42, y: 0.45 }, // Grand Hôtel Hairpin
    { x: 0.45, y: 0.35 }, // Mirabeau Bas
    { x: 0.55, y: 0.3 },  // Portier
    { x: 0.65, y: 0.25 }, // Tunnel entry
    { x: 0.75, y: 0.25 }, // Tunnel exit
    { x: 0.8, y: 0.3 },   // Nouvelle Chicane
    { x: 0.82, y: 0.4 },  // Tabac
    { x: 0.85, y: 0.5 },  // Louis Chiron
    { x: 0.87, y: 0.6 },  // Piscine
    { x: 0.85, y: 0.7 },  // Rascasse
    { x: 0.8, y: 0.8 },   // Antony Noghès / Pit straight
    { x: 0.05, y: 0.9 }   // back to start
  ];

  useEffect(() => {
    if (!containerRef.current || !window.PIXI) return;

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

    // Draw the track path
    const track = new window.PIXI.Graphics();
    track.lineStyle(4, 0xFF6B35, 1);
    track.moveTo(trackPoints[0].x * app.screen.width, trackPoints[0].y * app.screen.height);

    for (let i = 1; i < trackPoints.length; i++) {
      const p = trackPoints[i];
      track.lineTo(p.x * app.screen.width, p.y * app.screen.height);
    }

    app.stage.addChild(track);

    // Draw start/finish line
    const startLine = new window.PIXI.Graphics();
    startLine.lineStyle(6, 0xFFFFFF, 1);
    const start = trackPoints[0];
    startLine.moveTo((start.x - 0.01) * app.screen.width, (start.y - 0.01) * app.screen.height);
    startLine.lineTo((start.x + 0.01) * app.screen.width, (start.y + 0.01) * app.screen.height);
    app.stage.addChild(startLine);

    // Create cars
    const cars = new Map();
    teams.slice(0, 10).forEach((team, index) => {
      const car = new window.PIXI.Graphics();
      const color = parseInt(team.performance_color?.replace('#','') || '808080', 16);

      // F1-style polygon
      car.beginFill(color);
      car.drawPolygon([0,-6, 4,4, -4,4]);
      car.endFill();
      car.pivot.set(0, 0);

      app.stage.addChild(car);
      cars.set(team.id, { container: car, t: team.track_position / 100 });
    });
    carsRef.current = cars;

    // Animate cars along track
    const animate = () => {
      cars.forEach(({ container, t }) => {
        const pathLength = trackPoints.length - 1;
        const idx = Math.floor(t * pathLength);
        const nextIdx = (idx + 1) % trackPoints.length;
        const ratio = t * pathLength - idx;

        const x = trackPoints[idx].x * (1 - ratio) + trackPoints[nextIdx].x * ratio;
        const y = trackPoints[idx].y * (1 - ratio) + trackPoints[nextIdx].y * ratio;

        container.x = x * app.screen.width;
        container.y = y * app.screen.height;

        const dx = trackPoints[nextIdx].x - trackPoints[idx].x;
        const dy = trackPoints[nextIdx].y - trackPoints[idx].y;
        container.rotation = Math.atan2(dy, dx);
      });

      cars.forEach(c => c.t += 0.001); // speed
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (appRef.current) appRef.current.destroy(true);
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [teams]);

  return <div ref={containerRef} className={`${styles.trackContainer} ${className}`} />;
}
