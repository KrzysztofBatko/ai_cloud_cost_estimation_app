"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];

function getLocalizedPathname(
  pathname: string,
  nextLocale: Locale,
  currentLocale: Locale,
) {
  if (currentLocale) {
    const segments = pathname.split("/");
    segments[1] = nextLocale;
    return segments.join("/") || `/${nextLocale}`;
  }

  return pathname === "/" ? `/${nextLocale}` : `/${nextLocale}${pathname}`;
}

export default function LanguageSwitcher() {
  const currentLocale = useLocale();
  const pathname = usePathname() ?? "/";
  const router = useRouter();

  function changeLanguage(nextLocale: Locale) {
    if (nextLocale === currentLocale) return;

    const nextPathname = getLocalizedPathname(
      pathname,
      nextLocale,
      currentLocale as Locale,
    );
    const search = window.location.search;

    router.replace(`${nextPathname}${search}`);
  }

  return (
    <Select
      value={currentLocale}
      onValueChange={(nextLocale) => changeLanguage(nextLocale as Locale)}
    >
      <SelectTrigger
        size="sm"
        className="w-[70px]"
        aria-label="Change language"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {routing.locales.map((locale) => (
          <SelectItem key={locale} value={locale}>
            {locale.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
