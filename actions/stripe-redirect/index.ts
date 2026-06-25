"use server";

import { revalidatePath } from "next/cache";

import { auth, currentUser } from "@clerk/nextjs/server";

import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

import { StripeRedirect } from "./schema";
import { ReturnType } from "./types";

/**
 * Handles Stripe payment redirection for organization subscriptions.
 *
 * - Redirects existing subscribers to the Stripe Billing Portal.
 * - Redirects new subscribers to the Stripe Checkout page.
 *
 * @returns {Promise<ReturnType>} The Stripe session URL or an error message.
 */
const handler = async (): Promise<ReturnType> => {
  const { userId, orgId } = await auth();
  const user = await currentUser();

  // Ensure the user is authenticated and associated with an organization
  if (!userId || !orgId || !user) {
    return {
      error: "Unauthorized",
    };
  }

  // URL to redirect the user after Stripe operations
  const settingsUrl = absoluteUrl(`/organization/${orgId}`);

  let url = "";

  try {
    // Check if the organization already has an active Stripe subscription
    const orgSubscription = await db.orgSubscription.findUnique({
      where: {
        orgId,
      },
    });

    if (orgSubscription && orgSubscription.stripeCustomerId) {
      // Existing subscriber: Open the Stripe Billing Portal for subscription management
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: orgSubscription.stripeCustomerId,
        return_url: settingsUrl,
      });

      url = stripeSession.url;
    } else {
      // New subscriber: Create a Stripe Checkout session for a new subscription
      const stripeSession = await stripe.checkout.sessions.create({
        success_url: settingsUrl,
        cancel_url: settingsUrl,
        payment_method_types: ["card"],
        mode: "subscription",
        billing_address_collection: "auto",
        customer_email: user.emailAddresses[0].emailAddress,
        line_items: [
          {
            price_data: {
              currency: "USD",
              product_data: {
                name: "Taskify Pro",
                description: "Unlimited boards for your organization",
              },
              unit_amount: 2000, // Amount in cents ($20.00/month)
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          orgId, // Store orgId to link the subscription to the organization
        },
      });

      url = stripeSession.url || "";
    }
  } catch {
    return {
      error: "Something went wrong!",
    };
  }

  // Revalidate the organization page to reflect subscription changes
  revalidatePath(`/organization/${orgId}`);
  return { data: url };
};

/**
 * Validates input using the StripeRedirect schema before invoking the handler.
 * @see {@link StripeRedirect} for validation schema details.
 */
export const stripeRedirect = createSafeAction(StripeRedirect, handler);
