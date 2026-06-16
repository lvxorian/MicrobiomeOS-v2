"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Microscope,
  Share2,
  FolderHeart,
  Columns2,
  Activity,
  Bell,
  FlaskConical,
} from "lucide-react";
import { AgentStatus } from "@/components/agent/AgentStatus";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Přehled", icon: LayoutDashboard },
  { href: "/feed", label: "Přehled studií", icon: Microscope },
  { href: "/graph", label: "Síť taxonů", icon: Share2 },
  { href: "/collections", label: "Sbírky", icon: FolderHeart },
  { href: "/comparator", label: "Porovnávač", icon: Columns2 },
  { href: "/agent", label: "Monitor agenta", icon: Activity },
  { href: "/alerts", label: "Chytré upozornění", icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-56 flex-col border-r border-border bg-bg2">
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
        <FlaskConical className="h-5 w-5 text-teal" />
        <span className="font-heading text-sm font-semibold tracking-[-0.3px] text-text">
          Microbiome<span className="text-teal">OS</span>
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <span className="mb-2 block font-mono text-[10px] uppercase tracking-[2px] text-text3 px-2">
          Navigace
        </span>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors mb-0.5 group",
                isActive
                  ? "bg-teal/10 text-teal"
                  : "text-text-secondary hover:bg-card2 hover:text-text"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-teal" : "text-text3 group-hover:text-text-secondary")} />
              <span className="font-sans text-[13px]">{item.label}</span>
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-teal" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-4 py-3">
        <AgentStatus />
      </div>
    </aside>
  );
}
