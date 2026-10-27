import { useEffect, useRef } from 'react';

export default function CanvasOverlay() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId = null;
    let W = 0;
    let H = 0;
    let isVisible = true;

    // Offscreen canvas to pre-render completely static isometric grid & brackets
    const bgCanvas = document.createElement('canvas');
    const bgCtx = bgCanvas.getContext('2d');

    const renderStaticBackground = (dpr) => {
      if (!bgCtx) return;
      bgCanvas.width = W * dpr;
      bgCanvas.height = H * dpr;
      bgCtx.setTransform(1, 0, 0, 1, 0, 0);
      bgCtx.scale(dpr, dpr);
      bgCtx.clearRect(0, 0, W, H);

      // Diagonal cross lines
      bgCtx.strokeStyle = 'rgba(42, 127, 255, 0.035)';
      bgCtx.lineWidth = 1;
      const spacing = 90;
      for (let x = -H; x < W + H; x += spacing) {
        bgCtx.beginPath();
        bgCtx.moveTo(x, 0);
        bgCtx.lineTo(x + H, H);
        bgCtx.stroke();

        bgCtx.beginPath();
        bgCtx.moveTo(x, 0);
        bgCtx.lineTo(x - H, H);
        bgCtx.stroke();
      }

      // Corner markers
      bgCtx.strokeStyle = 'rgba(42, 127, 255, 0.12)';
      bgCtx.lineWidth = 1;

      bgCtx.beginPath();
      bgCtx.moveTo(0, 0);
      bgCtx.lineTo(200, 0);
      bgCtx.lineTo(0, 200);
      bgCtx.closePath();
      bgCtx.stroke();

      bgCtx.beginPath();
      bgCtx.moveTo(W, 0);
      bgCtx.lineTo(W - 200, 0);
      bgCtx.lineTo(W, 200);
      bgCtx.closePath();
      bgCtx.stroke();

      // Brackets
      bgCtx.strokeStyle = 'rgba(77, 163, 255, 0.3)';
      bgCtx.lineWidth = 1.5;
      const s = 24;

      bgCtx.beginPath();
      bgCtx.moveTo(s, 0); bgCtx.lineTo(0, 0); bgCtx.lineTo(0, s);
      bgCtx.stroke();

      bgCtx.beginPath();
      bgCtx.moveTo(W - s, 0); bgCtx.lineTo(W, 0); bgCtx.lineTo(W, s);
      bgCtx.stroke();

      bgCtx.beginPath();
      bgCtx.moveTo(s, H); bgCtx.lineTo(0, H); bgCtx.lineTo(0, H - s);
      bgCtx.stroke();

      bgCtx.beginPath();
      bgCtx.moveTo(W - s, H); bgCtx.lineTo(W, H); bgCtx.lineTo(W, H - s);
      bgCtx.stroke();
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      renderStaticBackground(dpr);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Lightweight Particle System (optimized count)
    class GeoParticle {
      constructor() {
        this.reset(true);
      }
      reset(initial = false) {
        this.x = Math.random() * W;
        this.y = initial ? Math.random() * H : H + 10;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = -(Math.random() * 0.4 + 0.12);
        this.size = Math.random() * 1.4 + 0.6;
        this.opacity = Math.random() * 0.55 + 0.1;
        this.life = 0;
        this.maxLife = Math.random() * 300 + 160;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life++;
        if (this.life > this.maxLife || this.y < -20) {
          this.reset();
        }
      }
      draw() {
        const a = this.opacity * Math.sin((this.life / this.maxLife) * Math.PI);
        ctx.fillStyle = `rgba(42, 127, 255, ${a})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    class GeoLine {
      constructor() {
        this.reset(true);
      }
      reset(initial = false) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.45 + 0.2;
        this.x1 = Math.random() * W;
        this.y1 = initial ? Math.random() * H * 0.8 : H * 0.8 + Math.random() * H * 0.2;
        this.len = Math.random() * 80 + 25;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 0.35;
        this.opacity = Math.random() * 0.22 + 0.05;
        this.life = 0;
        this.maxLife = Math.random() * 200 + 90;
      }
      update() {
        this.x1 += this.vx;
        this.y1 += this.vy;
        this.life++;
        if (this.life > this.maxLife || this.y1 < -100) {
          this.reset();
        }
      }
      draw() {
        const a = this.opacity * Math.sin((this.life / this.maxLife) * Math.PI);
        const x2 = this.x1 + this.vx * this.len;
        const y2 = this.y1 + this.vy * this.len;
        const grad = ctx.createLinearGradient(this.x1, this.y1, x2, y2);
        grad.addColorStop(0, `rgba(77, 163, 255, ${a})`);
        grad.addColorStop(1, 'rgba(42, 127, 255, 0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      if (bgCanvas) ctx.drawImage(bgCanvas, 0, 0, W, H);
      return () => {
        window.removeEventListener('resize', resize);
      };
    }

    const particles = Array.from({ length: 32 }, () => new GeoParticle());
    const lines = Array.from({ length: 12 }, () => new GeoLine());

    // Pause canvas rendering when hero is scrolled out of viewport
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
        if (!isVisible && animId) {
          cancelAnimationFrame(animId);
          animId = null;
        } else if (isVisible && !animId && !document.hidden) {
          animId = requestAnimationFrame(render);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    // Pause when browser tab is inactive/hidden
    const handleVisibility = () => {
      if (document.hidden) {
        if (animId) {
          cancelAnimationFrame(animId);
          animId = null;
        }
      } else if (isVisible && !animId) {
        animId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const render = () => {
      if (!isVisible || document.hidden) {
        animId = null;
        return;
      }

      ctx.clearRect(0, 0, W, H);

      // Single GPU blit of pre-rendered background grid instead of re-stroking 40 paths every frame
      if (bgCanvas) {
        ctx.drawImage(bgCanvas, 0, 0, W, H);
      }

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      for (let i = 0; i < lines.length; i++) {
        lines[i].update();
        lines[i].draw();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} id="geo-canvas" aria-hidden="true" />;
}
