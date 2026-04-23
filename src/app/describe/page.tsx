"use client";

import AuthGuard from "@/app/AuthGuard";
import { ArrowRight, FileText, Upload, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DescribePage() {
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const canSubmit = description.trim().length > 0 || file !== null;

  const handleSave = () => {
    // Mock: just navigate forward with a flag in search params.
    const summary = file
      ? `Uploaded file: ${file.name}`
      : description.slice(0, 140);
  };

  return (
    <AuthGuard>
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <div className="flex items-center gap-3">
          <div>
            <h1>Describe your environment</h1>
            <h3>
              Tell us about your setup or upload a document. AI will use it to
              pre-fill the estimation.
            </h3>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border bg-card p-6 shadow-sm">
          <label className="text-sm font-semibold text-foreground">
            Environment description
          </label>
          <p className="mt-1 text-xs text-muted-foreground">
            Describe your application, expected traffic, services, regions, etc.
          </p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={10}
            placeholder="e.g. We run a SaaS web app with ~20k MAU. Frontend is a Next.js app served via CDN, backend is a Node.js API on Kubernetes (~3 services), Postgres database (~50GB), object storage for user uploads (~2TB), deployed in EU regions..."
            className="mt-3 w-full resize-y rounded-lg border bg-background p-4 text-sm text-foreground outline-none ring-ring focus:ring-2"
          />
          <div className="mt-2 text-right text-xs text-muted-foreground">
            {description.length} characters
          </div>
        </section>

        <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-wide text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          or
          <div className="h-px flex-1 bg-border" />
        </div>

        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <label className="text-sm font-semibold text-foreground">
            Upload a document
          </label>
          <p className="mt-1 text-xs text-muted-foreground">
            PDF, DOCX, TXT, or Markdown. Max 10MB.
          </p>

          {!file ? (
            <label className="mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background py-10 text-center transition hover:border-primary/40 hover:bg-accent/30">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <div className="text-sm font-medium">
                Click to upload or drag & drop
              </div>
              <div className="text-xs text-muted-foreground">
                PDF, DOCX, TXT, MD
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.md"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          ) : (
            <div className="mt-3 flex items-center justify-between rounded-lg border bg-background p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-medium">{file.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </section>

        <div className="mt-8 flex items-center justify-end gap-3">
          <Link
            href="/"
            className="rounded-lg border bg-background px-5 py-2.5 text-sm font-medium hover:bg-accent"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save & continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </AuthGuard>
  );
}
