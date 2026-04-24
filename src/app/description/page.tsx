"use client";

import AuthGuard from "@/app/AuthGuard";
import EnvironmentDescription from "@/app/description/components/environment-description";
import UploadDocument from "@/app/description/components/upload-document";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export default function DescribePage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFileTooLarge = file ? file.size > MAX_FILE_SIZE_BYTES : false;
  const canSubmit =
    (description.trim().length > 0 || file !== null) && !isFileTooLarge;

  const handleSave = async () => {
    if (!canSubmit || isSubmitting) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const trimmedDescription = description.trim();
      let response: Response;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        if (trimmedDescription) {
          formData.append("description", trimmedDescription);
        }

        response = await fetch("/api/description", {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch("/api/description", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: trimmedDescription }),
        });
      }

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(
          errorBody?.message ||
            errorBody?.error ||
            `Request failed with status ${response.status}`,
        );
      }

      const data = await response.json();
      sessionStorage.setItem("descriptionPrefill", JSON.stringify(data));
      sessionStorage.setItem("descriptionInput", JSON.stringify(description));
      router.push("/estimation");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setIsSubmitting(false);
    }
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

        {isFileTooLarge ? (
          <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            File must be 10MB or smaller.
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="mt-8 flex items-center justify-end gap-3">
          <Link
            href="/"
            className="rounded-lg border bg-background px-5 py-2.5 text-sm font-medium hover:bg-accent"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={!canSubmit || isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing
              </>
            ) : (
              <>
                Save & continue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </AuthGuard>
  );
}
