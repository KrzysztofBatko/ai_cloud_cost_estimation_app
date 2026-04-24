import { Sparkles } from "lucide-react";
import Link from "next/link";

export function SessionDescription({
  sessionDescription,
}: {
  sessionDescription: string;
}) {
  if (!sessionDescription) {
    return null;
  }

  return (
    <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">
              Estimation pre-filled from your description
            </h2>
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              AI
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            We&apos;ve analyzed your input and pre-selected providers and
            answers below. Review and adjust as needed.
          </p>
          {sessionDescription && (
            <blockquote className="mt-3 rounded-md border-l-2 border-primary/40 bg-background/60 p-3 text-xs italic text-muted-foreground">
              {sessionDescription}
            </blockquote>
          )}
          <div className="mt-3">
            <Link
              href="/description"
              className="text-xs font-medium text-primary hover:underline"
            >
              Edit description →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
