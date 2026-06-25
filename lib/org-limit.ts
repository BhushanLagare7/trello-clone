/**
 * @file org-limit.ts
 * @description Utility functions for managing organization board limits.
 * Handles tracking and enforcing the maximum number of free boards
 * an organization can create.
 */

import { auth } from "@clerk/nextjs/server";

import { MAX_FREE_BOARDS } from "@/constants/boards";
import { db } from "@/lib/db";

/**
 * Increments the board count for the current organization.
 * Should be called whenever a new board is successfully created.
 *
 * - If an `orgLimit` record exists, increments the count by 1.
 * - If no `orgLimit` record exists, creates a new one with a count of 1.
 *
 * @async
 * @throws {Error} Throws an "Unauthorized" error if no organization ID is found.
 * @returns {Promise<void>}
 *
 * @example
 * await incrementAvailableCount();
 */
export const incrementAvailableCount = async (): Promise<void> => {
  const { orgId } = await auth();

  if (!orgId) {
    throw new Error("Unauthorized");
  }

  // Fetch the current organization's board limit record
  const orgLimit = await db.orgLimit.findUnique({
    where: { orgId },
  });

  if (orgLimit) {
    // Update count if record already exists
    await db.orgLimit.update({
      where: { orgId },
      data: { count: orgLimit.count + 1 },
    });
  } else {
    // Create a new record with initial count of 1
    await db.orgLimit.create({
      data: { orgId, count: 1 },
    });
  }
};

/**
 * Decrements the board count for the current organization.
 * Should be called whenever a board is successfully deleted.
 *
 * - If an `orgLimit` record exists, decrements the count by 1 (minimum of 0).
 * - If no `orgLimit` record exists, creates a new one with a count of 1.
 *
 * @async
 * @throws {Error} Throws an "Unauthorized" error if no organization ID is found.
 * @returns {Promise<void>}
 *
 * @example
 * await decreaseAvailableCount();
 */
export const decreaseAvailableCount = async (): Promise<void> => {
  const { orgId } = await auth();

  if (!orgId) {
    throw new Error("Unauthorized");
  }

  // Fetch the current organization's board limit record
  const orgLimit = await db.orgLimit.findUnique({
    where: { orgId },
  });

  if (orgLimit) {
    // Decrement the count, ensuring it does not go below 0
    await db.orgLimit.update({
      where: { orgId },
      data: { count: orgLimit.count > 0 ? orgLimit.count - 1 : 0 },
    });
  } else {
    // Create a new record with initial count of 1 if none exists
    await db.orgLimit.create({
      data: { orgId, count: 1 },
    });
  }
};

/**
 * Checks whether the current organization has available board slots.
 * Compares the organization's current board count against `MAX_FREE_BOARDS`.
 *
 * @async
 * @throws {Error} Throws an "Unauthorized" error if no organization ID is found.
 * @returns {Promise<boolean>} Returns `true` if the organization can create
 * more boards, `false` if the limit has been reached.
 *
 * @example
 * const canCreate = await hasAvailableCount();
 * if (!canCreate) {
 *   console.log("Board limit reached!");
 * }
 */
export const hasAvailableCount = async (): Promise<boolean> => {
  const { orgId } = await auth();

  if (!orgId) {
    throw new Error("Unauthorized");
  }

  // Fetch the current organization's board limit record
  const orgLimit = await db.orgLimit.findUnique({
    where: { orgId },
  });

  // Allow creation if no record exists or count is below the maximum limit
  if (!orgLimit || orgLimit.count < MAX_FREE_BOARDS) {
    return true;
  } else {
    return false;
  }
};

/**
 * Retrieves the current board count for the authenticated organization.
 * Unlike other functions, this does NOT throw an error for unauthenticated
 * users and instead returns 0 as a safe default.
 *
 * @async
 * @returns {Promise<number>} The current number of boards created by the
 * organization, or `0` if the organization is not found or has no record.
 *
 * @example
 * const count = await getAvailableCount();
 * console.log(`Boards used: ${count}/${MAX_FREE_BOARDS}`);
 */
export const getAvailableCount = async (): Promise<number> => {
  const { orgId } = await auth();

  // Return 0 as default if user is not part of an organization
  if (!orgId) {
    return 0;
  }

  // Fetch the current organization's board limit record
  const orgLimit = await db.orgLimit.findUnique({
    where: { orgId },
  });

  // Return 0 if no limit record exists for the organization
  if (!orgLimit) {
    return 0;
  }

  return orgLimit.count;
};
