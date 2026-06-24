"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@clerk/nextjs/server";

import { createAuditLog } from "@/lib/create-audit-log";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { ACTION, ENTITY_TYPE } from "@/lib/generated/prisma/enums";

import { UpdateCard } from "./schema";
import { InputType, ReturnType } from "./types";

/**
 * Handler for updating a card's details.
 *
 * Validates the user's authentication and organization membership,
 * updates the specified card in the database, creates an audit log entry,
 * and revalidates the board page cache to reflect the changes.
 *
 * @param data - The input data containing the card ID, board ID, and fields to update
 * @returns The updated card data, or an error message if the operation fails
 */
const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = await auth();

  // Reject requests from unauthenticated or unauthorized users
  if (!userId || !orgId) {
    return {
      error: "Unauthorized",
    };
  }

  // boardId is intentionally not used for revalidation — the actual board path
  // is derived from the updated card record after the mutation succeeds.
  const { id, title, description } = data;
  let card;

  try {
    // Update the card, scoped to the authenticated organization to prevent unauthorized edits.
    // Include the parent board so we can derive the revalidation path from the
    // actual record rather than the client-supplied boardId.
    card = await db.card.update({
      where: {
        id,
        list: {
          board: {
            orgId, // Ensures the card belongs to the user's organization
          },
        },
      },
      data: { title, description },
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

    // Create an audit log entry for the card update operation.
    await createAuditLog({
      entityTitle: card.title,
      entityId: card.id,
      entityType: ENTITY_TYPE.CARD,
      action: ACTION.UPDATE,
    });
  } catch {
    // Return an error if the database update operation fails
    return {
      error: "Failed to update.",
    };
  }

  // Derive the board path from the updated record rather than the client payload
  // to ensure we revalidate the correct board.
  revalidatePath(`/board/${card.list.board.id}`);
  return { data: card };
};

/**
 * updateCard action
 *
 * A type-safe server action that validates input against the UpdateCard schema
 * before invoking the handler to perform the card update.
 */
export const updateCard = createSafeAction(UpdateCard, handler);
