"use client";

import { toast } from "sonner";

import { stripeRedirect } from "@/actions/stripe-redirect";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/use-action";
import { useProModal } from "@/hooks/use-pro-modal";

interface SubscriptionButtonProps {
  isPro: boolean;
}

/**
 * SubscriptionButton Component
 *
 * A client component that renders the subscription button.
 *
 * - If `isPro` is true, it displays a "Manage subscription" button.
 *   Clicking this button calls the `stripeRedirect` action, which initiates
 *   the Stripe customer portal redirect flow for managing the subscription.
 *
 * - If `isPro` is false, it displays an "Upgrade to pro" button.
 *   Clicking this button opens the `proModal` to guide the user through
 *   the upgrade process.
 *
 * Uses `useAction` hook for handling the Stripe redirect action with
 * appropriate success and error callbacks.
 */
export const SubscriptionButton = ({ isPro }: SubscriptionButtonProps) => {
  // Get the pro modal
  const proModal = useProModal();

  // Use the useAction hook to handle the Stripe redirect action
  const { execute, isLoading } = useAction(stripeRedirect, {
    onSuccess: (data) => {
      // Redirect to the Stripe customer portal
      window.location.href = data;
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  // Handle the click event of the subscription button
  const onClick = () => {
    // If the user is a pro member, execute the stripeRedirect action
    // This will redirect the user to the Stripe customer portal to manage their subscription
    if (isPro) {
      // Execute the stripeRedirect action
      execute({});
    } else {
      // Open the pro modal to guide the user through the upgrade process
      proModal.onOpen();
    }
  };

  return (
    // Disable the button while the action is loading
    // Use the pro status to determine the button text
    <Button disabled={isLoading} variant="primary" onClick={onClick}>
      {isPro ? "Manage subscription" : "Upgrade to pro"}
    </Button>
  );
};
