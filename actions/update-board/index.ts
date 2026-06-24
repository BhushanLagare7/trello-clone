"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@clerk/nextjs/server";

import { createAuditLog } from "@/lib/create-audit-log";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { ACTION, ENTITY_TYPE } from "@/lib/generated/prisma/enums";

import { UpdateBoard } from "./schema";
import { InputType, ReturnType } from "./types";

/**
 * Server action handler for updating a board's title.
 * Validates authentication, updates the board in the database,
 * creates an audit log entry, and revalidates the board's cached page
 * on success.
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

  const id = data.id;
  const title = data.title.trim();
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

    // Create an audit log entry for the board update operation.
    await createAuditLog({
      entityTitle: board.title,
      entityId: board.id,
      entityType: ENTITY_TYPE.BOARD,
      action: ACTION.UPDATE,
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
