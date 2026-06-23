"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@clerk/nextjs/server";

import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";

import { UpdateCardOrder } from "./schema";
import { InputType, ReturnType } from "./types";

/**
 * Server action handler that updates the order and list assignment of multiple
 * cards within a board. Executes all card updates as a single atomic database transaction.
 *
 * @param data - Contains the boardId and an array of cards with their new order and listId values
 * @returns The updated cards on success, or an error message on failure
 */
const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = await auth();

  // Ensure the user is authenticated and belongs to an organization
  if (!userId || !orgId) {
    return {
      error: "Unauthorized",
    };
  }

  const { items, boardId } = data;
  let updatedCards;

  try {
    // Build an array of update operations, one per card, scoped to the org for security
    const transaction = items.map((card) =>
      db.card.update({
        where: {
          id: card.id,
          list: {
            board: {
              orgId, // Prevents updating cards belonging to other organizations
            },
          },
        },
        data: {
          order: card.order,
          listId: card.listId, // Updated when a card is moved to a different list
        },
      }),
    );

    // Execute all updates atomically to prevent partial reorders
    updatedCards = await db.$transaction(transaction);
  } catch {
    return {
      error: "Failed to reorder.",
    };
  }

  // Invalidate the board page cache to reflect the new card order
  revalidatePath(`/board/${boardId}`);
  return { data: updatedCards };
};

/** Validates input via UpdateCardOrder schema before invoking the handler */
export const updateCardOrder = createSafeAction(UpdateCardOrder, handler);
