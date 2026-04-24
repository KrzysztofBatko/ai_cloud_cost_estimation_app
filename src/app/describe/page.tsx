"use client";

import AuthGuard from "@/app/AuthGuard";
import EnvironmentDescription from "@/app/describe/components/environment-description";
import UploadDocument from "@/app/describe/components/upload-document";
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

        <EnvironmentDescription
          description={description}
          setDescription={setDescription}
        />

        <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-wide text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          or
          <div className="h-px flex-1 bg-border" />
        </div>

        <UploadDocument file={file} setFile={setFile} />

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
