import { Suspense } from "react";

import { Separator } from "@/components/ui/separator";
import { checkSubscription } from "@/lib/subscription";

import { Info } from "../_components/info";

import { ActivityList } from "./_components/activity-list";

/**
 * ActivityPage Component
 *
 * An async server component that renders the activity page for an organization.
 *
 * - Fetches and displays organization information using the `Info` component.
 * - Renders a separator line after the info section.
 * - Uses `Suspense` to show a skeleton loader (`ActivityList.Skeleton`) while
 *   the activity logs are being fetched asynchronously.
 * - Calls the `ActivityList` component to display the list of audit logs.
 */
const ActivityPage = async () => {
  // Check if the user is a pro member
  const isPro = await checkSubscription();

  return (
    <div className="w-full">
      {/* Organization information section */}
      <Info isPro={isPro} />
      <Separator className="my-2" />

      {/* Activity list with skeleton loading */}
      <Suspense fallback={<ActivityList.Skeleton />}>
        {/* Fetches and displays all audit logs for the current organization */}
        <ActivityList />
      </Suspense>
    </div>
  );
};

export default ActivityPage;
