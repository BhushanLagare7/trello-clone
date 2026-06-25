"use client";

import Image from "next/image";

import { toast } from "sonner";

import { stripeRedirect } from "@/actions/stripe-redirect";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAction } from "@/hooks/use-action";
import { useProModal } from "@/hooks/use-pro-modal";

/**
 * ProModal Component
 *
 * Displays a promotional dialog to encourage users to upgrade to Taskify Pro.
 * Handles Stripe redirection for subscription checkout on upgrade button click.
 */
export const ProModal = () => {
  // Access the pro modal's open/close state
  const proModal = useProModal();

  // Execute the Stripe redirect action, with success and error callbacks
  const { execute, isLoading } = useAction(stripeRedirect, {
    onSuccess: (data) => {
      // Redirect to the Stripe checkout/billing portal URL on success
      window.location.href = data;
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  /** Triggers the Stripe redirect action when the upgrade button is clicked */
  const onClick = () => {
    execute({});
  };

  return (
    // Dialog visibility is controlled by the proModal state
    <Dialog open={proModal.isOpen} onOpenChange={proModal.onClose}>
      <DialogContent className="max-w-md overflow-hidden p-0">
        {/* Hero image section */}
        <div className="relative flex aspect-video items-center justify-center">
          <Image alt="Hero" className="object-cover" fill src="/hero.svg" />
        </div>

        {/* Upgrade details and call-to-action */}
        <div className="mx-auto space-y-6 p-6 text-neutral-700">
          <h2 className="text-xl font-semibold">
            Upgrade to Taskify Pro Today!
          </h2>
          <p className="text-xs font-semibold text-neutral-600">
            Explore the best of Taskify
          </p>

          {/* List of Pro features */}
          <div className="pl-3">
            <ul className="list-disc text-sm">
              <li>Unlimited boards</li>
              <li>Advanced checklists</li>
              <li>Admin and security features</li>
              <li>And more!</li>
            </ul>
          </div>

          {/* Upgrade button: disabled during Stripe redirect to prevent duplicate requests */}
          <Button
            className="w-full"
            disabled={isLoading}
            variant="primary"
            onClick={onClick}
          >
            Upgrade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
