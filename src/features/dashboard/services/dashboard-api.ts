import { fetchJson } from "@/lib/utils/fetch-json";
import type { DashboardSummary } from "@/types/dashboard";

export const dashboardApi = {
  getSummary(timeZone?: string): Promise<DashboardSummary> {
    const tz =
      timeZone ??
      (typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : undefined);
    const params = new URLSearchParams();
    if (tz) {
      params.set("timeZone", tz);
    }
    const query = params.toString();
    return fetchJson<DashboardSummary>(`/api/dashboard${query ? `?${query}` : ""}`);
  },
};
