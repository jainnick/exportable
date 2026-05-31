import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RunStatus } from "@/lib/pdfx";
import { CheckCircle2, Loader2, AlertTriangle, Circle } from "lucide-react";

export function StatusBadge({ status }: { status: RunStatus | string }) {
  const map: Record<string, { label: string; cls: string; Icon: typeof Circle }> = {
    ready:      { label: "Ready",      cls: "bg-muted text-muted-foreground", Icon: Circle },
    uploading:  { label: "Uploading",  cls: "bg-accent text-accent-foreground", Icon: Loader2 },
    extracting: { label: "Extracting", cls: "bg-accent text-accent-foreground", Icon: Loader2 },
    saving:     { label: "Saving",     cls: "bg-accent text-accent-foreground", Icon: Loader2 },
    processing: { label: "Processing", cls: "bg-accent text-accent-foreground", Icon: Loader2 },
    complete:   { label: "Complete",   cls: "bg-success/15 text-success border-success/30", Icon: CheckCircle2 },
    failed:     { label: "Failed",     cls: "bg-destructive/15 text-destructive border-destructive/30", Icon: AlertTriangle },
  };
  const meta = map[status] ?? map.ready;
  const spin = ["uploading", "extracting", "saving", "processing"].includes(status);
  return (
    <Badge variant="outline" className={cn("gap-1.5 font-medium", meta.cls)}>
      <meta.Icon className={cn("h-3.5 w-3.5", spin && "animate-spin")} />
      {meta.label}
    </Badge>
  );
}
