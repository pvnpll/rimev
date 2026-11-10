import { getUserId } from "@/lib/api/auth";
import { handleApiError } from "@/lib/api/response";
import { exportService } from "@/lib/services/export.service";

type RouteContext = { params: Promise<{ deckId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const userId = await getUserId();
    const { deckId } = await context.params;

    const { data, filename } = await exportService.exportDeck(userId, deckId);

    return new Response(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
