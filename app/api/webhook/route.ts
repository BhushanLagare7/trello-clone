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
 * - `checkout.session.completed`: Upserts a new organization subscription record.
 * - `invoice.payment_succeeded`: Updates the subscription's billing period and price.
 *
 * Both handlers are idempotent: safe to retry and tolerant of out-of-order delivery.
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

    // Upsert the subscription record so retried or duplicate deliveries are safe.
    // Keyed on orgId (the business identifier) to handle the case where the row
    // was already written by a previous delivery of the same event.
    await db.orgSubscription.upsert({
      where: { orgId: session.metadata.orgId },
      create: {
        orgId: session.metadata.orgId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        // Convert Unix timestamp (seconds) to a JavaScript Date object (milliseconds)
        stripeCurrentPeriodEnd: new Date(
          subscription.items.data[0].current_period_end * 1000,
        ),
      },
      update: {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
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

    // updateMany is idempotent: it updates matching rows and returns { count: 0 }
    // instead of throwing when the subscription record does not exist yet
    // (e.g. an invoice event delivered before the checkout.session.completed event).
    await db.orgSubscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
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
