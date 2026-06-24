"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@clerk/nextjs/server";

import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";

import { DeleteCard } from "./schema";
import { InputType, ReturnType } from "./types";

/**
 * Handler for deleting a card.
 *
 * Validates authentication and organization membership, deletes the specified
 * card from the database, and revalidates the board page cache to reflect
 * the removal.
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

  // Destructure the input data
  const { id, boardId } = data;
  let card;

  try {
    // Delete the card, scoped to the authenticated organization
    card = await db.card.delete({
      where: {
        id,
        list: {
          board: {
            orgId, // Ensures the card belongs to the user's organization
          },
        },
      },
    });
  } catch {
    return {
      error: "Failed to delete.",
    };
  }

  // Revalidate the board page to reflect the deleted card
  revalidatePath(`/board/${boardId}`);
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
