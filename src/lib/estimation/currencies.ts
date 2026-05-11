export const ESTIMATION_CURRENCY_OPTIONS = [
  { value: "EUR", label: "Euro" },
  { value: "USD", label: "US Dollar" },
  { value: "PLN", label: "Polish Zloty" },
  { value: "GBP", label: "British Pound" },
] as const;

export type EstimationCurrency =
  (typeof ESTIMATION_CURRENCY_OPTIONS)[number]["value"];

export const DEFAULT_ESTIMATION_CURRENCY: EstimationCurrency = "EUR";
