import Stripe from "stripe";

const stripeApiKey = process.env.STRIPE_API_KEY;
if (!stripeApiKey) throw new Error("STRIPE_API_KEY is not set");

// Initialize Stripe client
export const stripe = new Stripe(stripeApiKey, {
  apiVersion: "2026-05-27.dahlia",
  typescript: true,
});
