// Placeholder for the blackbox PDF extraction backend.
// Real implementation: POST a server route /api/process-pdf that calls Groq.
// For now this generates a realistic mock response client-side so the UI works end-to-end.
import type { GroqModel, ApiKeyMode } from "./pdfx";

export interface ProcessPdfPayload {
  sessionId: string;
  userName: string;
  pdfName: string;
  pdfStoragePath: string;
  userPdfKey: string;
  model: GroqModel;
  apiKeyMode: ApiKeyMode;
  ownApiKey?: string; // only kept in memory for this request
}

export interface ExtractionParams {
  // 13 parameters (P1..P13)
  [k: `parameter_${number}`]: string;
}

export interface ProcessPdfResult {
  parameters: ExtractionParams;
  raw_response: Record<string, unknown>;
}

const SAMPLE_VALUES = [
  "INV-2034", "Acme Corp", "2025-03-12", "USD", "1,240.00",
  "Net 30", "John Doe", "billing@acme.com", "+1 555 0142", "555 Market St, SF",
  "Approved", "Wire Transfer", "Q1 services rendered",
];

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

// Placeholder for: POST /api/process-pdf
export async function processPdf(payload: ProcessPdfPayload): Promise<ProcessPdfResult> {
  // Simulate network + model latency
  await sleep(900 + Math.random() * 1200);

  // Never expose user-supplied keys — only use in-memory for this call
  if (payload.apiKeyMode === "own" && !payload.ownApiKey) {
    throw new Error("Missing API key");
  }

  const params: ExtractionParams = {};
  for (let i = 1; i <= 13; i++) {
    params[`parameter_${i}`] = SAMPLE_VALUES[(i - 1) % SAMPLE_VALUES.length];
  }

  return {
    parameters: params,
    raw_response: {
      model: payload.model,
      pdf_name: payload.pdfName,
      note: "Mock response from /api/process-pdf placeholder.",
    },
  };
}
