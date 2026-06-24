import { auth, currentUser } from "@clerk/nextjs/server";

import { db } from "@/lib/db";

import { ACTION, ENTITY_TYPE } from "./generated/prisma/enums";

/** Props required to create an audit log entry */
interface Props {
  /** The unique identifier of the entity being acted upon */
  entityId: string;
  /** The type of entity being acted upon (e.g., CARD, BOARD, LIST) */
  entityType: ENTITY_TYPE;
  /** The human-readable title of the entity at the time of the action */
  entityTitle: string;
  /** The action performed on the entity (e.g., CREATE, UPDATE, DELETE) */
  action: ACTION;
}

/**
 * createAuditLog
 *
 * Creates an audit log entry in the database for a performed action
 * on a specific entity within the authenticated user's organization.
 *
 * Automatically resolves the current user's details (ID, name, avatar)
 * and organization ID from the active Clerk session.
 *
 * Errors are caught and logged silently to avoid disrupting
 * the calling operation.
 *
 * @param props - Details of the entity and action to log
 */
export const createAuditLog = async (props: Props) => {
  try {
    // Retrieve the current organization ID from the active session
    const { orgId } = await auth();

    // Retrieve the full user object for identity details
    const user = await currentUser();

    // Ensure both user and organization context are available
    if (!user || !orgId) {
      throw new Error("User not found!");
    }

    const { entityId, entityType, entityTitle, action } = props;

    // Persist the audit log entry with user and entity details
    await db.auditLog.create({
      data: {
        orgId,
        entityId,
        entityType,
        entityTitle,
        action,
        userId: user.id,
        userImage: user?.imageUrl,
        userName:
          [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
          "Unknown",
      },
    });
  } catch (error) {
    // Log the error without re-throwing to prevent disrupting the caller
    console.log("[AUDIT_LOG_ERROR]", error);
  }
};
