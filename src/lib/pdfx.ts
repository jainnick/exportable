// Shared types & session helpers for the PDF extraction app.
export type ApiKeyMode = "app" | "own";
export type GroqModel = "llama-3.1-8b-instant" | "llama-3.3-70b-versatile";
export type RunStatus = "ready" | "uploading" | "extracting" | "saving" | "complete" | "failed";

export const GROQ_MODELS: { id: GroqModel; label: string; blurb: string }[] = [
  { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant", blurb: "Fastest. Great for quick extractions." },
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B Versatile", blurb: "Higher quality. Best for complex PDFs." },
];

const NAME_KEY = "pdfx.user_name";
const SESSION_KEY = "pdfx.session_id";

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

// Build a stable per-PDF key (visible in the results table).
export function makePdfKey(sessionId: string, pdfName: string): string {
  const slug = pdfName.replace(/\.pdf$/i, "").replace(/[^a-zA-Z0-9]+/g, "-").slice(0, 24);
  const short = sessionId.slice(0, 6);
  const rand = Math.random().toString(36).slice(2, 6);
  return `${slug}-${short}-${rand}`.toLowerCase();
}
