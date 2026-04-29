"use client";

import { createContext, useContext, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";

export type DescriptionPrefill = {
  usage?: Record<string, string>;
  notes?: string;
  providers?: string[];
  providerRegions?: Record<string, string>;
  confidence?: string;
  sourceSummary?: string;
  missingDetails?: string[];
  source?: {
    type: string;
    name?: string;
    size?: number;
    contentType?: string;
  };
};

type FeatureDescriptionContextType = {
  descriptionInput: string;
  setDescriptionInput: Dispatch<SetStateAction<string>>;
  descriptionPrefill: DescriptionPrefill | null;
  setDescriptionPrefill: Dispatch<SetStateAction<DescriptionPrefill | null>>;
};

const FeatureDescriptionContext =
  createContext<FeatureDescriptionContextType | null>(null);

export function FeatureDescriptionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [descriptionInput, setDescriptionInput] = useState("");
  const [descriptionPrefill, setDescriptionPrefill] =
    useState<DescriptionPrefill | null>(null);

  return (
    <FeatureDescriptionContext.Provider
      value={{
        descriptionInput,
        setDescriptionInput,
        descriptionPrefill,
        setDescriptionPrefill,
      }}
    >
      {children}
    </FeatureDescriptionContext.Provider>
  );
}

export function useFeatureDescriptionContext() {
  const context = useContext(FeatureDescriptionContext);

  if (!context) {
    throw new Error(
      "useFeatureDescriptionContext must be used inside FeatureDescriptionProvider",
    );
  }

  return context;
}
