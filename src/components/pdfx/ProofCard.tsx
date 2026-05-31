import { Link } from "@tanstack/react-router";
import { FileSpreadsheet, ArrowRight, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ProofCard() {
  return (
    <div className="relative rounded-xl p-[1.5px] gradient-bg shadow-sm">
      <div className="rounded-[10px] bg-card p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg gradient-bg flex items-center justify-center shrink-0">
            <FileSpreadsheet className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm">Proof of Work: 79 PDFs Extracted</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              View the sample result.csv generated from 79 unstructured policy PDFs.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/30">79 PDFs</Badge>
          <Badge variant="outline" className="text-[10px]">13 Fields</Badge>
          <Badge variant="outline" className="text-[10px]">CSV Ready</Badge>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Button asChild size="sm" className="gradient-bg text-primary-foreground">
            <Link to="/proof-of-work">
              Open Proof of Work <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <a href="/result.csv" download="result.csv">
              <Download className="h-3.5 w-3.5" /> result.csv
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
