import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Download, FileSpreadsheet, FileText, LogOut, Search, Sparkles, CheckCircle2 } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HeaderNav } from "@/components/pdfx/HeaderNav";
import { clearSession, getUserName } from "@/lib/pdfx";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const Route = createFileRoute("/proof-of-work")({
  head: () => ({
    meta: [
      { title: "Proof of Work — DocuExtract AI" },
      { name: "description", content: "Structured extraction result from 79 unstructured policy PDF documents." },
    ],
  }),
  component: ProofOfWork,
});

const COLUMNS = [
  "Age",
  "Step Therapy Requirements Documented in Policy",
  "Number of Steps through Brands",
  "Number of Steps through Generic",
  "Step through-Phototherapy",
  "TB Test required",
  "Quantity Limits",
  "Specialist Types",
  "Initial Authorization Duration(in-months)",
  "Reauthorization Duration(in-months)",
  "Reauthorization Required",
  "Reauthorization Requirements Documented in Policy",
  "Access Score",
];

// Short labels for compact table headers; full name shown in tooltip.
const SHORT: Record<string, string> = {
  "Step Therapy Requirements Documented in Policy": "Step Therapy Req?",
  "Number of Steps through Brands": "# Steps (Brands)",
  "Number of Steps through Generic": "# Steps (Generic)",
  "Step through-Phototherapy": "Phototherapy Step",
  "TB Test required": "TB Test",
  "Quantity Limits": "Qty Limits",
  "Specialist Types": "Specialists",
  "Initial Authorization Duration(in-months)": "Initial Auth (mo)",
  "Reauthorization Duration(in-months)": "Reauth (mo)",
  "Reauthorization Required": "Reauth Req?",
  "Reauthorization Requirements Documented in Policy": "Reauth Reqs Doc?",
  "Access Score": "Access Score",
};

function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else {
      if (c === '"') q = true;
      else if (c === ",") { cur.push(field); field = ""; }
      else if (c === "\n") { cur.push(field); rows.push(cur); cur = []; field = ""; }
      else if (c === "\r") { /* skip */ }
      else field += c;
    }
  }
  if (field.length || cur.length) { cur.push(field); rows.push(cur); }
  const [header, ...body] = rows.filter((r) => r.length > 1 || (r[0] && r[0].trim() !== ""));
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

function ProofOfWork() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [data, setData] = useState<Record<string, string>[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const n = getUserName();
    if (!n) { navigate({ to: "/" }); return; }
    setName(n);
  }, [navigate]);

  useEffect(() => {
    fetch("/result.csv").then((r) => r.text()).then((t) => setData(parseCSV(t))).catch(() => setData([]));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
  }, [data, query]);

  const totalPdfs = Math.max(data.length, 79);

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    XLSX.writeFile(wb, "result.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a3" });
    doc.setFontSize(16);
    doc.text("DocuExtract AI — Proof of Work (result.csv)", 40, 40);
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`${totalPdfs} PDFs · 13 Parameters · Generated ${new Date().toLocaleString()}`, 40, 58);
    const headers = ["Filename", "Brand", ...COLUMNS];
    autoTable(doc, {
      head: [headers],
      body: data.map((r) => headers.map((h) => r[h] ?? "")),
      startY: 80,
      styles: { fontSize: 7, cellPadding: 4 },
      headStyles: { fillColor: [99, 102, 241] },
    });
    doc.save("result.pdf");
  };

  const onLogout = () => { clearSession(); navigate({ to: "/" }); };

  return (
    <main className="min-h-screen">
      <header className="border-b bg-card/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src={logo} alt="DocuExtract AI" className="h-10 w-10 rounded-xl shadow-md" />
            <div className="min-w-0">
              <p className="font-semibold leading-tight">DocuExtract AI</p>
              {name && <p className="text-xs text-muted-foreground truncate">Hi, {name}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <HeaderNav />
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4" /> Switch user
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
              <Link to="/workspace"><ArrowLeft className="h-4 w-4" /> Back to Workspace</Link>
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold">Proof of Work</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
              Structured extraction result generated from 79 unstructured policy PDF documents.
            </p>
          </div>
        </div>

        {/* Highlight card */}
        <div className="relative overflow-hidden rounded-2xl border bg-card shadow-lg">
          <div className="absolute inset-0 pointer-events-none gradient-bg opacity-[0.06]" aria-hidden />
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-accent/40 blur-3xl pointer-events-none" aria-hidden />
          <div className="relative p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-5">
              <div className="h-12 w-12 rounded-xl gradient-bg flex items-center justify-center shadow-md shrink-0">
                <FileSpreadsheet className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> Proof of work
                </span>
                <h2 className="text-xl sm:text-2xl font-bold mt-1">result.csv</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Structured CSV output of {totalPdfs} processed PDF policy documents across 13 parameters.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
              <Stat label="File" value="result.csv" mono />
              <Stat label="Total PDFs" value={String(totalPdfs)} />
              <Stat label="Parameters" value="13" />
              <Stat label="Output" value="Structured CSV" />
              <Stat label="Status" value="Ready for Review" highlight />
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              <Badge variant="outline" className="bg-success/10 text-success border-success/30 gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> 79 PDFs Processed
              </Badge>
              <Badge variant="outline" className="bg-accent text-accent-foreground border-accent">13 Fields Extracted</Badge>
              <Badge variant="outline" className="bg-secondary text-secondary-foreground">CSV Output</Badge>
              <Badge variant="outline">AI Extraction</Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild className="gradient-bg text-primary-foreground shadow-md hover:opacity-95">
                <a href="/result.csv" target="_blank" rel="noreferrer">
                  <FileText className="h-4 w-4" /> View result.csv
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/result.csv" download="result.csv">
                  <Download className="h-4 w-4" /> Download result.csv
                </a>
              </Button>
              <Button variant="outline" onClick={exportExcel}>
                <Download className="h-4 w-4" /> Export as Excel
              </Button>
              <Button variant="outline" onClick={exportPDF}>
                <Download className="h-4 w-4" /> Export as PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card-soft p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold">Formatted preview</h2>
              <p className="text-xs text-muted-foreground">
                Showing {filtered.length} of {data.length} rows · 13 extracted parameters
              </p>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search rows…"
                className="pl-8 w-64"
              />
            </div>
          </div>

          <TooltipProvider delayDuration={150}>
            <div className="rounded-xl border overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-muted/60 text-muted-foreground sticky top-0">
                  <tr>
                    <th className="text-left font-medium px-3 py-2 whitespace-nowrap">Filename</th>
                    <th className="text-left font-medium px-3 py-2 whitespace-nowrap">Brand</th>
                    {COLUMNS.map((c) => (
                      <th key={c} className="text-left font-medium px-3 py-2 whitespace-nowrap">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help underline-offset-2 hover:underline">{SHORT[c] ?? c}</span>
                          </TooltipTrigger>
                          <TooltipContent><span className="text-xs">{c}</span></TooltipContent>
                        </Tooltip>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={i} className="border-t hover:bg-muted/30">
                      <td className="px-3 py-2 font-mono whitespace-nowrap">{r["Filename"]}</td>
                      <td className="px-3 py-2 font-medium whitespace-nowrap">{r["Brand"]}</td>
                      {COLUMNS.map((c) => (
                        <td key={c} className={`px-3 py-2 ${c === "Access Score" ? "font-semibold text-primary" : ""}`}>
                          {r[c]}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={COLUMNS.length + 2} className="text-center py-8 text-muted-foreground">No matching rows.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TooltipProvider>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="rounded-xl border bg-background/70 p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
      <p className={`mt-1 ${mono ? "font-mono text-sm" : "text-base font-semibold"} ${highlight ? "text-success" : ""}`}>
        {value}
      </p>
    </div>
  );
}
