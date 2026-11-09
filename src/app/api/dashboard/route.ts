import { getUserId } from "@/lib/api/auth";
import { handleApiError, jsonResponse } from "@/lib/api/response";
import { dashboardService } from "@/lib/services/dashboard.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeZone =
      searchParams.get("timeZone") ??
      searchParams.get("timezone") ??
      request.headers.get("x-timezone");

    const summary = await dashboardService.getSummary(await getUserId(), {
      timeZone,
    });
    return jsonResponse(summary);
  } catch (error) {
    return handleApiError(error);
  }
}
