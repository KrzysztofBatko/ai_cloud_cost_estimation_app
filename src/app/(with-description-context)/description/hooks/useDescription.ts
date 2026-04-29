import { useDescriptionContext } from "@/app/(with-description-context)/DescriptionContextProvider";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ENDPOINTS } from "@/lib/api/utils";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export function useDescription() {
  const router = useRouter();
  const { descriptionInput, setDescriptionInput, setDescriptionPrefill } =
    useDescriptionContext();
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFileTooLarge = file ? file.size > MAX_FILE_SIZE_BYTES : false;
  const canSubmit =
    (descriptionInput.trim().length > 0 || file !== null) && !isFileTooLarge;

  const handleSave = async () => {
    if (!canSubmit || isSubmitting) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const trimmedDescription = descriptionInput.trim();
      let response: Response;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        if (trimmedDescription) {
          formData.append("description", trimmedDescription);
        }

        response = await fetch(ENDPOINTS.DESCRIPTION, {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch(ENDPOINTS.DESCRIPTION, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: trimmedDescription }),
        });
      }

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(
          errorBody?.message ||
            errorBody?.error ||
            `Request failed with status ${response.status}`,
        );
      }

      const data = await response.json();
      setDescriptionPrefill(data);
      router.push("/estimation");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    descriptionInput,
    setDescriptionInput,
    file,
    setFile,
    isSubmitting,
    error,
    canSubmit,
    isFileTooLarge,
    handleSave,
  };
}
