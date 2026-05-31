import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, KeyRound, Play, ShieldCheck, Sparkles, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Stepper } from "@/components/pdfx/Stepper";
import { PdfDropzone } from "@/components/pdfx/PdfDropzone";
import { ProcessingTimeline } from "@/components/pdfx/ProcessingTimeline";
import { ResultsTable } from "@/components/pdfx/ResultsTable";
import { StatusBadge } from "@/components/pdfx/StatusBadge";
import {
  clearSession, getSessionId, getUserName,
  GROQ_MODELS, makePdfKey,
  type ApiKeyMode, type GroqModel, type RunStatus,
} from "@/lib/pdfx";
import { processPdf } from "@/lib/process-pdf";
import { supabase } from "@/integrations/supabase/client";
import type { ResultRow } from "@/lib/exports";

export const Route = createFileRoute("/workspace")({
  head: () => ({
    meta: [
      { title: "Workspace — PDF Extract" },
      { name: "description", content: "Upload PDFs, choose a Groq model, and run AI extraction." },
    ],
  }),
  component: Workspace,
});

interface RunItem {
  id: string;          // local id
  file: File;
  pdfKey: string;
  status: RunStatus;
  error?: string | null;
}

function Workspace() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [sessionId, setSessionIdState] = useState("");

  const [files, setFiles] = useState<File[]>([]);
  const [model, setModel] = useState<GroqModel>("llama-3.1-8b-instant");
  const [provider] = useState<"groq">("groq");
  const [apiKeyMode, setApiKeyMode] = useState<ApiKeyMode>("app");
  const [ownKey, setOwnKey] = useState("");
  const [runs, setRuns] = useState<RunItem[]>([]);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [processing, setProcessing] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Bootstrap: require name
  useEffect(() => {
    const n = getUserName();
    if (!n) {
      navigate({ to: "/" });
      return;
    }
    setName(n);
    setSessionIdState(getSessionId());
  }, [navigate]);

  // Load historical results for this session
  useEffect(() => {
    if (!sessionId) return;
    (async () => {
      const { data, error } = await supabase
        .from("extraction_results")
        .select("user_name,pdf_name,user_pdf_key,parameter_1,parameter_2,parameter_3,parameter_4,parameter_5,parameter_6,parameter_7,parameter_8,parameter_9,parameter_10,parameter_11,parameter_12,parameter_13,created_at")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false });
      if (!error && data) {
        setResults(data.map((r) => ({ ...r, status: "complete" } as ResultRow)));
      }
      setLoadingHistory(false);
    })();
  }, [sessionId]);

  const step: 0 | 1 | 2 | 3 = useMemo(() => {
    if (results.length > 0 && !processing) return 3;
    if (files.length === 0) return 1;
    return 2;
  }, [files.length, results.length, processing]);

  const canStart =
    files.length > 0 &&
    !processing &&
    (apiKeyMode === "app" || (apiKeyMode === "own" && ownKey.trim().length >= 10));

  const onLogout = () => {
    clearSession();
    navigate({ to: "/" });
  };

  const onStart = async () => {
    if (!canStart) return;
    setProcessing(true);
    const initial: RunItem[] = files.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      pdfKey: makePdfKey(sessionId, f.name),
      status: "ready",
    }));
    setRuns(initial);

    const updateRun = (id: string, patch: Partial<RunItem>) =>
      setRuns((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

    for (const run of initial) {
      try {
        // 1. Upload to Storage
        updateRun(run.id, { status: "uploading" });
        const path = `${sessionId}/${Date.now()}-${run.pdfKey}.pdf`;
        const { error: upErr } = await supabase.storage
          .from("pdf-uploads")
          .upload(path, run.file, { contentType: "application/pdf", upsert: false });
        if (upErr) throw new Error(upErr.message);

        // 2. Insert run record
        const { data: runRow, error: runErr } = await supabase
          .from("document_runs")
          .insert({
            session_id: sessionId,
            user_name: name,
            pdf_name: run.file.name,
            pdf_storage_path: path,
            model_provider: provider,
            model_name: model,
            api_key_mode: apiKeyMode,
            status: "extracting",
          })
          .select("id")
          .single();
        if (runErr || !runRow) throw new Error(runErr?.message ?? "Failed to create run");

        // 3. Extract via /api/process-pdf (placeholder)
        updateRun(run.id, { status: "extracting" });
        const { parameters, raw_response } = await processPdf({
          sessionId,
          userName: name,
          pdfName: run.file.name,
          pdfStoragePath: path,
          userPdfKey: run.pdfKey,
          model,
          apiKeyMode,
          ownApiKey: apiKeyMode === "own" ? ownKey : undefined,
        });

        // 4. Save extraction
        updateRun(run.id, { status: "saving" });
        const { error: resErr } = await supabase.from("extraction_results").insert({
          run_id: runRow.id,
          session_id: sessionId,
          user_name: name,
          pdf_name: run.file.name,
          user_pdf_key: run.pdfKey,
          ...parameters,
          raw_response: raw_response as any,
        });
        if (resErr) throw new Error(resErr.message);

        await supabase
          .from("document_runs")
          .update({ status: "complete" })
          .eq("id", runRow.id);

        updateRun(run.id, { status: "complete" });

        const newRow: ResultRow = {
          user_name: name,
          pdf_name: run.file.name,
          user_pdf_key: run.pdfKey,
          parameter_1: parameters.parameter_1 ?? null,
          parameter_2: parameters.parameter_2 ?? null,
          parameter_3: parameters.parameter_3 ?? null,
          parameter_4: parameters.parameter_4 ?? null,
          parameter_5: parameters.parameter_5 ?? null,
          parameter_6: parameters.parameter_6 ?? null,
          parameter_7: parameters.parameter_7 ?? null,
          parameter_8: parameters.parameter_8 ?? null,
          parameter_9: parameters.parameter_9 ?? null,
          parameter_10: parameters.parameter_10 ?? null,
          parameter_11: parameters.parameter_11 ?? null,
          parameter_12: parameters.parameter_12 ?? null,
          parameter_13: parameters.parameter_13 ?? null,
          status: "complete",
          created_at: new Date().toISOString(),
        };
        setResults((prev) => [newRow, ...prev]);
      } catch (err: any) {
        console.error(err);
        updateRun(run.id, { status: "failed", error: err?.message ?? "Something went wrong" });
        toast.error(`Failed: ${run.file.name}`);
      }
    }

    setProcessing(false);
    // Clear key from memory immediately after processing
    if (apiKeyMode === "own") setOwnKey("");
    toast.success("Processing complete");
  };

  const onProcessMore = () => {
    setFiles([]);
    setRuns([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl gradient-bg flex items-center justify-center shadow-md">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold leading-tight">PDF Extract</p>
              <p className="text-xs text-muted-foreground">Hi, {name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4" /> Switch user
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <Stepper current={step} />

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* LEFT: Upload + Model */}
          <section className="card-soft p-5 sm:p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold">1. Upload your PDFs</h2>
              <p className="text-sm text-muted-foreground">Drag & drop or click to choose files.</p>
            </div>
            <PdfDropzone files={files} onChange={setFiles} />

            <div className="pt-2 border-t" />

            <div>
              <h2 className="text-lg font-semibold">2. Choose AI provider & model</h2>
              <p className="text-sm text-muted-foreground">Powered by Groq — lightning fast inference.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select value={provider} disabled>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="groq">Groq</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <Select value={model} onValueChange={(v) => setModel(v as GroqModel)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GROQ_MODELS.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        <div className="flex flex-col">
                          <span>{m.label}</span>
                          <span className="text-xs text-muted-foreground">{m.blurb}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">3. API key</Label>
              <RadioGroup
                value={apiKeyMode}
                onValueChange={(v) => setApiKeyMode(v as ApiKeyMode)}
                className="grid sm:grid-cols-2 gap-3"
              >
                <KeyModeCard
                  value="app"
                  selected={apiKeyMode === "app"}
                  title="Use app key"
                  desc="Quick start, no setup."
                  icon={<ShieldCheck className="h-4 w-4" />}
                />
                <KeyModeCard
                  value="own"
                  selected={apiKeyMode === "own"}
                  title="Use my own key"
                  desc="Best for heavy usage."
                  icon={<KeyRound className="h-4 w-4" />}
                />
              </RadioGroup>

              {apiKeyMode === "app" && (
                <Alert className="mt-3 border-warning/40 bg-warning/10">
                  <AlertTriangle className="h-4 w-4 text-warning-foreground" />
                  <AlertTitle>Shared key in use</AlertTitle>
                  <AlertDescription className="text-muted-foreground">
                    The application API key is shared. It may hit rate limits during heavy usage, which can cause slower responses,
                    delays, or temporary failures. For reliable processing, use your own Groq API key.
                  </AlertDescription>
                </Alert>
              )}

              {apiKeyMode === "own" && (
                <div className="mt-3 space-y-2">
                  <Label htmlFor="own-key">Your Groq API key</Label>
                  <Input
                    id="own-key"
                    type="password"
                    autoComplete="off"
                    placeholder="gsk_..."
                    value={ownKey}
                    onChange={(e) => setOwnKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Used only for this processing request. Never stored.
                  </p>
                </div>
              )}
            </div>

            <Button
              size="lg"
              disabled={!canStart}
              onClick={onStart}
              className="w-full gradient-bg text-primary-foreground shadow-md hover:opacity-95"
            >
              <Play className="h-4 w-4" />
              {processing ? "Processing…" : "Start processing"}
            </Button>
          </section>

          {/* RIGHT: Processing + Recent */}
          <section className="space-y-4">
            <div className="card-soft p-5 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Processing status</h2>
                {processing && <StatusBadge status="processing" />}
              </div>

              {runs.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <p className="text-sm">No active jobs. Upload PDFs and start processing to see live progress here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {runs.map((r) => (
                    <ProcessingTimeline key={r.id} pdfName={r.file.name} status={r.status} error={r.error} />
                  ))}
                </div>
              )}
            </div>

            <div className="card-soft p-5 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Recent extractions</h2>
                <span className="text-xs text-muted-foreground">{results.length} total</span>
              </div>
              {loadingHistory ? (
                <div className="space-y-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              ) : results.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing yet. Your processed PDFs will appear here.</p>
              ) : (
                <ul className="divide-y">
                  {results.slice(0, 5).map((r) => (
                    <li key={r.user_pdf_key} className="py-2 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{r.pdf_name}</p>
                        <p className="text-xs text-muted-foreground font-mono truncate">{r.user_pdf_key}</p>
                      </div>
                      <StatusBadge status={r.status} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        {/* Results */}
        <ResultsTable rows={results} onProcessMore={onProcessMore} />
      </div>
    </main>
  );
}

function KeyModeCard({
  value, selected, title, desc, icon,
}: { value: string; selected: boolean; title: string; desc: string; icon: React.ReactNode }) {
  return (
    <label
      htmlFor={`key-${value}`}
      className={`cursor-pointer rounded-xl border p-3 flex items-start gap-3 transition-all ${
        selected ? "border-primary bg-accent/40 shadow-sm" : "hover:border-primary/40"
      }`}
    >
      <RadioGroupItem id={`key-${value}`} value={value} className="mt-1" />
      <div>
        <div className="flex items-center gap-2 font-medium text-sm">
          {icon} {title}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
    </label>
  );
}
