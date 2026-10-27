import { useEffect, useRef } from 'react';

const TRAIL_CONFIG = [
  { size: 6, opacity: 0.75, factor: 0.72 },
  { size: 5, opacity: 0.60, factor: 0.58 },
  { size: 4.5, opacity: 0.48, factor: 0.48 },
  { size: 4, opacity: 0.38, factor: 0.40 },
  { size: 3.5, opacity: 0.28, factor: 0.34 },
  { size: 3, opacity: 0.20, factor: 0.28 }
];

export default function CursorTrail() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Only enable for mouse/trackpad pointer devices; respect reduced-motion
    if (
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    let targetX = -100;
    let targetY = -100;
    let animId = null;
    let isRunning = false;

    const trail = TRAIL_CONFIG.map(({ size, opacity, factor }) => {
      const dot = document.createElement('div');
      const half = size / 2;
      dot.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 9999;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(77, 163, 255, ${opacity});
        box-shadow: 0 0 ${Math.max(4, size * 1.5)}px rgba(42, 127, 255, 0.6);
        will-change: transform;
        transform: translate3d(-100px, -100px, 0);
        transition: opacity 0.25s ease;
      `;
      containerRef.current?.appendChild(dot);
      return { el: dot, x: -100, y: -100, half, factor, opacity };
    });

    const updateTrail = () => {
      let leaderX = targetX;
      let leaderY = targetY;
      let totalDist = 0;

      for (let i = 0; i < trail.length; i++) {
        const t = trail[i];
        const dx = leaderX - t.x;
        const dy = leaderY - t.y;

        t.x += dx * t.factor;
        t.y += dy * t.factor;

        t.el.style.transform = `translate3d(${(t.x - t.half).toFixed(1)}px, ${(t.y - t.half).toFixed(1)}px, 0)`;

        leaderX = t.x;
        leaderY = t.y;
        totalDist += Math.abs(dx) + Math.abs(dy);
      }

      // If dots have fully caught up to cursor, sleep to preserve 0% CPU
      if (totalDist > 0.2) {
        animId = requestAnimationFrame(updateTrail);
      } else {
        isRunning = false;
        animId = null;
      }
    };

    const handleMouseMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;

      if (!isRunning) {
        isRunning = true;
        animId = requestAnimationFrame(updateTrail);
      }
    };

    const handleMouseLeave = () => {
      trail.forEach((t) => {
        t.el.style.opacity = '0';
      });
    };

    const handleMouseEnter = () => {
      trail.forEach((t) => {
        t.el.style.opacity = String(t.opacity);
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      trail.forEach((t) => t.el.remove());
    };
  }, []);

  return <div ref={containerRef} aria-hidden="true" />;
}
