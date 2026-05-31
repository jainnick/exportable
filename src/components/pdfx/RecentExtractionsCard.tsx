import { useEffect, useState } from "react";
import { FileText, Download, Eye, Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { exportCSV, type ResultRow } from "@/lib/exports";

interface Props {
  userNameKey: string;
  userNameDisplay: string;
}

export function RecentExtractionsCard({ userNameKey, userNameDisplay }: Props) {
  const [rows, setRows] = useState<ResultRow[] | null>(null);

  useEffect(() => {
    if (!userNameKey) return;
    (async () => {
      const { data, error } = await supabase
        .from("extraction_results")
        .select("*")
        .eq("user_name_key", userNameKey)
        .order("created_at", { ascending: false })
        .limit(8);
      if (!error) setRows((data ?? []) as ResultRow[]);
      else setRows([]);
    })();
  }, [userNameKey]);

  return (
    <div className="card-soft p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Recent extractions</h3>
          <p className="text-sm text-muted-foreground">
            Welcome back, <span className="font-medium text-foreground">{userNameDisplay}</span>
          </p>
        </div>
        {rows && rows.length > 0 && (
          <Button size="sm" variant="outline" onClick={() => exportCSV(rows)}>
            <Download className="h-4 w-4" /> Export all
          </Button>
        )}
      </div>

      {rows === null ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Inbox className="mx-auto h-10 w-10 mb-2 opacity-60" />
          <p className="text-sm">No extractions found for this name yet. Upload your first PDF to begin.</p>
        </div>
      ) : (
        <ul className="divide-y">
          {rows.map((r) => (
            <li key={r.user_pdf_key} className="py-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{r.pdf_name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {new Date(r.created_at).toLocaleString()}
                  {r.selected_model && <> · <span className="font-mono">{r.selected_model}</span></>}
                  {r.access_score && <> · Access <span className="font-semibold text-primary">{r.access_score}</span></>}
                </p>
              </div>
              <StatusBadge status={r.status} />
              <Button size="sm" variant="ghost" onClick={() => exportCSV([r])} title="Download CSV">
                <Download className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
