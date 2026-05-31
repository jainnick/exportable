// Shared types & session helpers for the PDF extraction app.
export type ApiKeyMode = "app" | "own";
export type GroqModel = "llama-3.1-8b-instant" | "llama-3.3-70b-versatile";
export type RunStatus = "ready" | "uploading" | "extracting" | "saving" | "complete" | "failed";

export const GROQ_MODELS: { id: GroqModel; label: string; blurb: string }[] = [
  { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant", blurb: "Fastest. Great for quick extractions." },
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B Versatile", blurb: "Higher quality. Best for complex PDFs." },
];

// The 13 real extraction fields produced by the Extraction Engine (solution.py).
// `key` is the snake_case DB column; `label` is the readable display name;
// `short` is the compact header used in the results table (full name in tooltip).
export interface ExtractionField {
  key: string;
  label: string;
  short: string;
}

export const EXTRACTION_FIELDS: ExtractionField[] = [
  { key: "age", label: "Age", short: "Age" },
  { key: "step_therapy_requirements_documented_in_policy", label: "Step Therapy Requirements Documented in Policy", short: "Step Therapy Req?" },
  { key: "number_of_steps_through_brands", label: "Number of Steps through Brands", short: "# Steps (Brands)" },
  { key: "number_of_steps_through_generic", label: "Number of Steps through Generic", short: "# Steps (Generic)" },
  { key: "step_through_phototherapy", label: "Step through-Phototherapy", short: "Phototherapy Step" },
  { key: "tb_test_required", label: "TB Test required", short: "TB Test" },
  { key: "quantity_limits", label: "Quantity Limits", short: "Qty Limits" },
  { key: "specialist_types", label: "Specialist Types", short: "Specialists" },
  { key: "initial_authorization_duration_in_months", label: "Initial Authorization Duration (months)", short: "Initial Auth (mo)" },
  { key: "reauthorization_duration_in_months", label: "Reauthorization Duration (months)", short: "Reauth (mo)" },
  { key: "reauthorization_required", label: "Reauthorization Required", short: "Reauth Req?" },
  { key: "reauthorization_requirements_documented_in_policy", label: "Reauthorization Requirements Documented in Policy", short: "Reauth Reqs Doc?" },
  { key: "access_score", label: "Access Score", short: "Access Score" },
];

const NAME_KEY = "pdfx.user_name";
const SESSION_KEY = "pdfx.session_id";

export function normalizeName(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

export function getUserName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(NAME_KEY) ?? "";
}
export function setUserName(name: string) {
  localStorage.setItem(NAME_KEY, name);
}
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let s = localStorage.getItem(SESSION_KEY);
  if (!s) {
    s = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, s);
  }
  return s;
}
export function clearSession() {
  localStorage.removeItem(NAME_KEY);
  localStorage.removeItem(SESSION_KEY);
}

// Build a stable per-PDF key combining normalized user + PDF filename + short random suffix.
export function makePdfKey(userNameKey: string, pdfName: string): string {
  const slug = pdfName.replace(/\.pdf$/i, "").replace(/[^a-zA-Z0-9]+/g, "-").slice(0, 40);
  const rand = Math.random().toString(36).slice(2, 6);
  return `${userNameKey}_${slug}_${rand}`.toLowerCase();
}
