"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@clerk/nextjs/server";

import { BOARD_LIMIT_ERROR, MAX_FREE_BOARDS } from "@/constants/boards";
import { createAuditLog } from "@/lib/create-audit-log";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { ACTION, ENTITY_TYPE } from "@/lib/generated/prisma/enums";
import { checkSubscription } from "@/lib/subscription";

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

  const isPro = await checkSubscription();

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

  // Attempt to create the board in the database.
  // The quota check, board insert, and count increment are wrapped in a single
  // transaction so they either all succeed or all roll back together.
  try {
    board = await db.$transaction(async (tx) => {
      // Re-check the free-tier quota inside the transaction to close the
      // TOCTOU window between the limit check and the actual insert.
      if (!isPro) {
        const orgLimit = await tx.orgLimit.findUnique({ where: { orgId } });
        if (orgLimit && orgLimit.count >= MAX_FREE_BOARDS) {
          throw new Error(BOARD_LIMIT_ERROR);
        }
      }

      const newBoard = await tx.board.create({
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

      // Always track board count for all orgs (pro and free) so quota
      // figures are consistent regardless of subscription status.
      const orgLimit = await tx.orgLimit.findUnique({ where: { orgId } });
      if (orgLimit) {
        await tx.orgLimit.update({
          where: { orgId },
          data: { count: orgLimit.count + 1 },
        });
      } else {
        await tx.orgLimit.create({ data: { orgId, count: 1 } });
      }

      return newBoard;
    });
  } catch (err) {
    // Surface the board-limit error with its original message so the client
    // can distinguish it from generic failures.
    if (err instanceof Error && err.message === BOARD_LIMIT_ERROR) {
      return { error: BOARD_LIMIT_ERROR };
    }
    return {
      error: "Failed to create.",
    };
  }

  // Create an audit log entry for the board copy operation.
  await createAuditLog({
    entityTitle: board.title,
    entityId: board.id,
    entityType: ENTITY_TYPE.BOARD,
    action: ACTION.CREATE,
  });

  // Revalidate the board page to reflect the newly created board
  revalidatePath(`/board/${board.id}`);
  return { data: board };
};

/**
 * A safe action wrapper around the board creation handler.
 * Validates input against the CreateBoard schema before invoking the handler.
 */
export const createBoard = createSafeAction(CreateBoard, handler);
