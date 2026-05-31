import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ResultRow {
  user_name: string;
  pdf_name: string;
  user_pdf_key: string;
  parameter_1: string | null;
  parameter_2: string | null;
  parameter_3: string | null;
  parameter_4: string | null;
  parameter_5: string | null;
  parameter_6: string | null;
  parameter_7: string | null;
  parameter_8: string | null;
  parameter_9: string | null;
  parameter_10: string | null;
  parameter_11: string | null;
  parameter_12: string | null;
  parameter_13: string | null;
  status: string;
  created_at: string;
}

const HEADERS = [
  "User Name", "PDF Name", "PDF Key",
  ...Array.from({ length: 13 }, (_, i) => `Parameter ${i + 1}`),
  "Status", "Created",
];

function rowToArray(r: ResultRow): string[] {
  return [
    r.user_name, r.pdf_name, r.user_pdf_key,
    ...Array.from({ length: 13 }, (_, i) => (r as any)[`parameter_${i + 1}`] ?? ""),
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
