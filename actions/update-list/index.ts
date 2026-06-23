"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@clerk/nextjs/server";

import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";

import { UpdateList } from "./schema";
import { InputType, ReturnType } from "./types";

/**
 * Handles updating a list's title within a board.
 *
 * @param data - Contains the list `id`, `boardId`, and new `title`
 * @returns The updated list, or an error message
 */
const handler = async (data: InputType): Promise<ReturnType> => {
  // Verify user is authenticated and belongs to an organization
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    return {
      error: "Unauthorized",
    };
  }

  const { title, id, boardId } = data;
  let list;

  try {
    // Update the list's title, ensuring it belongs to the correct board and organization
    list = await db.list.update({
      where: {
        id,
        boardId,
        board: {
          orgId,
        },
      },
      data: {
        title,
      },
    });
  } catch {
    return {
      error: "Failed to update.",
    };
  }

  // Refresh the board page to show the updated list
  revalidatePath(`/board/${boardId}`);
  return { data: list };
};

/**
 * Safe action wrapper for updating a list.
 * Validates input against the UpdateList schema before executing the handler.
 */
export const updateList = createSafeAction(UpdateList, handler);
