"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@clerk/nextjs/server";

import { createAuditLog } from "@/lib/create-audit-log";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { ACTION, ENTITY_TYPE } from "@/lib/generated/prisma/enums";

import { CreateBoard } from "./schema";
import { InputType, ReturnType } from "./types";

/**
 * Handles the creation of a new board.
 * Creates an audit log entry for the board copy operation.
 * Validates user authentication, parses image data,
 * and persists the board to the database.
 *
 * @param {InputType} data - The input data containing the board title and image string.
 * @returns {Promise<ReturnType>} The created board data or an error message.
 */
const handler = async (data: InputType): Promise<ReturnType> => {
  // Retrieve the authenticated user's ID and organization ID
  const { userId, orgId } = await auth();

  // Return an error if the user is not authenticated or not part of an organization
  if (!userId || !orgId) {
    return {
      error: "Unauthorized",
    };
  }

  const { title, image } = data;

  // Parse the image string into its individual components
  // Expected format: "imageId|imageThumbUrl|imageFullUrl|imageLinkHTML|imageUserName"
  const [imageId, imageThumbUrl, imageFullUrl, imageLinkHTML, imageUserName] =
    image.split("|");

  // Validate that all required image fields are present
  if (
    !imageId ||
    !imageThumbUrl ||
    !imageFullUrl ||
    !imageUserName ||
    !imageLinkHTML
  ) {
    return {
      error: "Missing fields. Failed to create board.",
    };
  }

  if (
    !imageThumbUrl.startsWith("https://images.unsplash.com/") ||
    !imageFullUrl.startsWith("https://images.unsplash.com/") ||
    !imageLinkHTML.startsWith("https://unsplash.com/")
  ) {
    return {
      error: "Invalid image metadata. Failed to create board.",
    };
  }

  let board;

  // Attempt to create the board in the database
  try {
    board = await db.board.create({
      data: {
        title,
        orgId,
        imageId,
        imageThumbUrl,
        imageFullUrl,
        imageUserName,
        imageLinkHTML,
      },
    });

    // Create an audit log entry for the board copy operation.
    await createAuditLog({
      entityTitle: board.title,
      entityId: board.id,
      entityType: ENTITY_TYPE.BOARD,
      action: ACTION.CREATE,
    });
  } catch {
    return {
      error: "Failed to create.",
    };
  }

  // Revalidate the board page to reflect the newly created board
  revalidatePath(`/board/${board.id}`);
  return { data: board };
};

/**
 * A safe action wrapper around the board creation handler.
 * Validates input against the CreateBoard schema before invoking the handler.
 */
export const createBoard = createSafeAction(CreateBoard, handler);
