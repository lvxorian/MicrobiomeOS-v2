"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { TagBadge } from "@/components/shared/TagBadge";
import { MiniChart } from "@/components/studies/MiniChart";
import { ArrowRight } from "lucide-react";
import type { Study, StudyTaxon, Taxon, Tag } from "@prisma/client";

type StudyWithRelations = Study & {
  taxa: (StudyTaxon & { taxon: Taxon })[];
  tags: Tag[];
};

type StudyCardProps = {
  study: StudyWithRelations;
  className?: string;
  onOpen?: () => void;
};

function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getUTCFullYear() === now.getUTCFullYear() &&
    date.getUTCMonth() === now.getUTCMonth() &&
    date.getUTCDate() === now.getUTCDate()
  );
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max).trim() + "…" : text;
}

export function StudyCard({ study, className, onOpen }: StudyCardProps) {
  const router = useRouter();
  const newToday = isToday(new Date(study.indexedAt));

  const handleClick = () => {
    if (onOpen) {
      onOpen();
    } else {
      router.push(`/study/${study.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-lg border border-border bg-card transition-all hover:bg-card2 hover:border-teal/30",
        className
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal to-transparent" />

      <div className="p-4 pt-3">
        <div className="mb-3">
          <MiniChart taxa={study.taxa} />
        </div>

        <div className="flex items-center gap-2 mb-2">
          {newToday && (
            <span className="font-mono text-[9px] font-medium uppercase tracking-[1.5px] px-1.5 py-0.5 rounded bg-teal/15 text-teal border border-teal/20">
              DNES NOVÉ
            </span>
          )}
          <span
            className={cn(
              "font-mono text-[10px] font-medium px-1.5 py-0.5 rounded border",
              study.evidenceScore >= 8
                ? "bg-teal/10 text-teal border-teal/15"
                : study.evidenceScore >= 6
                  ? "bg-amber/10 text-amber border-amber/15"
                  : "bg-red/10 text-red border-red/15"
            )}
          >
            EV {study.evidenceScore.toFixed(1).replace(".", ",")}
          </span>
          {study.isPreprint && (
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-amber/10 text-amber border border-amber/15">
              PREPRINT
            </span>
          )}
        </div>

        <h3 className="font-heading text-[15px] font-semibold tracking-[-0.3px] text-text leading-snug mb-1.5">
          {study.title}
        </h3>

        <p className="text-[13px] text-text-secondary leading-relaxed mb-3">
          {truncate(study.plainSummary, 160)}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {study.tags.slice(0, 4).map((tag) => (
            <TagBadge key={tag.id} label={tag.label} color={tag.color} />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
        <span className="font-mono text-[10px] text-text3">
          {study.journal} · {study.year}
        </span>
        <span className="font-mono text-[10px] text-teal flex items-center gap-1 group-hover:gap-1.5 transition-all">
          Zobrazit výtah <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
}
