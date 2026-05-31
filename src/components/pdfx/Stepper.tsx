import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Your Name", "Upload PDFs", "Choose Model", "Results"] as const;

export function Stepper({ current }: { current: 0 | 1 | 2 | 3 }) {
  return (
    <div className="w-full">
      <ol className="flex items-center gap-2 sm:gap-4">
        {STEPS.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={label} className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={cn(
                    "h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold ring-1 transition-all",
                    done && "bg-success text-success-foreground ring-success",
                    active && "gradient-bg text-primary-foreground ring-transparent shadow-md",
                    !done && !active && "bg-muted text-muted-foreground ring-border",
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium truncate hidden sm:inline",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px bg-border" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
