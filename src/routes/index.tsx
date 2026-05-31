import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Sparkles, FileSearch, Wand2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUserName, setUserName, getSessionId, normalizeName } from "@/lib/pdfx";
import logo from "@/assets/logo.png";
import { SampleResultCard } from "@/components/pdfx/SampleResultCard";
import { RecentExtractionsCard } from "@/components/pdfx/RecentExtractionsCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DocuExtract AI — AI-powered PDF data extraction" },
      { name: "description", content: "Extract structured data from PDFs in seconds using Groq AI. No signup, just your name." },
      { property: "og:title", content: "DocuExtract AI — AI-powered PDF data extraction" },
      { property: "og:description", content: "Extract structured data from PDFs in seconds using Groq AI." },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const existing = getUserName();
    if (existing) {
      setName(existing);
      setConfirmed(true);
    }
  }, []);

  const valid = name.trim().length >= 2;
  const userNameKey = useMemo(() => (confirmed ? normalizeName(name) : ""), [name, confirmed]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    setUserName(name.trim());
    getSessionId();
    setConfirmed(true);
  };

  return (
    <main className="min-h-screen">
      {/* Top nav */}
      <header className="border-b bg-card/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="DocuExtract AI" className="h-10 w-10 rounded-xl shadow-md" />
            <div>
              <p className="font-semibold leading-tight">DocuExtract AI</p>
              <p className="text-xs text-muted-foreground">PDF → Structured Data</p>
            </div>
          </div>
          {confirmed && (
            <Button onClick={() => navigate({ to: "/workspace" })} className="gradient-bg text-primary-foreground">
              Open workspace <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        {/* Hero */}
        <section className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <img src={logo} alt="DocuExtract AI" className="h-24 w-24 rounded-2xl shadow-lg" />
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI-powered PDF extraction · Powered by Groq
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
              Turn messy PDFs into <span className="gradient-text">clean, exportable data</span>.
            </h1>
            <p className="text-lg text-muted-foreground">
              Drop in your PDFs, pick a Groq model, and get a tidy table of 13 extracted policy fields. No accounts, no fuss — just your name to get started.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><FileSearch className="h-4 w-4 mt-0.5 text-primary" /> Upload multiple PDFs at once</li>
              <li className="flex items-start gap-2"><Wand2 className="h-4 w-4 mt-0.5 text-primary" /> Choose between fast or high-quality Groq models</li>
              <li className="flex items-start gap-2"><Sparkles className="h-4 w-4 mt-0.5 text-primary" /> Export results to CSV, Excel, or PDF</li>
            </ul>
          </div>

          {!confirmed ? (
            <form onSubmit={onSubmit} className="card-soft p-7 sm:p-9">
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Welcome 👋</h2>
                <p className="text-sm text-muted-foreground mt-1">What should we call you?</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Your name</Label>
                <Input
                  id="name"
                  autoFocus
                  maxLength={60}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="h-12 text-base"
                />
                {touched && !valid && (
                  <p className="text-xs text-destructive">Please enter at least 2 characters.</p>
                )}
              </div>
              <Button type="submit" size="lg" className="mt-6 w-full gradient-bg text-primary-foreground shadow-md hover:opacity-95">
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                We don't ask for email or password. Type the same name on any device to see your past extractions.
              </p>
            </form>
          ) : (
            <RecentExtractionsCard userNameKey={userNameKey} userNameDisplay={name.trim()} />
          )}
        </section>

        {/* Featured proof / flex section */}
        <SampleResultCard />
      </div>
    </main>
  );
}
