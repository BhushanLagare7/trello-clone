import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { ENTITY_TYPE } from "@/lib/generated/prisma/enums";

/**
 * GET /api/cards/[cardId]/logs
 *
 * Retrieves the 3 most recent audit logs for a specific card
 * within the authenticated user's organization.
 *
 * @param request - Incoming HTTP request object
 * @param params  - Route parameters containing the target `cardId`
 *
 * @returns {200} JSON array of the latest audit log entries
 * @returns {401} Unauthorized - if the user or organization is not authenticated
 * @returns {500} Internal Error - if an unexpected server error occurs
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ cardId: string }> },
) {
  try {
    // Extract the card ID from the dynamic route parameters
    const { cardId } = await params;

    // Authenticate the current user and retrieve their organization ID
    const { userId, orgId } = await auth();

    // Reject requests from unauthenticated users or outside an organization
    if (!userId || !orgId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch the 3 most recent audit logs for the specified card in the current org
    const auditLogs = await db.auditLog.findMany({
      where: {
        orgId,
        entityId: cardId,
        entityType: ENTITY_TYPE.CARD, // Scope logs to CARD entity type only
      },
      orderBy: {
        createdAt: "desc", // Most recent logs first
      },
      take: 3, // Limit results to the latest 3 entries
    });

    return NextResponse.json(auditLogs);
  } catch {
    // Handle unexpected errors gracefully
    return new NextResponse("Internal Error", { status: 500 });
  }
}
