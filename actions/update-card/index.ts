"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@clerk/nextjs/server";

import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";

import { UpdateCard } from "./schema";
import { InputType, ReturnType } from "./types";

/**
 * Handler for updating a card's details.
 *
 * Validates the user's authentication and organization membership,
 * updates the specified card in the database, and revalidates the
 * board page cache to reflect the changes.
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

  // Destructure id and boardId separately; remaining fields are the update payload
  const { id, boardId, ...values } = data;
  let card;

  try {
    // Update the card, scoped to the authenticated organization to prevent unauthorized edits
    card = await db.card.update({
      where: {
        id,
        list: {
          board: {
            orgId, // Ensures the card belongs to the user's organization
          },
        },
      },
      data: {
        ...values, // Apply the remaining fields as the update payload
      },
    });
  } catch {
    // Return an error if the database update operation fails
    return {
      error: "Failed to update.",
    };
  }

  // Revalidate the board page to reflect the updated card details
  revalidatePath(`/board/${boardId}`);
  return { data: card };
};

/**
 * updateCard action
 *
 * A type-safe server action that validates input against the UpdateCard schema
 * before invoking the handler to perform the card update.
 */
export const updateCard = createSafeAction(UpdateCard, handler);
