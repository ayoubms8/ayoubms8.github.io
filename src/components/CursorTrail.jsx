import { useEffect, useRef } from 'react';

const TRAIL_LEN = 7;

export default function CursorTrail() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Only enable for mouse/trackpad pointer devices, avoid touch screens and users requesting reduced motion
    if (
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }


    let mouseX = -100;
    let mouseY = -100;
    let animId;

    const trail = Array.from({ length: TRAIL_LEN }, (_, i) => {
      const dot = document.createElement('div');
      dot.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: rgba(77, 163, 255, ${0.45 - i * 0.055});
        box-shadow: 0 0 6px rgba(42, 127, 255, 0.5);
        transform: translate(-50%, -50%);
        transition: opacity 0.3s;
        will-change: left, top;
      `;
      containerRef.current?.appendChild(dot);
      return { el: dot, x: -100, y: -100 };
    });

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const updateTrail = () => {
      let lx = mouseX;
      let ly = mouseY;

      trail.forEach((t, i) => {
        const factor = 0.38 - i * 0.035;
        t.x += (lx - t.x) * factor;
        t.y += (ly - t.y) * factor;
        t.el.style.left = `${t.x}px`;
        t.el.style.top = `${t.y}px`;
        lx = t.x;
        ly = t.y;
      });

      animId = requestAnimationFrame(updateTrail);
    };

    updateTrail();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      trail.forEach((t) => t.el.remove());
    };
  }, []);

  return <div ref={containerRef} aria-hidden="true" />;
}
