import { useState } from "react";
import { FileSpreadsheet, Download, Eye, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const SAMPLE_ROWS = [
  { file: "aetna_humira_2024.pdf", brand: "Humira", age: "18+", steps: "2", tb: "Yes", access: "7.5" },
  { file: "bcbs_skyrizi_2024.pdf", brand: "Skyrizi", age: "18+", steps: "1", tb: "Yes", access: "8.1" },
  { file: "cigna_dupixent_2024.pdf", brand: "Dupixent", age: "12+", steps: "2", tb: "No",  access: "6.8" },
  { file: "uhc_taltz_2024.pdf",     brand: "Taltz",    age: "18+", steps: "1", tb: "Yes", access: "7.2" },
  { file: "humana_otezla_2024.pdf", brand: "Otezla",   age: "18+", steps: "0", tb: "No",  access: "8.4" },
];

export function SampleResultCard() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card shadow-lg">
      {/* Decorative gradient */}
      <div className="absolute inset-0 pointer-events-none gradient-bg opacity-[0.06]" aria-hidden />
      <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-accent/40 blur-3xl pointer-events-none" aria-hidden />

      <div className="relative p-6 sm:p-8">
        <div className="flex flex-wrap items-start gap-4 justify-between mb-5">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl gradient-bg flex items-center justify-center shadow-md shrink-0">
              <FileSpreadsheet className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> Proof of work
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">Sample Extraction Result</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                Structured data extracted from <strong className="text-foreground">79 unstructured PDF policy documents</strong>.
                See how the Extraction Engine converts messy PDFs into a clean, exportable CSV table across 13 policy parameters.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          <Badge variant="outline" className="bg-success/10 text-success border-success/30 gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> 79 PDFs Processed
          </Badge>
          <Badge variant="outline" className="bg-accent text-accent-foreground border-accent">13 Parameters Extracted</Badge>
          <Badge variant="outline" className="bg-secondary text-secondary-foreground">Structured Output Ready</Badge>
          <Badge variant="outline" className="font-mono text-xs">result.csv</Badge>
        </div>

        {/* Mini preview table */}
        <div className="rounded-xl border bg-background/80 backdrop-blur-sm overflow-x-auto mb-5">
          <table className="min-w-full text-xs sm:text-sm">
            <thead className="bg-muted/60 text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-3 py-2 whitespace-nowrap">Filename</th>
                <th className="text-left font-medium px-3 py-2 whitespace-nowrap">Brand</th>
                <th className="text-left font-medium px-3 py-2 whitespace-nowrap">Age</th>
                <th className="text-left font-medium px-3 py-2 whitespace-nowrap"># Steps</th>
                <th className="text-left font-medium px-3 py-2 whitespace-nowrap">TB Test</th>
                <th className="text-left font-medium px-3 py-2 whitespace-nowrap">Access Score</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_ROWS.map((r) => (
                <tr key={r.file} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-xs truncate max-w-[220px]">{r.file}</td>
                  <td className="px-3 py-2 font-medium">{r.brand}</td>
                  <td className="px-3 py-2">{r.age}</td>
                  <td className="px-3 py-2">{r.steps}</td>
                  <td className="px-3 py-2">{r.tb}</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1 font-semibold text-primary">{r.access}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-muted-foreground px-3 py-2 border-t bg-muted/30">
            Showing 5 of 79 rows · 6 of 13 columns
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setOpen(true)} className="gradient-bg text-primary-foreground shadow-md hover:opacity-95">
            <Eye className="h-4 w-4" /> View Sample Result
          </Button>
          <Button asChild variant="outline">
            <a href="/result.csv" download="result.csv">
              <Download className="h-4 w-4" /> Download result.csv
            </a>
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Sample Extraction Result — result.csv</DialogTitle>
            <DialogDescription>
              Structured output extracted from 79 PDF policy documents across 13 parameters.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border overflow-x-auto max-h-[60vh]">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/60 text-muted-foreground sticky top-0">
                <tr>
                  {["Filename","Brand","Age","Step Therapy","# Brands","# Generic","Phototherapy","TB Test","Qty Limits","Specialists","Initial Auth","Reauth (mo)","Reauth Req?","Access Score"].map((h) => (
                    <th key={h} className="text-left font-medium px-3 py-2 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SAMPLE_ROWS.map((r) => (
                  <tr key={r.file} className="border-t">
                    <td className="px-3 py-2 font-mono">{r.file}</td>
                    <td className="px-3 py-2 font-medium">{r.brand}</td>
                    <td className="px-3 py-2">{r.age}</td>
                    <td className="px-3 py-2">Yes — preferred agents first</td>
                    <td className="px-3 py-2">{r.steps}</td>
                    <td className="px-3 py-2">1</td>
                    <td className="px-3 py-2">Required prior to biologic</td>
                    <td className="px-3 py-2">{r.tb}</td>
                    <td className="px-3 py-2">1 syringe / 28 days</td>
                    <td className="px-3 py-2">Dermatologist</td>
                    <td className="px-3 py-2">6</td>
                    <td className="px-3 py-2">12</td>
                    <td className="px-3 py-2">Yes</td>
                    <td className="px-3 py-2 font-semibold text-primary">{r.access}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end">
            <Button asChild>
              <a href="/result.csv" download="result.csv">
                <Download className="h-4 w-4" /> Download full result.csv
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
