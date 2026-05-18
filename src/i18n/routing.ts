import { defineRouting } from "next-intl/routing";

const LOCALES = ["pl", "en"] as const;

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: "pl",
});
