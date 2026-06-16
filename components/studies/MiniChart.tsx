"use client";

import { useEffect, useRef } from "react";
import type { StudyTaxon, Taxon } from "@prisma/client";

type TaxaWithTaxon = StudyTaxon & { taxon: Taxon };

type MiniChartProps = {
  taxa: TaxaWithTaxon[];
  className?: string;
};

export function MiniChart({ taxa }: MiniChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.parentElement?.getBoundingClientRect();
    const w = (canvas.width = rect?.width || 280);
    const h = (canvas.height = 48);
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const barHeight = 6;
    const gap = 4;
    const maxVal = Math.max(...taxa.map((t) => Math.abs(t.magnitude || 1)), 1);

    ctx.clearRect(0, 0, w, h);

    taxa.slice(0, 6).forEach((st, i) => {
      const y = 8 + i * (barHeight + gap);
      const val = Math.abs(st.magnitude || 1);
      const barWidth = Math.max(12, (val / maxVal) * (w - 60));

      const gradient = ctx.createLinearGradient(0, 0, barWidth, 0);
      if (st.direction === "UP") {
        gradient.addColorStop(0, "rgba(0, 212, 170, 0.7)");
        gradient.addColorStop(1, "rgba(0, 212, 170, 0.1)");
      } else if (st.direction === "DOWN") {
        gradient.addColorStop(0, "rgba(255, 77, 106, 0.7)");
        gradient.addColorStop(1, "rgba(255, 77, 106, 0.1)");
      } else {
        gradient.addColorStop(0, "rgba(123, 97, 255, 0.5)");
        gradient.addColorStop(1, "rgba(123, 97, 255, 0.1)");
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(0, y, barWidth, barHeight, 2);
      ctx.fill();

      ctx.fillStyle =
        st.direction === "UP"
          ? "#00D4AA"
          : st.direction === "DOWN"
            ? "#FF4D6A"
            : "#7B61FF";
      ctx.font = '9px "JetBrains Mono"';
      ctx.textBaseline = "middle";
      ctx.fillText(
        st.taxon.species || st.taxon.genus,
        barWidth + 6,
        y + barHeight / 2
      );
    });

    const gradient = ctx.createLinearGradient(0, h * 0.6, 0, h);
    gradient.addColorStop(0, "rgba(7, 9, 15, 0)");
    gradient.addColorStop(1, "rgba(7, 9, 15, 0.6)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, h * 0.6, w, h * 0.4);
  }, [taxa]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-12"
      style={{ imageRendering: "auto" }}
    />
  );
}
