'use client';

import { useEffect, useRef } from 'react';

interface FloatingPill {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
  shape: 'pill' | 'capsule' | 'tablet';
  rotation: number;
  rotationSpeed: number;
}

export default function FloatingPillsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const pillsRef = useRef<FloatingPill[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize floating pills
    const initPills = () => {
      const pills: FloatingPill[] = [];
      const pillCount = 25;

      for (let i = 0; i < pillCount; i++) {
        pills.push({
          id: i,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 20 + 10,
          speed: Math.random() * 0.5 + 0.1,
          opacity: Math.random() * 0.4 + 0.1,
          color: getRandomPillColor(),
          shape: getRandomShape(),
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02
        });
      }
      pillsRef.current = pills;
    };

    const getRandomPillColor = () => {
      const colors = [
        'rgba(255, 255, 255, 0.3)',  // White
        'rgba(59, 130, 246, 0.2)',  // Blue
        'rgba(251, 146, 60, 0.3)',  // Orange
        'rgba(16, 185, 129, 0.2)',  // Teal
        'rgba(239, 68, 68, 0.2)',   // Red
        'rgba(168, 85, 247, 0.2)',  // Purple
        'rgba(245, 158, 11, 0.3)',  // Amber
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    };

    const getRandomShape = () => {
      const shapes: ('pill' | 'capsule' | 'tablet')[] = ['pill', 'capsule', 'tablet'];
      return shapes[Math.floor(Math.random() * shapes.length)];
    };

    // Draw pill functions
    const drawPill = (ctx: CanvasRenderingContext2D, pill: FloatingPill) => {
      ctx.save();
      ctx.globalAlpha = pill.opacity;
      ctx.translate(pill.x, pill.y);
      ctx.rotate(pill.rotation);

      switch (pill.shape) {
        case 'pill':
          drawRoundPill(ctx, pill);
          break;
        case 'capsule':
          drawCapsule(ctx, pill);
          break;
        case 'tablet':
          drawTablet(ctx, pill);
          break;
      }

      ctx.restore();
    };

    const drawRoundPill = (ctx: CanvasRenderingContext2D, pill: FloatingPill) => {
      ctx.fillStyle = pill.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, pill.size, pill.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Add highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.ellipse(-pill.size * 0.3, -pill.size * 0.2, pill.size * 0.3, pill.size * 0.2, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawCapsule = (ctx: CanvasRenderingContext2D, pill: FloatingPill) => {
      const halfWidth = pill.size;
      const halfHeight = pill.size * 0.4;
      
      // Main capsule body
      ctx.fillStyle = pill.color;
      ctx.beginPath();
      // Custom rounded rectangle implementation
      ctx.moveTo(-halfWidth, -halfHeight + halfHeight);
      ctx.lineTo(-halfWidth, halfHeight - halfHeight);
      ctx.quadraticCurveTo(-halfWidth, halfHeight, -halfWidth + halfHeight, halfHeight);
      ctx.lineTo(halfWidth - halfHeight, halfHeight);
      ctx.quadraticCurveTo(halfWidth, halfHeight, halfWidth, halfHeight - halfHeight);
      ctx.lineTo(halfWidth, -halfHeight + halfHeight);
      ctx.quadraticCurveTo(halfWidth, -halfHeight, halfWidth - halfHeight, -halfHeight);
      ctx.lineTo(-halfWidth + halfHeight, -halfHeight);
      ctx.quadraticCurveTo(-halfWidth, -halfHeight, -halfWidth, -halfHeight + halfHeight);
      ctx.closePath();
      ctx.fill();
      
      // Golden liquid inside
      ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
      ctx.beginPath();
      const innerHalfWidth = halfWidth * 0.8;
      const innerHalfHeight = halfHeight * 0.7;
      ctx.moveTo(-innerHalfWidth, -innerHalfHeight + innerHalfHeight);
      ctx.lineTo(-innerHalfWidth, innerHalfHeight - innerHalfHeight);
      ctx.quadraticCurveTo(-innerHalfWidth, innerHalfHeight, -innerHalfWidth + innerHalfHeight, innerHalfHeight);
      ctx.lineTo(innerHalfWidth - innerHalfHeight, innerHalfHeight);
      ctx.quadraticCurveTo(innerHalfWidth, innerHalfHeight, innerHalfWidth, innerHalfHeight - innerHalfHeight);
      ctx.lineTo(innerHalfWidth, -innerHalfHeight + innerHalfHeight);
      ctx.quadraticCurveTo(innerHalfWidth, -innerHalfHeight, innerHalfWidth - innerHalfHeight, -innerHalfHeight);
      ctx.lineTo(-innerHalfWidth + innerHalfHeight, -innerHalfHeight);
      ctx.quadraticCurveTo(-innerHalfWidth, -innerHalfHeight, -innerHalfWidth, -innerHalfHeight + innerHalfHeight);
      ctx.closePath();
      ctx.fill();
      
      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.ellipse(-halfWidth * 0.5, -halfHeight * 0.5, halfWidth * 0.3, halfHeight * 0.2, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawTablet = (ctx: CanvasRenderingContext2D, pill: FloatingPill) => {
      const width = pill.size * 1.5;
      const height = pill.size * 0.8;
      const radius = height * 0.2;
      
      // Main tablet body
      ctx.fillStyle = pill.color;
      ctx.beginPath();
      ctx.moveTo(-width/2 + radius, -height/2);
      ctx.lineTo(width/2 - radius, -height/2);
      ctx.quadraticCurveTo(width/2, -height/2, width/2, -height/2 + radius);
      ctx.lineTo(width/2, height/2 - radius);
      ctx.quadraticCurveTo(width/2, height/2, width/2 - radius, height/2);
      ctx.lineTo(-width/2 + radius, height/2);
      ctx.quadraticCurveTo(-width/2, height/2, -width/2, height/2 - radius);
      ctx.lineTo(-width/2, -height/2 + radius);
      ctx.quadraticCurveTo(-width/2, -height/2, -width/2 + radius, -height/2);
      ctx.closePath();
      ctx.fill();
      
      // Center line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-width * 0.3, 0);
      ctx.lineTo(width * 0.3, 0);
      ctx.stroke();
      
      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      const highlightWidth = width * 0.5;
      const highlightHeight = height * 0.3;
      const highlightRadius = highlightHeight * 0.1;
      ctx.moveTo(-width/2 + highlightRadius, -height/2);
      ctx.lineTo(-width/2 + highlightWidth - highlightRadius, -height/2);
      ctx.quadraticCurveTo(-width/2 + highlightWidth, -height/2, -width/2 + highlightWidth, -height/2 + highlightRadius);
      ctx.lineTo(-width/2 + highlightWidth, -height/2 + highlightHeight - highlightRadius);
      ctx.quadraticCurveTo(-width/2 + highlightWidth, -height/2 + highlightHeight, -width/2 + highlightWidth - highlightRadius, -height/2 + highlightHeight);
      ctx.lineTo(-width/2 + highlightRadius, -height/2 + highlightHeight);
      ctx.quadraticCurveTo(-width/2, -height/2 + highlightHeight, -width/2, -height/2 + highlightHeight - highlightRadius);
      ctx.closePath();
      ctx.fill();
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      pillsRef.current.forEach((pill) => {
        // Update position
        pill.y -= pill.speed;
        pill.x += Math.sin(pill.y * 0.01) * 0.5;
        pill.rotation += pill.rotationSpeed;

        // Reset position if out of bounds
        if (pill.y < -pill.size * 2) {
          pill.y = canvas.height + pill.size * 2;
          pill.x = Math.random() * canvas.width;
        }

        // Draw pill
        drawPill(ctx, pill);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Initialize and start animation
    initPills();
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          background: 'transparent'
        }}
      />
    </div>
  );
}
