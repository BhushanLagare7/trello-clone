"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@clerk/nextjs/server";

import { createAuditLog } from "@/lib/create-audit-log";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { ACTION, ENTITY_TYPE } from "@/lib/generated/prisma/enums";

import { DeleteList } from "./schema";
import { InputType, ReturnType } from "./types";

/**
 * Handles deleting a list and all its cards within a board and
 * creates an audit log entry.
 *
 * @param data - Contains the list `id` and `boardId` to identify the list to delete
 * @returns The deleted list, or an error message
 */
const handler = async (data: InputType): Promise<ReturnType> => {
  // Verify user is authenticated and belongs to an organization
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    return {
      error: "Unauthorized",
    };
  }

  const { id, boardId } = data;
  let list;

  try {
    // Delete the list, ensuring it belongs to the correct board and organization
    list = await db.list.delete({
      where: {
        id,
        boardId,
        board: {
          orgId,
        },
      },
    });

    // Create an audit log entry for the list delete operation.
    await createAuditLog({
      entityTitle: list.title,
      entityId: list.id,
      entityType: ENTITY_TYPE.LIST,
      action: ACTION.DELETE,
    });
  } catch {
    return {
      error: "Failed to delete.",
    };
  }

  // Refresh the board page to remove the deleted list
  revalidatePath(`/board/${boardId}`);
  return { data: list };
};

/**
 * Safe action wrapper for deleting a list.
 * Validates input against the DeleteList schema before executing the handler.
 */
export const deleteList = createSafeAction(DeleteList, handler);
