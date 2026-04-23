import { Provider, ProviderRegion } from "@/types/api";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function useProviders() {
  const { data: session } = useSession();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [newProvider, setNewProvider] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingProviders, setFetchingProviders] = useState(false);
  const [providerError, setProviderError] = useState<string | null>(null);
  const [canBeDeactivated, setCanBeDeactivated] = useState(false);
  const [newRegionByProvider, setNewRegionByProvider] = useState<
    Record<string, { value: string; label: string }>
  >({});

  const isAdmin =
    session?.user?.role === "admin" || session?.user?.role === "superadmin";

  useEffect(() => {
    if (isAdmin) fetchProviders(true);
  }, [isAdmin]);

  const fetchProviders = async (isInitial?: boolean) => {
    try {
      setProviderError(null);
      if (isInitial) setFetchingProviders(true);
      const response = await fetch("/api/providers?includeInactive=true");
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(
          errorBody?.error || `HTTP error! status: ${response.status}`,
        );
      }

      const result = await response.json();

      if (result.data) {
        setProviders(result.data);
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Could not fetch providers. Please try again.";
      setProviderError(message);
    } finally {
      setFetchingProviders(false);
    }
  };

  const addProvider = async () => {
    if (!newProvider.trim()) return;

    try {
      setLoading(true);
      const response = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProvider.trim() }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(
          errorBody?.error || `HTTP error! status: ${response.status}`,
        );
      }

      setNewProvider("");
      await fetchProviders();
    } catch (error) {
      console.error("Error adding provider:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Could not add provider. Please try again.";
      setProviderError(message);
    } finally {
      setLoading(false);
    }
  };

  const setNewRegionDraft = (
    providerId: string,
    field: "value" | "label",
    value: string,
  ) => {
    setNewRegionByProvider((prev) => ({
      ...prev,
      [providerId]: {
        value: field === "value" ? value : (prev[providerId]?.value ?? ""),
        label: field === "label" ? value : (prev[providerId]?.label ?? ""),
      },
    }));
  };

  const addRegion = async (providerId: string) => {
    const draft = newRegionByProvider[providerId];
    if (!draft?.value?.trim() || !draft?.label?.trim()) return;

    try {
      setLoading(true);
      setProviderError(null);
      const response = await fetch(`/api/providers/${providerId}/regions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          value: draft.value.trim(),
          label: draft.label.trim(),
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(
          errorBody?.error || `HTTP error! status: ${response.status}`,
        );
      }

      const result = await response.json();
      const createdRegion = result?.data as ProviderRegion | undefined;

      if (createdRegion?.id) {
        setProviders((prev) =>
          prev.map((provider) =>
            provider.id === providerId
              ? {
                  ...provider,
                  regions: [...(provider.regions ?? []), createdRegion].sort(
                    (left, right) => {
                      if (left.isDefault === right.isDefault) {
                        return left.label.localeCompare(right.label);
                      }

                      return left.isDefault ? -1 : 1;
                    },
                  ),
                  defaultRegion:
                    createdRegion.isDefault
                      ? createdRegion.value
                      : provider.defaultRegion ?? createdRegion.value,
                }
              : provider,
          ),
        );
      } else {
        await fetchProviders();
      }

      setNewRegionByProvider((prev) => ({
        ...prev,
        [providerId]: { value: "", label: "" },
      }));
    } catch (error) {
      console.error("Error adding region:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Could not add region. Please try again.";
      setProviderError(message);
    } finally {
      setLoading(false);
    }
  };

  const setDefaultRegion = async (providerId: string, regionId: string) => {
    try {
      setLoading(true);
      setProviderError(null);
      const response = await fetch(
        `/api/providers/${providerId}/regions/${regionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isDefault: true }),
        },
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(
          errorBody?.error || `HTTP error! status: ${response.status}`,
        );
      }

      const result = await response.json();
      const updatedRegion = result?.data as ProviderRegion | undefined;

      if (updatedRegion?.id) {
        setProviders((prev) =>
          prev.map((provider) =>
            provider.id === providerId
              ? {
                  ...provider,
                  defaultRegion: updatedRegion.value,
                  regions: (provider.regions ?? [])
                    .map((region) => ({
                      ...region,
                      isDefault: region.id === updatedRegion.id,
                    }))
                    .sort((left, right) => {
                      if (left.isDefault === right.isDefault) {
                        return left.label.localeCompare(right.label);
                      }

                      return left.isDefault ? -1 : 1;
                    }),
                }
              : provider,
          ),
        );
      } else {
        await fetchProviders();
      }
    } catch (error) {
      console.error("Error updating default region:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Could not update the default region.";
      setProviderError(message);
    } finally {
      setLoading(false);
    }
  };

  const deleteRegion = async (providerId: string, regionId: string) => {
    try {
      setLoading(true);
      setProviderError(null);
      const response = await fetch(
        `/api/providers/${providerId}/regions/${regionId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(
          errorBody?.error || `HTTP error! status: ${response.status}`,
        );
      }

      await fetchProviders();
    } catch (error) {
      console.error("Error deleting region:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Could not delete region. Please try again.";
      setProviderError(message);
    } finally {
      setLoading(false);
    }
  };

  const setProviderActive = async (id: string, isActive: boolean) => {
    try {
      setProviderError(null);
      setCanBeDeactivated(false);
      setLoading(true);

      const response = await fetch(`/api/providers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(
          errorBody?.error || `HTTP error! status: ${response.status}`,
        );
      }

      const result = await response.json();
      const updated = result?.data;

      if (updated?.id) {
        setProviders((prev) =>
          prev.map((provider) =>
            provider.id === updated.id
              ? {
                  ...provider,
                  isActive: updated.isActive ?? isActive,
                }
              : provider,
          ),
        );
      } else {
        await fetchProviders();
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not update provider status.";
      setProviderError(message);
      console.error("Error updating provider status:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProvider = async (id: string) => {
    try {
      setProviderError(null);
      setCanBeDeactivated(false);
      setLoading(true);
      const response = await fetch(`/api/providers/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        if (response.status === 409) setCanBeDeactivated(true);
        throw new Error(
          errorBody?.error || `HTTP error! status: ${response.status}`,
        );
      }

      await fetchProviders();
    } catch (error: unknown) {
      setProviderError(
        (error as { message: string })?.message ||
          "An error occurred while deleting the provider.",
      );
      console.error("Error deleting provider:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    providers,
    newProvider,
    loading,
    fetchingProviders,
    fetchProviders,
    addProvider,
    deleteProvider,
    setProviderActive,
    setNewProvider,
    addRegion,
    deleteRegion,
    setDefaultRegion,
    newRegionByProvider,
    setNewRegionDraft,
    providerError,
    canBeDeactivated,
  };
}
