"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  phase: number;
  phaseSpeed: number;
}

const COLORS = ["#00D4AA", "#7B61FF", "#36B8F5"];
const PARTICLE_COUNT = 75;
const MAX_VELOCITY = 0.28;
const CONNECTION_DISTANCE = 110;
const CANVAS_OPACITY = 0.35;

function createParticle(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * MAX_VELOCITY * 2,
    vy: (Math.random() - 0.5) * MAX_VELOCITY * 2,
    radius: 1.2 + Math.random() * 2.8,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    phase: Math.random() * Math.PI * 2,
    phaseSpeed: 0.005 + Math.random() * 0.015,
  };
}

export function ColonyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => createParticle(w, h));

    function resize() {
      w = canvas!.width = window.innerWidth;
      h = canvas!.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);

    function draw() {
      ctx!.globalAlpha = CANVAS_OPACITY;
      ctx!.clearRect(0, 0, w, h);
      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.phase += p.phaseSpeed;
        const alpha = 0.5 + 0.5 * Math.sin(p.phase);

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -50) p.x = w + 50;
        if (p.x > w + 50) p.x = -50;
        if (p.y < -50) p.y = h + 50;
        if (p.y > h + 50) p.y = -50;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx!.fillStyle = p.color;
        ctx!.shadowColor = p.color;
        ctx!.shadowBlur = 6 + p.radius * 2;
        ctx!.globalAlpha = alpha * CANVAS_OPACITY;
        ctx!.fill();
        ctx!.shadowBlur = 0;

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DISTANCE) {
            const lineAlpha = (1 - dist / CONNECTION_DISTANCE) * 0.18;
            ctx!.beginPath();
            ctx!.moveTo(p.x, p.y);
            ctx!.lineTo(q.x, q.y);
            ctx!.strokeStyle = p.color;
            ctx!.globalAlpha = lineAlpha * CANVAS_OPACITY;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
