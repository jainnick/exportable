import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUserName, setUserName, getSessionId, normalizeName } from "@/lib/pdfx";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DocuExtract AI — AI-powered PDF data extraction" },
      { name: "description", content: "Enter your name to continue to your extraction workspace." },
      { property: "og:title", content: "DocuExtract AI — AI-powered PDF data extraction" },
      { property: "og:description", content: "Enter your name to continue to your extraction workspace." },
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
    const display = name.trim();
    setUserName(display);
    getSessionId();
    if (typeof window !== "undefined") {
      localStorage.setItem("user_name_display", display);
      localStorage.setItem("user_name_key", normalizeName(display));
    }
    navigate({ to: "/workspace" });
  };

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b bg-card/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center gap-3">
          <img src={logo} alt="DocuExtract AI" className="h-10 w-10 rounded-xl shadow-md" />
          <div>
            <p className="font-semibold leading-tight">DocuExtract AI</p>
            <p className="text-xs text-muted-foreground">PDF → Structured Data</p>
          </div>
        </div>
      </header>

      <div className="flex-1 mx-auto w-full max-w-md px-4 sm:px-6 py-12 sm:py-20 flex flex-col items-center">
        <img src={logo} alt="DocuExtract AI" className="h-20 w-20 rounded-2xl shadow-lg mb-6" />
        <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm mb-4">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI-powered PDF extraction
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-center leading-tight">
          Turn messy PDFs into <span className="gradient-text">clean, exportable data</span>.
        </h1>
        <p className="text-base text-muted-foreground text-center mt-3">
          Enter your name to continue to your extraction workspace.
        </p>

        <form onSubmit={onSubmit} className="card-soft p-6 sm:p-8 mt-8 w-full">
          <div className="space-y-2">
            <Label htmlFor="name">Your name</Label>
            <Input
              id="name"
              autoFocus
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="h-12 text-base"
            />
            {touched && !valid && (
              <p className="text-xs text-destructive">Please enter at least 2 characters.</p>
            )}
          </div>
          <Button type="submit" size="lg" className="mt-5 w-full gradient-bg text-primary-foreground shadow-md hover:opacity-95">
            Continue to Workspace <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            No email or password required. Use the same name on any device to see your past extractions.
          </p>
        </form>
      </div>
    </main>
  );
}
