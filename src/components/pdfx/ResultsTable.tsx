import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "./StatusBadge";
import { exportCSV, exportExcel, exportPDF, type ResultRow } from "@/lib/exports";
import { Download, FileSpreadsheet, FileText, Search, Inbox } from "lucide-react";

interface Props {
  rows: ResultRow[];
  onProcessMore?: () => void;
}

export function ResultsTable({ rows, onProcessMore }: Props) {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q.trim()) return true;
      const hay = `${r.user_name} ${r.pdf_name} ${r.user_pdf_key}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
  }, [rows, q, statusFilter]);

  return (
    <div className="card-soft p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Extraction results</h2>
          <p className="text-sm text-muted-foreground">{rows.length} total · {filtered.length} shown</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => exportCSV(filtered)} disabled={!filtered.length}>
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportExcel(filtered)} disabled={!filtered.length}>
            <FileSpreadsheet className="h-4 w-4" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportPDF(filtered)} disabled={!filtered.length}>
            <FileText className="h-4 w-4" /> PDF report
          </Button>
          {onProcessMore && (
            <Button size="sm" onClick={onProcessMore} className="gradient-bg text-primary-foreground">
              Process more PDFs
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, PDF, or key…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="complete">Complete</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-14 text-muted-foreground">
          <Inbox className="mx-auto h-10 w-10 mb-3 opacity-60" />
          <p className="text-sm">No results match your filters yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/60 text-muted-foreground">
              <tr>
                <Th>User</Th>
                <Th>PDF</Th>
                <Th>Key</Th>
                {Array.from({ length: 13 }, (_, i) => <Th key={i}>P{i + 1}</Th>)}
                <Th>Status</Th>
                <Th>Created</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <tr key={r.user_pdf_key + idx} className="border-t hover:bg-muted/30">
                  <Td className="font-medium">{r.user_name}</Td>
                  <Td className="max-w-[200px] truncate">{r.pdf_name}</Td>
                  <Td className="font-mono text-xs text-muted-foreground">{r.user_pdf_key}</Td>
                  {Array.from({ length: 13 }, (_, i) => (
                    <Td key={i} className="whitespace-nowrap">{(r as any)[`parameter_${i + 1}`] ?? "—"}</Td>
                  ))}
                  <Td><StatusBadge status={r.status} /></Td>
                  <Td className="text-muted-foreground whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left font-medium px-3 py-2 whitespace-nowrap">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}
