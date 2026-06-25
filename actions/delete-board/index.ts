"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@clerk/nextjs/server";

import { createAuditLog } from "@/lib/create-audit-log";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import type { Board } from "@/lib/generated/prisma/browser";
import { ACTION, ENTITY_TYPE } from "@/lib/generated/prisma/enums";

import { DeleteBoard } from "./schema";
import { InputType, ReturnType } from "./types";

/**
 * Server action handler for deleting a board.
 * Validates authentication, deletes the board from the database,
 * creates an audit log entry, and redirects the user to the organization
 * page on success.
 *
 * @param data - Validated input containing the board `id` to delete
 * @returns An error message on failure, or redirects on success
 */
const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = await auth();

  // Reject requests from unauthenticated or org-less users
  if (!userId || !orgId) {
    return {
      error: "Unauthorized",
    };
  }

  const { id } = data;

  let board: Board | undefined;

  try {
    // Run the board deletion and quota decrement in a single transaction so
    // a failure in either operation rolls back both, keeping state consistent.
    board = await db.$transaction(async (tx) => {
      const deleted = await tx.board.delete({
        where: {
          id,
          orgId,
        },
      });

      // Decrement quota only if an OrgLimit record already exists.
      // A missing record is treated as zero used boards — do not create one.
      const orgLimit = await tx.orgLimit.findUnique({ where: { orgId } });
      if (orgLimit) {
        await tx.orgLimit.update({
          where: { orgId },
          data: { count: orgLimit.count > 0 ? orgLimit.count - 1 : 0 },
        });
      }

      return deleted;
    });

    // Create an audit log entry for the board delete operation.
    await createAuditLog({
      entityTitle: board.title,
      entityId: board.id,
      entityType: ENTITY_TYPE.BOARD,
      action: ACTION.DELETE,
    });
  } catch {
    return {
      error: "Failed to delete.",
    };
  }

  // Revalidate the organization page cache to remove the deleted board
  revalidatePath(`/organization/${orgId}`);
  // Redirect user back to the organization page after successful deletion
  redirect(`/organization/${orgId}`);
};

/**
 * Type-safe server action for deleting a board.
 * Validates input against the DeleteBoard schema before invoking the handler.
 */
export const deleteBoard = createSafeAction(DeleteBoard, handler);
