"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import type { TaxonNode, TaxonEdge } from "@/types";

const PHYLUM_COLORS: Record<string, string> = {
  Firmicutes: "#00D4AA",
  Bacteroidetes: "#7B61FF",
  Proteobacteria: "#F5A623",
  Actinobacteria: "#FF4D6A",
  Verrucomicrobia: "#36B8F5",
};

type StudyRef = { id: string; title: string; evidenceScore: number };

type GraphData = {
  nodes: TaxonNode[];
  edges: TaxonEdge[];
  taxonStudies: Record<string, StudyRef[]>;
};

export function KnowledgeGraph({ nodes: initialNodes, edges: initialEdges, taxonStudies }: GraphData) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const nodesRef = useRef<TaxonNode[]>([]);
  const edgesRef = useRef<TaxonEdge[]>(initialEdges);
  const offsetRef = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(1);
  const [scale, setScale] = useState(1);
  const [selectedNode, setSelectedNode] = useState<TaxonNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<TaxonNode | null>(null);
  const [search, setSearch] = useState("");
  const [relatedStudies, setRelatedStudies] = useState<StudyRef[]>([]);
  const dragRef = useRef({ x: 0, y: 0, dragging: false, draggedNode: null as TaxonNode | null });
  const sizeRef = useRef({ w: 800, h: 500 });

  const getStudiesForNode = useCallback((node: TaxonNode) => {
    return taxonStudies[node.id] || [];
  }, [taxonStudies]);

  useEffect(() => {
    const cx = sizeRef.current.w / 2;
    const cy = sizeRef.current.h / 2;
    nodesRef.current = initialNodes.map((n) => ({
      ...n,
      x: cx + (Math.random() - 0.5) * 300,
      y: cy + (Math.random() - 0.5) * 200,
      vx: 0,
      vy: 0,
    }));
    edgesRef.current = initialEdges;
  }, [initialNodes, initialEdges, taxonStudies]);

  const resize = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const rect = container.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    sizeRef.current = { w, h };
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  const simulate = useCallback(() => {
    const nodes = nodesRef.current;
    const edges = edgesRef.current;
    const { w, h } = sizeRef.current;
    const cx = w / 2;
    const cy = h / 2;

    for (let i = 0; i < nodes.length; i++) {
      const dx = nodes[i].x - cx;
      const dy = nodes[i].y - cy;
      nodes[i].vx -= dx * 0.0001;
      nodes[i].vy -= dy * 0.0001;

      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const force = 800 / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        nodes[i].vx -= fx;
        nodes[i].vy -= fy;
        nodes[j].vx += fx;
        nodes[j].vy += fy;
      }
    }

    for (const edge of edges) {
      const src = nodes.find((n) => n.id === edge.source);
      const tgt = nodes.find((n) => n.id === edge.target);
      if (!src || !tgt) continue;
      const dx = tgt.x - src.x;
      const dy = tgt.y - src.y;
      const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const target = 80 + edge.weight * 15;
      const force = (dist - target) * 0.003;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      src.vx += fx;
      src.vy += fy;
      tgt.vx -= fx;
      tgt.vy -= fy;
    }

    for (const node of nodes) {
      if (dragRef.current.draggedNode === node) continue;
      node.vx *= 0.88;
      node.vy *= 0.88;
      node.x += node.vx;
      node.y += node.vy;
      const r = Math.max(14, Math.min(44, Math.log(node.studyCount + 1) * 14));
      if (node.x < r + 10) { node.x = r + 10; node.vx *= -0.5; }
      if (node.x > w - r - 10) { node.x = w - r - 10; node.vx *= -0.5; }
      if (node.y < r + 10) { node.y = r + 10; node.vy *= -0.5; }
      if (node.y > h - r - 30) { node.y = h - r - 30; node.vy *= -0.5; }
    }
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    simulate();

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(offsetRef.current.x, offsetRef.current.y);
    ctx.scale(scaleRef.current, scaleRef.current);

    // Edges
    for (const edge of edgesRef.current) {
      const src = nodesRef.current.find((n) => n.id === edge.source);
      const tgt = nodesRef.current.find((n) => n.id === edge.target);
      if (!src || !tgt) continue;

      const r1 = Math.max(14, Math.min(44, Math.log(src.studyCount + 1) * 14));
      const dx = tgt.x - src.x;
      const dy = tgt.y - src.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ux = dx / dist;
      const uy = dy / dist;

      ctx.beginPath();
      ctx.moveTo(src.x + ux * r1, src.y + uy * r1);
      ctx.lineTo(tgt.x - ux * r1, tgt.y - uy * r1);

      const alpha = edge.correlation === "positive" ? 0.2 : edge.correlation === "negative" ? 0.15 : 0.08;
      ctx.strokeStyle =
        edge.correlation === "positive"
          ? `rgba(0,212,170,${alpha})`
          : edge.correlation === "negative"
            ? `rgba(255,77,106,${alpha})`
            : `rgba(143,168,200,${alpha})`;
      ctx.lineWidth = Math.min(3, edge.weight * 0.6 + 0.5);
      ctx.stroke();
    }

    // Nodes
    for (const node of nodesRef.current) {
      const r = Math.max(14, Math.min(44, Math.log(node.studyCount + 1) * 14));
      const isHovered = hoveredNode?.id === node.id;
      const isSelected = selectedNode?.id === node.id;

      // Outer glow ring (selection/hover)
      if (isSelected || isHovered) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, r + 6, 0, Math.PI * 2);
        ctx.fillStyle = PHYLUM_COLORS[node.phylum] ? `${PHYLUM_COLORS[node.phylum]}20` : "rgba(54,184,245,0.1)";
        ctx.fill();
      }

      // Main circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      const baseColor = PHYLUM_COLORS[node.phylum] || "#36B8F5";
      const gradient = ctx.createRadialGradient(node.x - r * 0.3, node.y - r * 0.3, 0, node.x, node.y, r);
      gradient.addColorStop(0, baseColor + "CC");
      gradient.addColorStop(0.7, baseColor + "99");
      gradient.addColorStop(1, baseColor + "44");
      ctx.fillStyle = gradient;
      ctx.shadowColor = baseColor;
      ctx.shadowBlur = isHovered || isSelected ? 18 : 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Inner dot
      ctx.beginPath();
      ctx.arc(node.x, node.y, r * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fill();

      // Count badge
      if (r > 18) {
        ctx.fillStyle = "#FFF";
        ctx.font = '600 10px "Inter"';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(node.studyCount), node.x, node.y);
        ctx.textBaseline = "alphabetic";
      }
    }

    // Labels (drawn on top, after all nodes)
    for (const node of nodesRef.current) {
      const r = Math.max(14, Math.min(44, Math.log(node.studyCount + 1) * 14));
      const label = node.species || node.genus;
      const isSelected = selectedNode?.id === node.id;

      if (isSelected || scaleRef.current > 0.7) {
        ctx.font = isSelected ? '500 11px "Inter"' : '400 10px "Inter"';
        const metrics = ctx.measureText(label);
        const lw = metrics.width + 10;
        const lh = 18;
        const ly = node.y + r + 12;

        ctx.fillStyle = "#0D1526CC";
        ctx.beginPath();
        ctx.roundRect(node.x - lw / 2, ly - lh / 2, lw, lh, 4);
        ctx.fill();

        ctx.fillStyle = isSelected ? "#E8F4F1" : "#8FA8C8";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, node.x, ly);
        ctx.textBaseline = "alphabetic";
      }
    }

    ctx.restore();

    animRef.current = requestAnimationFrame(draw);
  }, [simulate, hoveredNode, selectedNode]);

  useEffect(() => {
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  // Mouse handlers
  const toCanvasCoords = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const mx = (e.clientX - rect.left - offsetRef.current.x) / scaleRef.current;
    const my = (e.clientY - rect.top - offsetRef.current.y) / scaleRef.current;
    return { x: mx, y: my };
  }, []);

  const findNodeAt = useCallback((cx: number, cy: number) => {
    for (const node of nodesRef.current) {
      const r = Math.max(14, Math.min(44, Math.log(node.studyCount + 1) * 14)) + 4;
      const dx = cx - node.x;
      const dy = cy - node.y;
      if (dx * dx + dy * dy < r * r) return node;
    }
    return null;
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const { x, y } = toCanvasCoords(e);
    const node = findNodeAt(x, y);
    if (node) {
      dragRef.current = { x: e.clientX, y: e.clientY, dragging: true, draggedNode: node };
    } else {
      dragRef.current = { x: e.clientX - offsetRef.current.x, y: e.clientY - offsetRef.current.y, dragging: true, draggedNode: null };
    }
  }, [toCanvasCoords, findNodeAt]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const { x, y } = toCanvasCoords(e);
    const node = findNodeAt(x, y);
    setHoveredNode(node);

    if (!dragRef.current.dragging) return;

    if (dragRef.current.draggedNode) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mx = (e.clientX - rect.left - offsetRef.current.x) / scaleRef.current;
      const my = (e.clientY - rect.top - offsetRef.current.y) / scaleRef.current;
      dragRef.current.draggedNode.x = mx;
      dragRef.current.draggedNode.y = my;
      dragRef.current.draggedNode.vx = 0;
      dragRef.current.draggedNode.vy = 0;
    } else {
      const newX = e.clientX - dragRef.current.x;
      const newY = e.clientY - dragRef.current.y;
      offsetRef.current = { x: newX, y: newY };
    }
  }, [toCanvasCoords, findNodeAt]);

  const handleMouseUp = useCallback(() => {
    dragRef.current.dragging = false;
    dragRef.current.draggedNode = null;
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const { x, y } = toCanvasCoords(e);
    const node = findNodeAt(x, y);
    if (node) {
      setSelectedNode(node);
      setRelatedStudies(getStudiesForNode(node));
    } else {
      setSelectedNode(null);
      setRelatedStudies([]);
    }
  }, [toCanvasCoords, findNodeAt, getStudiesForNode]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const factor = e.deltaY > 0 ? 0.92 : 1.08;
    const newScale = Math.max(0.3, Math.min(3, scaleRef.current * factor));

    offsetRef.current = {
      x: mx - (mx - offsetRef.current.x) * (newScale / scaleRef.current),
      y: my - (my - offsetRef.current.y) * (newScale / scaleRef.current),
    };
    scaleRef.current = newScale;
    setScale(newScale);
  }, []);

  const resetView = useCallback(() => {
    offsetRef.current = { x: 0, y: 0 };
    scaleRef.current = 1;
    setScale(1);
  }, []);

  const filteredNode = search
    ? nodesRef.current.find(
        (n) =>
          n.name.toLowerCase().includes(search.toLowerCase()) ||
          n.genus.toLowerCase().includes(search.toLowerCase()) ||
          (n.species && n.species.toLowerCase().includes(search.toLowerCase()))
      )
    : null;

  // Center on search result
  useEffect(() => {
    if (filteredNode) {
      const { w, h } = sizeRef.current;
      offsetRef.current = { x: w / 2 - filteredNode.x, y: h / 2 - filteredNode.y };
      scaleRef.current = 1.4;
      setScale(1.4);
    }
  }, [filteredNode]);

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={containerRef}
        className="relative bg-card border border-border rounded-lg overflow-hidden"
        style={{ height: 520 }}
      >
        <canvas
          ref={canvasRef}
          className="cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleClick}
          onWheel={handleWheel}
        />

        {/* Top bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-text3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Hledat taxon..."
              className="w-full h-8 pl-8 pr-3 rounded-md bg-bg3/90 backdrop-blur-sm border border-border text-text text-xs placeholder:text-text3 focus:border-teal/40 outline-none"
            />
          </div>
          <button
            onClick={resetView}
            className="h-8 px-2.5 rounded-md bg-bg3/90 backdrop-blur-sm border border-border text-text-secondary text-[10px] font-mono hover:bg-card2 transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Legend */}
        <div className="absolute right-3 bottom-3 flex flex-wrap gap-2 bg-bg2/80 backdrop-blur-sm border border-border rounded-lg px-3 py-2">
          {Object.entries(PHYLUM_COLORS).map(([phylum, color]) => (
            <div key={phylum} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full border border-white/10" style={{ backgroundColor: color }} />
              <span className="font-mono text-[8px] text-text3 uppercase tracking-[0.5px]">{phylum}</span>
            </div>
          ))}
        </div>

        {/* Zoom controls */}
        <div className="absolute left-3 bottom-3 flex items-center gap-1.5 bg-bg2/80 backdrop-blur-sm border border-border rounded-lg px-2 py-1.5">
          <button onClick={() => { scaleRef.current = Math.min(3, scaleRef.current + 0.2); setScale(scaleRef.current); }} className="w-6 h-6 rounded bg-bg3 text-text-secondary text-xs hover:bg-card2 transition-colors">+</button>
          <button onClick={() => { scaleRef.current = Math.max(0.3, scaleRef.current - 0.2); setScale(scaleRef.current); }} className="w-6 h-6 rounded bg-bg3 text-text-secondary text-xs hover:bg-card2 transition-colors">−</button>
          <span className="font-mono text-[9px] text-text3 w-10 text-center">{Math.round(scale * 100)}%</span>
        </div>
      </div>

      {/* Detail panel — pod grafem */}
      {selectedNode && (
        <div className="bg-card border border-teal/20 rounded-lg overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-bg3/30">
            <div className="flex items-center gap-2.5">
              <span
                className="h-3 w-3 rounded-full ring-2 ring-offset-2 ring-offset-bg2"
                style={{ backgroundColor: PHYLUM_COLORS[selectedNode.phylum] || "#36B8F5" }}
              />
              <span className="font-heading text-sm font-semibold text-text">
                {selectedNode.species || selectedNode.genus}
              </span>
              <span className="font-mono text-[11px] text-text-secondary italic">
                {selectedNode.name}
              </span>
            </div>
            <button
              onClick={() => { setSelectedNode(null); setRelatedStudies([]); }}
              className="rounded-md p-1 text-text3 hover:text-text hover:bg-card2 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Info */}
              <div className="space-y-2">
                <span className="block font-mono text-[9px] uppercase tracking-[1px] text-text3">Kmen</span>
                <span className="block font-mono text-[11px] text-text">{selectedNode.phylum}</span>
                <span className="block font-mono text-[9px] uppercase tracking-[1px] text-text3 mt-3">Počet studií</span>
                <span className="block font-mono text-xl font-medium text-teal">{selectedNode.studyCount}</span>
              </div>

              {/* Související studie */}
              <div className="md:col-span-2">
                <span className="block font-mono text-[9px] uppercase tracking-[1px] text-text3 mb-2">
                  Související studie ({relatedStudies.length})
                </span>
                {relatedStudies.length > 0 ? (
                  <div className="space-y-2">
                    {relatedStudies.map((s) => (
                      <a
                        key={s.id}
                        href={`/study/${s.id}`}
                        className="flex items-start gap-2.5 group/link p-2.5 rounded-md bg-bg3 border border-border hover:border-teal/30 hover:bg-card2 transition-all"
                      >
                        <ArrowRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-text3 group-hover/link:text-teal transition-colors" />
                        <div className="min-w-0">
                          <span className="font-mono text-[11px] text-text-secondary group-hover/link:text-text leading-snug line-clamp-2 transition-colors">
                            {s.title}
                          </span>
                          <span className="font-mono text-[10px] text-teal mt-0.5 block">
                            EV {s.evidenceScore.toFixed(1).replace(".", ",")}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-text3 font-mono text-xs py-4">Žádné studie neobsahují tento taxon.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
