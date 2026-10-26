import { useEffect, useRef } from 'react';

export default function CanvasOverlay() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let W = 0;
    let H = 0;
    let isVisible = true;

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
    };

    resize();
    window.addEventListener('resize', resize);

    // Particle system
    class GeoParticle {
      constructor() {
        this.reset(true);
      }
      reset(initial = false) {
        this.x = Math.random() * W;
        this.y = initial ? Math.random() * H : H + 10;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = -(Math.random() * 0.45 + 0.12);
        this.size = Math.random() * 1.5 + 0.6;
        this.opacity = Math.random() * 0.6 + 0.1;
        this.life = 0;
        this.maxLife = Math.random() * 320 + 180;
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
        const speed = Math.random() * 0.5 + 0.2;
        this.x1 = Math.random() * W;
        this.y1 = initial ? Math.random() * H * 0.8 : H * 0.8 + Math.random() * H * 0.2;
        this.len = Math.random() * 90 + 25;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 0.4;
        this.opacity = Math.random() * 0.25 + 0.05;
        this.life = 0;
        this.maxLife = Math.random() * 220 + 100;
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
        ctx.lineWidth = 0.85;
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }

    const particles = Array.from({ length: 70 }, () => new GeoParticle());
    const lines = Array.from({ length: 28 }, () => new GeoLine());

    // Diagonal isometric cross grid
    const drawCrossLines = () => {
      ctx.save();
      ctx.strokeStyle = 'rgba(42, 127, 255, 0.035)';
      ctx.lineWidth = 1;
      const spacing = 90;
      for (let x = -H; x < W + H; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + H, H);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x - H, H);
        ctx.stroke();
      }
      ctx.restore();
    };

    // Geometric corner markers
    const drawCornerGeo = () => {
      ctx.save();
      ctx.strokeStyle = 'rgba(42, 127, 255, 0.12)';
      ctx.lineWidth = 1;

      // Top-left angled line
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(200, 0);
      ctx.lineTo(0, 200);
      ctx.closePath();
      ctx.stroke();

      // Top-right angled line
      ctx.beginPath();
      ctx.moveTo(W, 0);
      ctx.lineTo(W - 200, 0);
      ctx.lineTo(W, 200);
      ctx.closePath();
      ctx.stroke();

      // Corner tech brackets
      ctx.strokeStyle = 'rgba(77, 163, 255, 0.3)';
      ctx.lineWidth = 1.5;
      const s = 24;

      ctx.beginPath();
      ctx.moveTo(s, 0); ctx.lineTo(0, 0); ctx.lineTo(0, s);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(W - s, 0); ctx.lineTo(W, 0); ctx.lineTo(W, s);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(s, H); ctx.lineTo(0, H); ctx.lineTo(0, H - s);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(W - s, H); ctx.lineTo(W, H); ctx.lineTo(W, H - s);
      ctx.stroke();

      ctx.restore();
    };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      drawCrossLines();
      drawCornerGeo();
      return () => {
        window.removeEventListener('resize', resize);
      };
    }

    // Observer to pause canvas rendering when offscreen
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    const render = () => {
      animId = requestAnimationFrame(render);
      if (!isVisible) return;


      ctx.clearRect(0, 0, W, H);
      drawCrossLines();
      drawCornerGeo();

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      for (let i = 0; i < lines.length; i++) {
        lines[i].update();
        lines[i].draw();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} id="geo-canvas" aria-hidden="true" />;
}
