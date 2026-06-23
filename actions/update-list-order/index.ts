"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@clerk/nextjs/server";

import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";

import { UpdateListOrder } from "./schema";
import { InputType, ReturnType } from "./types";

/**
 * Server action handler that updates the order of multiple lists within a board.
 * Executes all list order updates as a single atomic database transaction.
 *
 * @param data - Contains the boardId and an array of lists with their new order values
 * @returns The updated lists on success, or an error message on failure
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
  let lists;

  try {
    // Build an array of update operations, one per list, scoped to the org for security
    const transaction = items.map((list) =>
      db.list.update({
        where: {
          id: list.id,
          board: {
            orgId, // Prevents updating lists belonging to other organizations
          },
        },
        data: {
          order: list.order,
        },
      }),
    );

    // Execute all updates atomically to prevent partial reorders
    lists = await db.$transaction(transaction);
  } catch {
    return {
      error: "Failed to reorder.",
    };
  }

  // Invalidate the board page cache to reflect the new list order
  revalidatePath(`/board/${boardId}`);
  return { data: lists };
};

/** Validates input via UpdateListOrder schema before invoking the handler */
export const updateListOrder = createSafeAction(UpdateListOrder, handler);
