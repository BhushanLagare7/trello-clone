"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@clerk/nextjs/server";

import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";

import { UpdateBoard } from "./schema";
import { InputType, ReturnType } from "./types";

/**
 * Server action handler for updating a board's title.
 * Validates authentication, updates the board in the database,
 * and revalidates the board's cached page on success.
 *
 * @param data - Validated input containing the board `id` and new `title`
 * @returns The updated board on success, or an error message on failure
 */
const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = await auth();

  // Reject requests from unauthenticated or org-less users
  if (!userId || !orgId) {
    return {
      error: "Unauthorized",
    };
  }

  const { title, id } = data;
  let board;

  try {
    // Update the board title, scoped to the current org for security
    board = await db.board.update({
      where: {
        id,
        orgId,
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

  // Revalidate the board page cache to reflect the updated title
  revalidatePath(`/board/${id}`);
  return { data: board };
};

/**
 * Type-safe server action for updating a board.
 * Validates input against the UpdateBoard schema before invoking the handler.
 */
export const updateBoard = createSafeAction(UpdateBoard, handler);
