"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

import PageContainer from "@/components/PageContainer";
import { useDescription } from "@/app/(auth-users)/(with-description-context)/description/hooks/useDescription";
import EnvironmentDescription from "@/app/(auth-users)/(with-description-context)/description/components/environment-description";
import UploadDocument from "@/app/(auth-users)/(with-description-context)/description/components/upload-document";

export default function DescribePage() {
  const {
    descriptionInput,
    setDescriptionInput,
    file,
    setFile,
    isSubmitting,
    error,
    canSubmit,
    isFileTooLarge,
    handleSave,
  } = useDescription();

  return (
    <PageContainer
      pageTitle="Describe your environment"
      pageDescription="Tell us about your setup or upload a document. AI will use it to pre-fill the estimation."
    >
      <EnvironmentDescription
        description={descriptionInput}
        setDescription={setDescriptionInput}
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
    </PageContainer>
  );
}
