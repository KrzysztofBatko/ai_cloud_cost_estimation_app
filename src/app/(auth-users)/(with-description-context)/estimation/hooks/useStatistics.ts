import { Provider } from "@/app/(auth-users)/(with-description-context)/estimation/hooks/useActiveProviders";
import { ENDPOINTS } from "@/lib/api/utils";

export function useStatistics() {
  const saveStatistics = async (selectedProviders: Provider[]) => {
    const providerIds = selectedProviders.map((p) => p.id);
    try {
      const res = await fetch(ENDPOINTS.ESTIMATIONS_STATISTICS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerIds }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    } catch (error) {
      console.error("Error saving statistics:", error);
    }
  };

  return { saveStatistics };
}
