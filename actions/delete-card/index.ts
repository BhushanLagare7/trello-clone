"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@clerk/nextjs/server";

import { createAuditLog } from "@/lib/create-audit-log";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { ACTION, ENTITY_TYPE } from "@/lib/generated/prisma/enums";

import { DeleteCard } from "./schema";
import { InputType, ReturnType } from "./types";

/**
 * Handler for deleting a card.
 *
 * Validates authentication and organization membership, deletes the specified
 * card from the database, creates an audit log entry for the delete operation,
 * and revalidates the board page cache to reflect the removal.
 *
 * @param data - The input data containing the card ID and board ID
 * @returns The deleted card data, or an error message if the operation fails
 */
const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = await auth();

  // Reject requests from unauthenticated or unauthorized users
  if (!userId || !orgId) {
    return {
      error: "Unauthorized",
    };
  }

  // Destructure the input data (boardId is intentionally unused; the actual
  // board path is derived from the deleted card record after the mutation)
  const { id } = data;
  let card;

  try {
    // Delete the card, scoped to the authenticated organization.
    // Include the parent board so we can derive the revalidation path from the
    // actual record rather than the client-supplied boardId.
    card = await db.card.delete({
      where: {
        id,
        list: {
          board: {
            orgId, // Ensures the card belongs to the user's organization
          },
        },
      },
      include: {
        list: {
          include: {
            board: {
              select: { id: true },
            },
          },
        },
      },
    });

    // Create an audit log entry for the card delete operation.
    await createAuditLog({
      entityTitle: card.title,
      entityId: card.id,
      entityType: ENTITY_TYPE.CARD,
      action: ACTION.DELETE,
    });
  } catch {
    return {
      error: "Failed to delete.",
    };
  }

  // Derive the board path from the deleted record rather than the client payload
  // to ensure we revalidate the correct board.
  revalidatePath(`/board/${card.list.board.id}`);
  // Return the deleted card data
  return { data: card };
};

/**
 * deleteCard action
 *
 * A type-safe server action that validates input against the DeleteCard schema
 * before invoking the handler to perform the card deletion.
 */
export const deleteCard = createSafeAction(DeleteCard, handler);
