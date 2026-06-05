// Replit backend client for the PDF extraction pipeline.
// IMPORTANT: API_BASE_URL already includes /api — do NOT prefix endpoints with /api again.
export const API_BASE_URL = "https://tiered-implementation--miknik2206.replit.app/api";

export const BRANDS = [
  "STELARA", "TREMFYA", "ENBREL", "AMJEVITA", "OTEZLA",
  "YESINTEK", "COSENTYX", "REMICADE", "SILIQ", "CIMZIA",
  "BIMZELX", "SKYRIZI", "OTULFI", "ILUMYA", "ACITRETIN",
] as const;
export type Brand = (typeof BRANDS)[number];

export const ACCURACY_MODES = ["tier1", "tier2", "tier3"] as const;
export type AccuracyMode = (typeof ACCURACY_MODES)[number];

export interface ExtractedFields {
  age: string;
  step_therapy_requirements_documented_in_policy: string;
  number_of_steps_through_brands: string;
  number_of_steps_through_generic: string;
  step_through_phototherapy: string;
  tb_test_required: string;
  quantity_limits: string;
  specialist_types: string;
  initial_authorization_duration_in_months: string;
  reauthorization_duration_in_months: string;
  reauthorization_required: string;
  reauthorization_requirements_documented_in_policy: string;
  access_score: string;
}

export interface JobResponse {
  job_id: string;
  status: "queued" | "processing" | "done" | "error";
  progress?: string;
  pdf_name?: string;
  brand?: string;
  accuracy_mode?: string;
  result?: {
    fields: ExtractedFields;
    raw_response: {
      model: string;
      pdf_name: string;
      brand: string;
      processing_time_seconds: number;
      pipeline_version: string;
      keys_used: number;
    };
  };
  error?: string;
}

export interface FieldDefinition {
  key: string;
  label?: string;
  description?: string;
}

export async function fetchFieldDefinitions(): Promise<Record<string, FieldDefinition> | FieldDefinition[]> {
  const res = await fetch(`${API_BASE_URL}/fields`);
  if (!res.ok) throw new Error("Failed to load field definitions");
  return res.json();
}

export async function uploadPdf(opts: {
  file: File;
  brand: Brand;
  accuracyMode?: AccuracyMode;
  userName?: string;
  model?: string;
  groqApiKeys?: string;
  sessionId?: string;
}): Promise<string> {
  const formData = new FormData();
  formData.append("file", opts.file);
  formData.append("brand", opts.brand);
  formData.append("model", opts.model || "llama-3.3-70b-versatile");
  formData.append("accuracy_mode", opts.accuracyMode || "tier3");
  if (opts.groqApiKeys && opts.groqApiKeys.trim()) {
    formData.append("groq_api_keys", opts.groqApiKeys.trim());
  }
  const sessionId = opts.sessionId || (opts.userName ? `${opts.userName}-${Date.now()}` : undefined);
  if (sessionId) {
    formData.append("session_id", sessionId);
  }

  // NOTE: do NOT set Content-Type — the browser sets the multipart boundary.
  const uploadRes = await fetch(`${API_BASE_URL}/process-pdf`, {
    method: "POST",
    body: formData,
  });

  if (!uploadRes.ok) {
    const errorData = await uploadRes.json().catch(() => null);
    throw new Error(errorData?.detail || "PDF upload failed");
  }

  const uploadData = await uploadRes.json();
  return uploadData.job_id as string;
}

export async function pollJob(
  jobId: string,
  onUpdate?: (data: JobResponse) => void,
  intervalMs = 3000,
): Promise<JobResponse> {
  while (true) {
    const res = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || "Failed to fetch job status");
    }
    const data = (await res.json()) as JobResponse;
    onUpdate?.(data);
    if (data.status === "done") return data;
    if (data.status === "error") throw new Error(data.error || "Processing failed");
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}
