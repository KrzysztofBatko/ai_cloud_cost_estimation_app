import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";

export default function EnvironmentDescription({
  description,
  setDescription,
}: {
  description: string;
  setDescription: (desc: string) => void;
}) {
  const t = useTranslations("description.environment");

  return (
    <Card className="shadow-card mt-8">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={10}
          placeholder={t("placeholder")}
        />
        <div className="mt-2 text-right text-xs text-muted-foreground">
          {t("characterCount", { count: description.length })}
        </div>
      </CardContent>
    </Card>
  );
}
