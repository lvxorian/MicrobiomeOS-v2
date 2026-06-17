import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
};

export function SectionHeader({ eyebrow, title, description, className }: SectionHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      {eyebrow && (
        <span className="font-mono text-[10px] uppercase tracking-[2px] text-teal mb-1 block">
          {eyebrow}
        </span>
      )}
      <h2 className="font-heading text-xl font-semibold tracking-[-0.3px] text-text">
        {title}
      </h2>
      {description && (
        <p className="text-text-secondary text-sm mt-1 max-w-xl whitespace-pre-line">{description}</p>
      )}
    </div>
  );
}
