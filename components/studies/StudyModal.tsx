"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { StudyBrief } from "@/components/studies/StudyBrief";
import type { Study, StudyTaxon, Taxon, Tag } from "@prisma/client";

type StudyWithRelations = Study & {
  taxa: (StudyTaxon & { taxon: Taxon })[];
  tags: Tag[];
};

type StudyModalProps = {
  study: StudyWithRelations;
  open: boolean;
  onClose: () => void;
};

export function StudyModal({ study, open, onClose }: StudyModalProps) {

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto pt-12 pb-12"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-5xl mx-4 bg-bg2 border border-border rounded-xl shadow-2xl overflow-hidden">
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 border-b border-border bg-bg2/90 backdrop-blur-sm">
          <span className="font-mono text-[10px] uppercase tracking-[1.5px] text-teal">
            Detail studie
          </span>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-text3 hover:text-text hover:bg-card2 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          <StudyBrief study={study} />
        </div>
      </div>
    </div>
  );
}
