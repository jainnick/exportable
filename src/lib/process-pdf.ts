// Frontend wrapper around the Replit Extraction Engine.
// The Replit backend exposes /process-pdf (returns job_id) and /jobs/{id} (polled).
import { uploadPdf, pollJob, type Brand, type AccuracyMode, type JobResponse } from "./replit-api";
import type { GroqModel, ApiKeyMode } from "./pdfx";

export interface ProcessPdfPayload {
  sessionId: string;
  userNameDisplay: string;
  userNameKey: string;
  pdfName: string;
  pdfStoragePath: string;
  userPdfKey: string;
  model: GroqModel;
  apiKeyMode: ApiKeyMode;
  ownApiKey?: string;
  file: File;
  brand: Brand;
  accuracyMode: AccuracyMode;
  onProgress?: (msg: string) => void;
}

export interface ProcessPdfResult {
  fields: Record<string, string>;
  raw_response: Record<string, unknown>;
}

export async function processPdf(payload: ProcessPdfPayload): Promise<ProcessPdfResult> {
  const jobId = await uploadPdf({
    file: payload.file,
    brand: payload.brand,
    accuracyMode: payload.accuracyMode,
    userName: payload.userNameDisplay,
  });

  payload.onProgress?.("Processing PDF… this may take 30–90 seconds.");

  const final: JobResponse = await pollJob(jobId, (data) => {
    if (data.progress) payload.onProgress?.(data.progress);
  });

  if (!final.result) throw new Error("Backend returned no result");

  return {
    fields: final.result.fields as unknown as Record<string, string>,
    raw_response: final.result.raw_response as unknown as Record<string, unknown>,
  };
}
