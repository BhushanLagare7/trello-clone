"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@clerk/nextjs/server";

import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";

import { CopyList } from "./schema";
import { InputType, ReturnType } from "./types";

/**
 * Handles copying a list and all its cards within a board.
 * The copied list is appended to the end of the board with " - Copy" suffix.
 *
 * @param data - Contains the list `id` and `boardId` to identify the list to copy
 * @returns The newly created list with its cards, or an error message
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
    // Fetch the list to copy, ensuring it belongs to the correct board and organization
    const listToCopy = await db.list.findUnique({
      where: {
        id,
        boardId,
        board: {
          orgId,
        },
      },
      include: {
        cards: true, // Include all associated cards
      },
    });

    if (!listToCopy) {
      return { error: "List not found" };
    }

    // Get the last list's order value to determine the new list's position
    const lastList = await db.list.findFirst({
      where: { boardId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    // Place the new list after the last existing list, or set as first if none exist
    const newOrder = lastList ? lastList.order + 1 : 1;

    // Create the new list as a copy, including duplicates of all cards
    list = await db.list.create({
      data: {
        boardId: listToCopy.boardId,
        title: `${listToCopy.title} - Copy`,
        order: newOrder,
        cards: {
          createMany: {
            data: listToCopy.cards.map((card) => ({
              title: card.title,
              description: card.description,
              order: card.order,
            })),
          },
        },
      },
      include: {
        cards: true,
      },
    });
  } catch {
    return {
      error: "Failed to copy.",
    };
  }

  // Refresh the board page to reflect the newly copied list
  revalidatePath(`/board/${boardId}`);
  return { data: list };
};

/**
 * Safe action wrapper for copying a list.
 * Validates input against the CopyList schema before executing the handler.
 */
export const copyList = createSafeAction(CopyList, handler);
