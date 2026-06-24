import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";

/**
 * GET /api/cards/[cardId]
 *
 * Retrieves a single card by its ID, scoped to the authenticated user's
 * organization. Includes the associated list's title in the response.
 *
 * @param req - The incoming HTTP request
 * @param params - Route parameters containing the card ID
 * @returns The card data as JSON, or an error response
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ cardId: string }> },
) {
  try {
    const { cardId } = await params;
    const { userId, orgId } = await auth();

    // Reject requests from unauthenticated or unauthorized users
    if (!userId || !orgId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch the card by ID, ensuring it belongs to the user's organization
    const card = await db.card.findUnique({
      where: {
        id: cardId,
        list: {
          board: {
            orgId, // Scopes the query to the authenticated organization
          },
        },
      },
      include: {
        list: {
          select: {
            title: true, // Include only the list title in the response
          },
        },
      },
    });

    return NextResponse.json(card);
  } catch {
    // Return a 500 response for any unexpected server errors
    return new NextResponse("Internal Error", { status: 500 });
  }
}
