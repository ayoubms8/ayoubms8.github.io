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
    let isPointerDown = false;
    const activeEffects = [];
    const MAX_ACTIVE_EFFECTS = 8;

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
        transition: opacity 0.25s ease, box-shadow 0.2s ease;
      `;
      containerRef.current?.appendChild(dot);
      return { el: dot, x: -100, y: -100, half, factor, opacity };
    });

    const createClickEffect = (x, y) => {
      if (!containerRef.current) return;

      // Cap concurrent animations to keep performance snappy
      if (activeEffects.length >= MAX_ACTIVE_EFFECTS) {
        const oldest = activeEffects.shift();
        if (oldest && oldest.parentNode) {
          oldest.remove();
        }
      }

      const wrapper = document.createElement('div');
      wrapper.className = 'cursor-click-container';
      wrapper.style.transform = `translate3d(${x}px, ${y}px, 0)`;

      const core = document.createElement('div');
      core.className = 'cursor-click-core';
      wrapper.appendChild(core);

      const ring = document.createElement('div');
      ring.className = 'cursor-click-ring';
      wrapper.appendChild(ring);

      const reticle = document.createElement('div');
      reticle.className = 'cursor-click-reticle';
      wrapper.appendChild(reticle);

      // 6 radiating cyber sparks
      for (let i = 0; i < 6; i++) {
        const spark = document.createElement('div');
        spark.className = 'cursor-click-spark';
        const angle = (i * 60 + (i % 2 === 0 ? 8 : -8)) * (Math.PI / 180);
        const dist = 22 + (i % 2) * 8;
        const pdx = `${(Math.cos(angle) * dist).toFixed(1)}px`;
        const pdy = `${(Math.sin(angle) * dist).toFixed(1)}px`;
        spark.style.setProperty('--pdx', pdx);
        spark.style.setProperty('--pdy', pdy);
        wrapper.appendChild(spark);
      }

      containerRef.current.appendChild(wrapper);
      activeEffects.push(wrapper);

      let cleaned = false;
      const cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        const idx = activeEffects.indexOf(wrapper);
        if (idx !== -1) activeEffects.splice(idx, 1);
        if (wrapper.parentNode) wrapper.remove();
      };

      ring.addEventListener('animationend', cleanup, { once: true });
      setTimeout(cleanup, 500);
    };

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

        const scaleStr = (i === 0 && isPointerDown) ? ' scale(1.4)' : '';
        t.el.style.transform = `translate3d(${(t.x - t.half).toFixed(1)}px, ${(t.y - t.half).toFixed(1)}px, 0)${scaleStr}`;

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

    const handlePointerDown = (e) => {
      if (e.button !== 0) return;
      isPointerDown = true;
      createClickEffect(e.clientX, e.clientY);

      if (trail[0]) {
        trail[0].el.style.boxShadow = '0 0 14px #00f0ff, 0 0 22px rgba(77, 163, 255, 0.8)';
        trail[0].el.style.transform = `translate3d(${(trail[0].x - trail[0].half).toFixed(1)}px, ${(trail[0].y - trail[0].half).toFixed(1)}px, 0) scale(1.4)`;
      }
    };

    const handlePointerUp = (e) => {
      if (e.button !== 0) return;
      isPointerDown = false;

      if (trail[0]) {
        trail[0].el.style.boxShadow = '0 0 9px rgba(42, 127, 255, 0.6)';
        trail[0].el.style.transform = `translate3d(${(trail[0].x - trail[0].half).toFixed(1)}px, ${(trail[0].y - trail[0].half).toFixed(1)}px, 0)`;
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
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      trail.forEach((t) => t.el.remove());
      activeEffects.forEach((el) => el.remove());
    };
  }, []);

  return <div ref={containerRef} aria-hidden="true" />;
}
