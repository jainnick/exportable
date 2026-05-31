import { FileText, UploadCloud, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Props {
  files: File[];
  onChange: (files: File[]) => void;
}

export function PdfDropzone({ files, onChange }: Props) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = useCallback((list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list).filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    const dedup = new Map(files.map((f) => [f.name + f.size, f]));
    for (const f of incoming) dedup.set(f.name + f.size, f);
    onChange(Array.from(dedup.values()));
  }, [files, onChange]);

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); accept(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all",
          "bg-gradient-to-br from-secondary/40 to-accent/30",
          drag ? "border-primary bg-accent/60 scale-[1.01]" : "border-border hover:border-primary/60",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => accept(e.target.files)}
        />
        <div className="mx-auto h-14 w-14 rounded-2xl gradient-bg flex items-center justify-center shadow-md mb-3">
          <UploadCloud className="h-7 w-7 text-primary-foreground" />
        </div>
        <p className="font-semibold text-foreground">Drop PDFs here or click to browse</p>
        <p className="text-sm text-muted-foreground mt-1">Upload one or many. PDF only.</p>
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f) => (
            <li
              key={f.name + f.size}
              className="flex items-center gap-3 rounded-xl border bg-card px-3 py-2 shadow-sm"
            >
              <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center">
                <FileText className="h-4 w-4 text-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{f.name}</p>
                <p className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(1)} KB</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(files.filter((x) => !(x.name === f.name && x.size === f.size)));
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
