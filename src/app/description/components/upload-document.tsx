import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Upload, X } from "lucide-react";

export default function UploadDocument({
  file,
  setFile,
}: {
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
}) {
  return (
    <Card className="shadow-card mt-8">
      <CardHeader>
        <CardTitle>Upload a document</CardTitle>
        <CardDescription>
          PDF, DOCX, TXT, or Markdown. Max 10MB.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
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
      </CardContent>
    </Card>
  );
}
