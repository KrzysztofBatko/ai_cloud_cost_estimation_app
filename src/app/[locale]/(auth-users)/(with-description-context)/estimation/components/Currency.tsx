"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTranslations } from "next-intl";
import {
  ESTIMATION_CURRENCY_OPTIONS,
  type EstimationCurrency,
} from "@/lib/estimation/currencies";

interface Props {
  currency: EstimationCurrency;
  onCurrencyChange: (currency: EstimationCurrency) => void;
}

export default function Currency({ currency, onCurrencyChange }: Props) {
  const t = useTranslations("estimation.currency");

  return (
    <Card className="shadow-card gap-3">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={currency}
          onValueChange={(value) =>
            onCurrencyChange(value as EstimationCurrency)
          }
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ESTIMATION_CURRENCY_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-3 shadow-xs transition-colors hover:bg-muted data-[selected=true]:border-primary data-[selected=true]:bg-primary/5"
                data-selected={currency === option.value}
              >
                <RadioGroupItem value={option.value} />
                <span className="flex flex-col">
                  <span className="text-sm font-semibold">{option.value}</span>
                  <span className="text-xs text-muted-foreground">
                    {option.label}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
