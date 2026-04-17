import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type Provider = {
  id: string;
  name: string;
};

export function useProviders() {
  const { data: session } = useSession();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [newProvider, setNewProvider] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingProviders, setFetchingProviders] = useState(false);

  const isAdmin =
    session?.user?.role === "admin" || session?.user?.role === "superadmin";

  useEffect(() => {
    if (isAdmin) fetchProviders(true);
  }, [isAdmin]);

  const fetchProviders = async (isInitial?: boolean) => {
    try {
      if (isInitial) setFetchingProviders(true);
      const response = await fetch("/api/providers");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.data) {
        setProviders(result.data);
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setNewProvider("");
      await fetchProviders();
    } catch (error) {
      console.error("Error adding provider:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProvider = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/providers/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchProviders();
    } catch (error) {
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
    setNewProvider,
  };
}
