"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@clerk/nextjs/server";

import { createAuditLog } from "@/lib/create-audit-log";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { ACTION, ENTITY_TYPE } from "@/lib/generated/prisma/enums";

import { CreateCard } from "./schema";
import { InputType, ReturnType } from "./types";

/**
 * Server action handler that creates a new card within a specified list.
 *
 * - Verifies user authentication and organization membership
 * - Validates that the target list exists and belongs to the user's organization
 * - Automatically assigns the card an order value, placing it at the end of the list
 * - Creates an audit log entry for the card creation
 * - Revalidates the board page cache after successful creation
 *
 * @param data - Contains the card title, target listId, and parent boardId
 * @returns The created card on success, or an error message on failure
 */
const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = await auth();

  // Reject unauthenticated or unauthorized requests
  if (!userId || !orgId) {
    return {
      error: "Unauthorized",
    };
  }

  const { title, boardId, listId } = data;
  let card;

  try {
    // Verify the list exists and belongs to the user's organization
    const list = await db.list.findUnique({
      where: {
        id: listId,
        board: {
          orgId,
        },
      },
    });

    if (!list) {
      return {
        error: "List not found",
      };
    }

    // Fetch the current last card to determine the next order value
    const lastCard = await db.card.findFirst({
      where: { listId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    // Place the new card at the end, defaulting to order 1 if the list is empty
    const newOrder = lastCard ? lastCard.order + 1 : 1;

    card = await db.card.create({
      data: {
        title,
        listId,
        order: newOrder,
      },
    });

    // Create an audit log entry for the card creation
    await createAuditLog({
      entityId: card.id,
      entityTitle: card.title,
      entityType: ENTITY_TYPE.CARD,
      action: ACTION.CREATE,
    });
  } catch {
    return {
      error: "Failed to create.",
    };
  }

  // Invalidate the board page cache to reflect the newly created card
  revalidatePath(`/board/${boardId}`);
  return { data: card };
};

/** Validated and type-safe server action for creating a card, built from the CreateCard schema */
export const createCard = createSafeAction(CreateCard, handler);
