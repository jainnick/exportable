import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { EXTRACTION_FIELDS } from "./pdfx";

export interface ResultRow {
  user_name_display?: string | null;
  user_name?: string | null;
  pdf_name: string;
  user_pdf_key: string;
  selected_model?: string | null;
  status: string;
  created_at: string;
  // 13 extraction fields (snake_case columns).
  [k: string]: any;
}

const HEADERS = [
  "User",
  "PDF Name",
  "PDF Key",
  "Model",
  ...EXTRACTION_FIELDS.map((f) => f.label),
  "Status",
  "Created",
];

function rowToArray(r: ResultRow): string[] {
  return [
    r.user_name_display ?? r.user_name ?? "",
    r.pdf_name,
    r.user_pdf_key,
    r.selected_model ?? "",
    ...EXTRACTION_FIELDS.map((f) => (r[f.key] ?? "") as string),
    r.status,
    new Date(r.created_at).toLocaleString(),
  ];
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function exportCSV(rows: ResultRow[]) {
  const lines = [HEADERS, ...rows.map(rowToArray)]
    .map((arr) => arr.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  downloadBlob(new Blob([lines], { type: "text/csv;charset=utf-8" }), "extraction-results.csv");
}

export function exportExcel(rows: ResultRow[]) {
  const ws = XLSX.utils.aoa_to_sheet([HEADERS, ...rows.map(rowToArray)]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Results");
  XLSX.writeFile(wb, "extraction-results.xlsx");
}

export function exportPDF(rows: ResultRow[]) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a3" });
  doc.setFontSize(16);
  doc.text("PDF Extraction Report", 40, 40);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Generated ${new Date().toLocaleString()} · ${rows.length} rows`, 40, 58);
  autoTable(doc, {
    head: [HEADERS],
    body: rows.map(rowToArray),
    startY: 80,
    styles: { fontSize: 7, cellPadding: 4 },
    headStyles: { fillColor: [99, 102, 241] },
  });
  doc.save("extraction-report.pdf");
}
