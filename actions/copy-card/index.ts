"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@clerk/nextjs/server";

import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";

import { CopyCard } from "./schema";
import { InputType, ReturnType } from "./types";

/**
 * Handler for copying a card.
 *
 * Validates authentication and organization membership, finds the card to copy,
 * determines the correct order for the new copy, creates the copy in the database,
 * and revalidates the board page cache to reflect the change.
 *
 * @param data - The input data containing the card ID and board ID
 * @returns The newly created card data, or an error message if the operation fails
 */
const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = await auth();

  // Reject requests from unauthenticated or unauthorized users
  if (!userId || !orgId) {
    return {
      error: "Unauthorized",
    };
  }

  // Destructure the input data
  const { id, boardId } = data;
  let card;

  try {
    // Attempt to find the card to copy, scoped to the authenticated organization
    const cardToCopy = await db.card.findUnique({
      where: {
        id,
        list: {
          board: {
            orgId,
          },
        },
      },
    });

    // Handle case where the card to copy is not found
    if (!cardToCopy) {
      return { error: "Card not found" };
    }

    // Find the last card in the same list to determine the new card's order
    const lastCard = await db.card.findFirst({
      where: { listId: cardToCopy.listId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    // Calculate the new order (one greater than the last card, or 1 if no cards exist)
    const newOrder = lastCard ? lastCard.order + 1 : 1;

    // Create the new copy of the card with the calculated order
    card = await db.card.create({
      data: {
        title: `${cardToCopy.title} - Copy`,
        description: cardToCopy.description,
        order: newOrder,
        listId: cardToCopy.listId,
      },
    });
  } catch {
    return {
      error: "Failed to copy.",
    };
  }

  // Revalidate the board page to update the UI with the new card
  revalidatePath(`/board/${boardId}`);
  // Return the newly created card data
  return { data: card };
};

/**
 * copyCard action
 *
 * A type-safe server action that validates input against the CopyCard schema
 * before invoking the handler to perform the card copy operation.
 */
export const copyCard = createSafeAction(CopyCard, handler);
