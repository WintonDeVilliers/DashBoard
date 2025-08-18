import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";

const MonacoMiniMap = () => {
  const pixiContainer = useRef(null);

  useEffect(() => {
    // Make sure we're running in the browser
    if (!pixiContainer.current || typeof window === "undefined") return;

    const app = new PIXI.Application({
      width: 400,
      height: 200,
      backgroundAlpha: 0,
    });

    // Append Pixi canvas
    pixiContainer.current.appendChild(app.view);

    // Draw simplified Monaco track
    const track = new PIXI.Graphics();
    track.lineStyle(4, 0x000000, 1);
    track.moveTo(50, 150);
    track.bezierCurveTo(100, 100, 200, 100, 250, 150);
    track.lineTo(300, 100);
    track.bezierCurveTo(320, 90, 350, 120, 370, 80);
    track.lineTo(370, 120);
    track.bezierCurveTo(350, 160, 300, 130, 250, 180);
    track.lineTo(200, 150);
    track.bezierCurveTo(150, 120, 100, 160, 50, 150);
    app.stage.addChild(track);

    // Vehicle icon
    const vehicle = new PIXI.Graphics();
    vehicle.beginFill(0x808080);
    vehicle.drawCircle(0, 0, 6);
    vehicle.endFill();
    vehicle.x = 50;
    vehicle.y = 150;
    app.stage.addChild(vehicle);

    // Simple animation
    let t = 0;
    const animate = () => {
      t += 0.005;
      if (t > 1) t = 0;
      vehicle.x = 50 + t * 320;
      vehicle.y = 150 - Math.sin(t * Math.PI * 2) * 70;
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      app.destroy(true, { children: true });
    };
  }, []);

  return <div ref={pixiContainer} style={{ width: 400, height: 200 }} />;
};

export default MonacoMiniMap;
