import { Separator } from "@/components/ui/separator";
import { checkSubscription } from "@/lib/subscription";

import { Info } from "../_components/info";

import { SubscriptionButton } from "./_components/subscription-button";

/**
 * BillingPage Component
 *
 * An async server component that renders the billing page for an organization.
 *
 * - Fetches and displays organization information using the `Info` component.
 * - Renders a separator line after the info section.
 * - Calls the `SubscriptionButton` component to display the subscription button,
 *   passing the `isPro` value to determine whether to show the upgrade or
 *   manage subscription UI.
 */
const BillingPage = async () => {
  // Check if the user is a pro member
  const isPro = await checkSubscription();

  return (
    <div className="w-full">
      {/* Organization information section */}
      <Info isPro={isPro} />
      <Separator className="my-2" />

      {/* Subscription button */}
      <SubscriptionButton isPro={isPro} />
    </div>
  );
};

export default BillingPage;
