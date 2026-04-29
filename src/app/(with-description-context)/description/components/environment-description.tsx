import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function EnvironmentDescription({
  description,
  setDescription,
}: {
  description: string;
  setDescription: (desc: string) => void;
}) {
  return (
    <Card className="shadow-card mt-8">
      <CardHeader>
        <CardTitle>Environment description</CardTitle>
        <CardDescription>
          Describe your application, expected traffic, services, regions, etc.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={10}
          placeholder="e.g. We run a SaaS web app with ~20k MAU. Frontend is a Next.js app served via CDN, backend is a Node.js API on Kubernetes (~3 services), Postgres database (~50GB), object storage for user uploads (~2TB), deployed in EU regions..."
        />
        <div className="mt-2 text-right text-xs text-muted-foreground">
          {description.length} characters
        </div>
      </CardContent>
    </Card>
  );
}
