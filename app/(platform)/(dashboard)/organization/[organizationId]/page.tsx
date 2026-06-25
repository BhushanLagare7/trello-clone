import { Suspense } from "react";

import { Separator } from "@/components/ui/separator";
import { checkSubscription } from "@/lib/subscription";

import { BoardList } from "./_components/board-list";
import { Info } from "./_components/info";

/**
 * Organization page that displays the organization's info and board list.
 * - Displays the organization's info and board list.
 * - Includes subscription status and board list.
 */
const OrganizationIdPage = async () => {
  // Check if the user is a pro member
  const isPro = await checkSubscription();

  return (
    <div className="mb-20 w-full">
      {/* Organization information section */}
      <Info isPro={isPro} />
      <Separator className="my-4" />
      <div className="px-2 md:px-4">
        {/* Board list with skeleton loading */}
        <Suspense fallback={<BoardList.Skeleton />}>
          {/* Fetches and displays the board list */}
          <BoardList />
        </Suspense>
      </div>
    </div>
  );
};

export default OrganizationIdPage;
