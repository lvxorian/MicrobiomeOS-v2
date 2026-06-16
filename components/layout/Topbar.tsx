"use client";

import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export function Topbar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/feed?search=${encodeURIComponent(query.trim())}`);
      }
    },
    [query, router]
  );

  return (
    <header className="fixed left-56 right-0 top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-bg2/80 backdrop-blur-sm px-6">
      <form onSubmit={handleSearch} className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text3" />
        <Input
          type="search"
          placeholder="Hledat v taxonech, studiích, autorech..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-9 pl-9 bg-bg3 border-border text-text text-sm placeholder:text-text3 focus-visible:ring-teal/30 w-full rounded-md"
        />
      </form>

      <div className="flex items-center gap-3">
        <button className="relative rounded-md p-1.5 text-text3 hover:text-text hover:bg-card2 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber" />
        </button>
        <Avatar className="h-7 w-7 border border-border">
          <AvatarFallback className="bg-bg3 text-teal text-[10px] font-mono font-medium">
            PR
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
