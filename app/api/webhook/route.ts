import { headers } from "next/headers";
import { NextResponse } from "next/server";

import Stripe from "stripe";

import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

/**
 * POST /api/webhook
 *
 * Handles incoming Stripe webhook events.
 * Processes the following events:
 * - `checkout.session.completed`: Creates a new organization subscription record.
 * - `invoice.payment_succeeded`: Updates the subscription's billing period and price.
 *
 * @param {Request} req - The incoming webhook request from Stripe.
 * @returns {NextResponse} 200 on success, 400 on validation or processing errors.
 */
export async function POST(req: Request): Promise<NextResponse<unknown>> {
  const body = await req.text();
  const headerList = await headers();

  // Retrieve the Stripe signature from the request headers for webhook verification
  const signature = headerList.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    // Verify the webhook signature to ensure the request is from Stripe
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return new NextResponse("Webhook error", { status: 400 });
  }

  // Extract the session object from the event payload
  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    // Retrieve the full subscription details using the session's subscription ID
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string,
    );

    // Ensure the orgId metadata is present to associate the subscription with an organization
    if (!session?.metadata?.orgId) {
      return new NextResponse("Org ID is required", { status: 400 });
    }

    // Create a new subscription record in the database for the organization
    await db.orgSubscription.create({
      data: {
        orgId: session?.metadata?.orgId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        // Convert Unix timestamp (seconds) to a JavaScript Date object (milliseconds)
        stripeCurrentPeriodEnd: new Date(
          subscription.items.data[0].current_period_end * 1000,
        ),
      },
    });
  }

  if (event.type === "invoice.payment_succeeded") {
    // Retrieve the updated subscription details after a successful payment
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string,
    );

    // Update the subscription record to reflect the new billing period and price
    await db.orgSubscription.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        stripePriceId: subscription.items.data[0].price.id,
        // Convert Unix timestamp (seconds) to a JavaScript Date object (milliseconds)
        stripeCurrentPeriodEnd: new Date(
          subscription.items.data[0].current_period_end * 1000,
        ),
      },
    });
  }

  // Acknowledge successful receipt of the webhook event
  return new NextResponse(null, { status: 200 });
}
