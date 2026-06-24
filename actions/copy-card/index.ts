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

  // boardId from the client payload is not trusted for revalidation.
  const { id } = data;
  let card;
  // Will be assigned from the source card's parent board after a successful lookup.
  let actualBoardId: string | undefined;

  try {
    // Fetch the source card including the parent board so we can derive the
    // correct revalidation path without trusting the client-supplied boardId.
    const cardToCopy = await db.card.findUnique({
      where: {
        id,
        list: {
          board: {
            orgId,
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

    if (!cardToCopy) {
      return { error: "Card not found" };
    }

    // Capture the real board id before entering the transaction.
    actualBoardId = cardToCopy.list.board.id;

    // Wrap the order-read and card-create in a transaction so concurrent copies
    // never observe the same "last" order and produce duplicate order values.
    card = await db.$transaction(async (tx) => {
      const lastCard = await tx.card.findFirst({
        where: { listId: cardToCopy.listId },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      const newOrder = lastCard ? lastCard.order + 1 : 1;

      return tx.card.create({
        data: {
          title: `${cardToCopy.title} - Copy`,
          description: cardToCopy.description,
          order: newOrder,
          listId: cardToCopy.listId,
        },
      });
    });
  } catch {
    return { error: "Failed to copy." };
  }

  // Derive the board path from the source card rather than the client payload
  // to ensure we revalidate the correct board.
  revalidatePath(`/board/${actualBoardId}`);
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
