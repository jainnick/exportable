import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, FileSearch, Wand2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUserName, setUserName, getSessionId } from "@/lib/pdfx";
import logo from "@/assets/logo.png";

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

  useEffect(() => {
    const existing = getUserName();
    if (existing) setName(existing);
  }, []);

  const valid = name.trim().length >= 2;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    setUserName(name.trim());
    getSessionId(); // ensure session exists
    navigate({ to: "/workspace" });
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <img src={logo} alt="DocuExtract AI" className="h-20 w-20 rounded-2xl shadow-md" />
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI-powered PDF extraction
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Turn messy PDFs into <span className="gradient-text">clean, exportable data</span>.
          </h1>
          <p className="text-lg text-muted-foreground">
            Drop in your PDFs, pick a model, and get a tidy table of extracted fields. No accounts, no fuss — just your name to get started.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><FileSearch className="h-4 w-4 mt-0.5 text-primary" /> Upload multiple PDFs at once</li>
            <li className="flex items-start gap-2"><Wand2 className="h-4 w-4 mt-0.5 text-primary" /> Choose between fast or high-quality Groq models</li>
            <li className="flex items-start gap-2"><Sparkles className="h-4 w-4 mt-0.5 text-primary" /> Export results to CSV, Excel, or PDF</li>
          </ul>
        </div>

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
          <Button
            type="submit"
            size="lg"
            className="mt-6 w-full gradient-bg text-primary-foreground shadow-md hover:opacity-95"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            We don't ask for email or password. Your name stays on this device.
          </p>
        </form>
      </div>
    </main>
  );
}
