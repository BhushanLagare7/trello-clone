/**
 * @file subscription.ts
 * @description Utility function for verifying the active subscription status
 * of an organization using Stripe subscription data stored in the database.
 */

import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";

/**
 * Represents 24 hours in milliseconds.
 * Used as a grace period buffer when validating subscription expiry.
 */
const DAY_IN_MS = 86_400_000;

/**
 * Checks whether the current organization has a valid active subscription.
 *
 * Validation requires all of the following to be true:
 * - A `stripePriceId` exists (confirms a plan is assigned)
 * - A `stripeCurrentPeriodEnd` exists (confirms billing period is tracked)
 * - The subscription expiry date + 24hr grace period is still in the future
 *
 * @async
 * @returns {Promise<boolean>}
 * - `true`  → Organization has a valid, active subscription.
 * - `false` → Organization is unauthenticated, has no subscription record,
 *             or the subscription has expired (beyond the grace period).
 *
 * @example
 * const isSubscribed = await checkSubscription();
 * if (!isSubscribed) {
 *   console.log("Please upgrade to a pro plan.");
 * }
 */
export const checkSubscription = async (): Promise<boolean> => {
  const { orgId } = await auth();

  // Return false if the user is not associated with any organization
  if (!orgId) {
    return false;
  }

  // Fetch only the subscription fields required for validation
  const orgSubscription = await db.orgSubscription.findUnique({
    where: {
      orgId,
    },
    select: {
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
      stripePriceId: true,
    },
  });

  // Return false if no subscription record is found for the organization
  if (!orgSubscription) {
    return false;
  }

  /**
   * Subscription is considered valid if:
   * 1. A Stripe price ID is present (plan is active)
   * 2. A period end date exists and has not exceeded the 24-hour grace period
   */
  const isValid =
    orgSubscription.stripePriceId &&
    orgSubscription.stripeCurrentPeriodEnd &&
    orgSubscription.stripeCurrentPeriodEnd.getTime() + DAY_IN_MS > Date.now();

  // Coerce to a boolean before returning
  return !!isValid;
};
