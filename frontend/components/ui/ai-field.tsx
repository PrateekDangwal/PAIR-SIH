'use client';

import { useEffect, useRef } from 'react';

export function AIField({ intensity = 1 }: { intensity?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let raf = 0;
    let width = 0;
    let height = 0;
    const pointer = { x: 0.5, y: 0.5, active: false };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = (e.clientX - r.left) / r.width;
      pointer.y = (e.clientY - r.top) / r.height;
      pointer.active = true;
    };
    const onLeave = () => { pointer.active = false; };

    const count = Math.min(34, Math.max(18, Math.floor(width / 34)));
    const nodes = Array.from({ length: count }, (_, i) => ({
      x: ((i * 47) % 101) / 100,
      y: ((i * 71) % 101) / 100,
      phase: i * 1.7,
      speed: 0.00012 + (i % 4) * 0.000035,
    }));

    const draw = () => {
      frame += 1;
      ctx.clearRect(0, 0, width, height);
      const t = frame;

      for (let i = 0; i < nodes.length; i += 1) {
        const n = nodes[i];
        const x = n.x * width + Math.sin(t * n.speed + n.phase) * 16;
        const y = n.y * height + Math.cos(t * n.speed * 1.3 + n.phase) * 13;
        for (let j = i + 1; j < nodes.length; j += 1) {
          const m = nodes[j];
          const mx = m.x * width + Math.sin(t * m.speed + m.phase) * 16;
          const my = m.y * height + Math.cos(t * m.speed * 1.3 + m.phase) * 13;
          const dx = x - mx;
          const dy = y - my;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 145) {
            const alpha = (1 - distance / 145) * 0.12 * intensity;
            ctx.strokeStyle = `rgba(148, 163, 184, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(mx, my);
            ctx.stroke();
          }
        }
        const dx = x - pointer.x * width;
        const dy = y - pointer.y * height;
        const near = Math.sqrt(dx * dx + dy * dy) < 170;
        ctx.fillStyle = near && pointer.active
          ? `rgba(167,139,250,${0.7 * intensity})`
          : `rgba(148,163,184,${0.22 * intensity})`;
        ctx.beginPath();
        ctx.arc(x, y, near && pointer.active ? 2.2 : 1.15, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, [intensity]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-auto absolute inset-0 h-full w-full opacity-80"
    />
  );
}
