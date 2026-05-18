import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("home.footer");

  return (
    <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
      {t("copyright", { year: new Date().getFullYear() })}
    </footer>
  );
}
