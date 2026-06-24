"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@clerk/nextjs/server";

import { createAuditLog } from "@/lib/create-audit-log";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { ACTION, ENTITY_TYPE } from "@/lib/generated/prisma/enums";

import { CreateList } from "./schema";
import { InputType, ReturnType } from "./types";

/**
 * Handles the creation of a new list within a board.
 * Validates user authentication, verifies board ownership,
 * and appends the new list at the end of the existing list order.
 *
 * @param data - Contains the list title and target boardId
 * @returns The created list or an error message
 */
const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = await auth();

  // Ensure the user is authenticated and belongs to an organization
  if (!userId || !orgId) {
    return {
      error: "Unauthorized",
    };
  }

  const { title, boardId } = data;
  let list;

  try {
    // Verify the board exists and belongs to the user's organization
    const board = await db.board.findUnique({
      where: {
        id: boardId,
        orgId,
      },
    });

    if (!board) {
      return {
        error: "Board not found",
      };
    }

    // Determine the order for the new list by incrementing the last list's order
    const lastList = await db.list.findFirst({
      where: { boardId: boardId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const newOrder = lastList ? lastList.order + 1 : 1; // Default to 1 if no lists exist

    list = await db.list.create({
      data: {
        title,
        boardId,
        order: newOrder,
      },
    });

    // Create an audit log entry for the list copy operation.
    await createAuditLog({
      entityTitle: list.title,
      entityId: list.id,
      entityType: ENTITY_TYPE.LIST,
      action: ACTION.CREATE,
    });
  } catch {
    return {
      error: "Failed to create.",
    };
  }

  revalidatePath(`/board/${boardId}`); // Refresh board page to reflect the new list
  return { data: list };
};

/** Validates input and executes the list creation handler */
export const createList = createSafeAction(CreateList, handler);
