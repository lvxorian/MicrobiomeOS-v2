import { cn } from "@/lib/utils";

type FingerprintItem = {
  label: string;
  value: string;
};

type MethodFingerprintProps = {
  studyDesign: string;
  sampleSize: number | null;
  sequencingMethod: string | null;
  cohortType: string | null;
  duration: string | null;
  className?: string;
};

const DESIGN_LABELS: Record<string, string> = {
  RCT: "RCT",
  OPEN_LABEL_RCT: "Otevřená RCT",
  COHORT: "Kohortová",
  CASE_CONTROL: "Případ-kontrola",
  META_ANALYSIS: "Meta-analýza",
  SYSTEMATIC_REVIEW: "Systematický přehled",
  MECHANISTIC: "Mechanistická",
  CASE_REPORT: "Kazuistika",
  PREPRINT: "Preprint",
  OTHER: "Ostatní",
};

export function MethodFingerprint({
  studyDesign,
  sampleSize,
  sequencingMethod,
  cohortType,
  duration,
  className,
}: MethodFingerprintProps) {
  const items: FingerprintItem[] = [
    { label: "Design", value: DESIGN_LABELS[studyDesign] || studyDesign },
    { label: "n", value: sampleSize ? sampleSize.toLocaleString("cs-CZ") : "—" },
    { label: "Sekvenace", value: sequencingMethod || "—" },
    { label: "Model", value: cohortType || "—" },
    { label: "Trvání", value: duration || "—" },
  ];

  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-bg3 border border-border rounded-md p-2.5 text-center"
        >
          <span className="block font-mono text-[8px] uppercase tracking-[1.5px] text-text3 mb-0.5">
            {item.label}
          </span>
          <span className="font-mono text-[11px] font-medium text-text">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
