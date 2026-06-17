"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { TagBadge } from "@/components/shared/TagBadge";

const FILTER_TAGS = [
  "gut-brain axis",
  "metabolomika",
  "zánět",
  "probiotika",
  "RCT",
  "vláknina",
  "IBD",
  "SCFA",
  "FMT",
  "diverzita mikrobioty",
];

type FeedFiltersProps = {
  currentTag?: string;
  currentSearch?: string;
};

export function FeedFilters({ currentTag, currentSearch }: FeedFiltersProps) {
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch || "");

  const handleTagClick = (tag: string) => {
    if (currentTag === tag) {
      router.push("/feed");
    } else {
      router.push(`/feed?tag=${encodeURIComponent(tag)}`);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/feed?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div className="mb-6 space-y-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Hledat v názvu nebo shrnutí..."
          className="flex-1 h-9 px-3 rounded-md bg-bg3 border border-border text-text text-sm placeholder:text-text3 focus:border-teal/40 outline-none transition-colors"
        />
        <button
          type="submit"
          className="px-4 h-9 rounded-md bg-teal text-background font-mono text-xs font-medium hover:bg-teal-dim transition-colors"
        >
          Hledat
        </button>
      </form>

      <div className="flex flex-wrap gap-1.5">
        {FILTER_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            className={cn(
              "transition-opacity",
              currentTag === tag ? "opacity-100" : "opacity-60 hover:opacity-100"
            )}
          >
            <TagBadge
              label={tag}
              color={
                tag === "RCT" || tag === "SCFA" || tag === "vláknina" || tag === "probiotika"
                  ? "teal"
                  : tag === "zánět" || tag === "IBD"
                    ? "red"
                    : "purple"
              }
            />
          </button>
        ))}
      </div>
    </div>
  );
}
