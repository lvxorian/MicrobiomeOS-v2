"use client";

import { cn } from "@/lib/utils";

export function DNALoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 opacity-60", className)}>
      <svg
        className="h-4 w-4 animate-pulse"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          className="text-teal"
          d="M4 4c2 3 4 5 4 8s-2 5-4 8"
          strokeDasharray="1 3"
          strokeLinecap="round"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="8"
            to="0"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </path>
        <path
          className="text-purple"
          d="M20 4c-2 3-4 5-4 8s2 5 4 8"
          strokeDasharray="1 3"
          strokeLinecap="round"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="8"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </path>
        <line x1="12" y1="3" x2="12" y2="21" className="text-text3" strokeWidth="0.5" opacity="0.3" />
        <line x1="9" y1="5" x2="15" y2="5" className="text-text3" strokeWidth="0.3" opacity="0.15" />
        <line x1="9" y1="9" x2="15" y2="9" className="text-text3" strokeWidth="0.3" opacity="0.15" />
        <line x1="9" y1="13" x2="15" y2="13" className="text-text3" strokeWidth="0.3" opacity="0.15" />
        <line x1="9" y1="17" x2="15" y2="17" className="text-text3" strokeWidth="0.3" opacity="0.15" />
      </svg>
      <span className="font-mono text-[10px] uppercase tracking-[1.5px] text-teal animate-pulse">
        Probíhá sekvenace
      </span>
    </div>
  );
}
