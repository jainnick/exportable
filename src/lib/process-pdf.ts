// Frontend wrapper for the Extraction Engine (solution.py).
//
// IMPORTANT: solution.py is a Python pipeline (PyMuPDF + Gemini + sentence-transformers).
// This TanStack Start app runs on Cloudflare Workers, which cannot execute Python.
// In production, host solution.py as a separate Python microservice (Fly.io / Render /
// Railway) exposing POST /api/process-pdf, then have a TanStack server route forward
// the upload to it.
//
// For the in-app experience, this client-side function returns a realistic mock
// keyed to the 13 real fields so the UI is fully usable end-to-end today.
import type { GroqModel, ApiKeyMode } from "./pdfx";
import { EXTRACTION_FIELDS } from "./pdfx";

export interface ProcessPdfPayload {
  sessionId: string;
  userNameDisplay: string;
  userNameKey: string;
  pdfName: string;
  pdfStoragePath: string;
  userPdfKey: string;
  model: GroqModel;
  apiKeyMode: ApiKeyMode;
  ownApiKey?: string; // only kept in memory for this request
}

export interface ProcessPdfResult {
  fields: Record<string, string>;
  raw_response: Record<string, unknown>;
}

// Plausible sample values aligned with the policy-extraction schema.
const MOCK_VALUES: Record<string, string[]> = {
  age: ["18+", "12+", "6+", "Adults only"],
  step_therapy_requirements_documented_in_policy: ["Yes — must try 2 preferred agents first", "No documented step therapy", "Yes — single preferred agent required"],
  number_of_steps_through_brands: ["2", "1", "3", "0"],
  number_of_steps_through_generic: ["1", "2", "0", "1"],
  step_through_phototherapy: ["Required prior to biologic", "Not required", "Required if topical failed"],
  tb_test_required: ["Yes", "Yes — within 12 months", "No"],
  quantity_limits: ["1 syringe / 14 days", "2 vials / 28 days", "No limit"],
  specialist_types: ["Dermatologist", "Rheumatologist", "Gastroenterologist", "Dermatologist or Rheumatologist"],
  initial_authorization_duration_in_months: ["6", "12", "3"],
  reauthorization_duration_in_months: ["12", "6", "12"],
  reauthorization_required: ["Yes", "Yes", "No"],
  reauthorization_requirements_documented_in_policy: ["Documented clinical response required", "Provider attestation of improvement", "Lab results within 30 days"],
  access_score: ["7.5", "6.2", "8.1", "5.9"],
};

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

// Placeholder for: POST /api/process-pdf (Python microservice running solution.py).
export async function processPdf(payload: ProcessPdfPayload): Promise<ProcessPdfResult> {
  await sleep(900 + Math.random() * 1200);

  if (payload.apiKeyMode === "own" && !payload.ownApiKey) {
    throw new Error("Missing API key");
  }

  const seed = Math.abs(payload.pdfName.split("").reduce((a, c) => a + c.charCodeAt(0), 0));
  const fields: Record<string, string> = {};
  for (const f of EXTRACTION_FIELDS) {
    const opts = MOCK_VALUES[f.key] ?? ["—"];
    fields[f.key] = opts[seed % opts.length];
  }

  return {
    fields,
    raw_response: {
      model: payload.model,
      pdf_name: payload.pdfName,
      note: "Mock response. Wire /api/process-pdf to a Python microservice running solution.py.",
    },
  };
}
