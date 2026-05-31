import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RunStatus } from "@/lib/pdfx";

const STAGES: { key: RunStatus; label: string }[] = [
  { key: "uploading", label: "Uploading" },
  { key: "extracting", label: "Extracting" },
  { key: "saving", label: "Saving" },
  { key: "complete", label: "Complete" },
];

const ORDER: Record<RunStatus, number> = {
  ready: -1, uploading: 0, extracting: 1, saving: 2, complete: 3, failed: 99,
};

export function ProcessingTimeline({
  pdfName,
  status,
  error,
}: { pdfName: string; status: RunStatus; error?: string | null }) {
  const idx = ORDER[status];
  const failed = status === "failed";

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium truncate">{pdfName}</p>
      </div>
      <ol className="flex items-center gap-2">
        {STAGES.map((s, i) => {
          const done = idx > i || status === "complete" && i === STAGES.length - 1;
          const active = idx === i && !failed;
          return (
            <li key={s.key} className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0",
                    done && "bg-success text-success-foreground",
                    active && "gradient-bg text-primary-foreground",
                    failed && i === Math.max(idx, 0) && "bg-destructive text-destructive-foreground",
                    !done && !active && !failed && "bg-muted text-muted-foreground",
                  )}
                >
                  {done ? <Check className="h-3 w-3" /> : active ? <Loader2 className="h-3 w-3 animate-spin" /> : i + 1}
                </span>
                <span className={cn("text-xs truncate", (done || active) ? "text-foreground" : "text-muted-foreground")}>
                  {s.label}
                </span>
              </div>
              {i < STAGES.length - 1 && <div className="flex-1 h-px bg-border" />}
            </li>
          );
        })}
      </ol>
      {failed && error && (
        <p className="mt-3 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
