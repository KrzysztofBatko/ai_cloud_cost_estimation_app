"use client";

import { createContext, useContext, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";

type DescriptionContextType = {
  descriptionInput: string;
  setDescriptionInput: Dispatch<SetStateAction<string>>;
  descriptionPrefill: DescriptionPrefill | null;
  setDescriptionPrefill: Dispatch<SetStateAction<DescriptionPrefill | null>>;
};

const DescriptionContext = createContext<DescriptionContextType | null>(null);

export function DescriptionProvider({ children }: { children: ReactNode }) {
  const [descriptionInput, setDescriptionInput] = useState("");
  const [descriptionPrefill, setDescriptionPrefill] =
    useState<DescriptionPrefill | null>(null);

  return (
    <DescriptionContext.Provider
      value={{
        descriptionInput,
        setDescriptionInput,
        descriptionPrefill,
        setDescriptionPrefill,
      }}
    >
      {children}
    </DescriptionContext.Provider>
  );
}

export function useDescriptionContext() {
  const context = useContext(DescriptionContext);

  if (!context) {
    throw new Error(
      "useFeatureDescriptionContext must be used inside FeatureDescriptionProvider",
    );
  }

  return context;
}
