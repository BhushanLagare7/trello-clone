import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@clerk/nextjs/server";
import { HelpCircleIcon, User2Icon } from "lucide-react";

import { FormPopover } from "@/components/form/form-popover";
import { Hint } from "@/components/hint";
import { Skeleton } from "@/components/ui/skeleton";
import { MAX_FREE_BOARDS } from "@/constants/boards";
import { db } from "@/lib/db";
import { getAvailableCount } from "@/lib/org-limit";
import { checkSubscription } from "@/lib/subscription";

/**
 * BoardList Component
 *
 * An async server component that displays a grid of boards belonging to the
 * currently authenticated user's organization.
 *
 * @remarks
 * - Redirects unauthenticated users (or users without an active org) to "/select-org"
 * - Boards are fetched from the database and sorted by creation date (newest first)
 * - Includes a "Create new board" button with a board limit hint for free workspaces
 *
 * @returns A responsive grid of board links and a create board button
 */
export const BoardList = async () => {
  const { orgId } = await auth();

  // Redirect to org selection if no active organization is found
  if (!orgId) {
    return redirect("/select-org");
  }

  // Fetch all boards for the current organization, ordered by newest first
  const boards = await db.board.findMany({
    where: {
      orgId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calculate the number of available board slots based on the user's organization limit
  const availableCount = await getAvailableCount();
  // Check if the user is subscribed to a pro plan
  const isPro = await checkSubscription();

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center text-lg font-semibold text-neutral-700">
        <User2Icon className="mr-2 size-6" />
        Your boards
      </div>

      {/* Responsive board grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {/* Render each board as a clickable card with a thumbnail background */}
        {boards.map((board) => (
          <Link
            key={board.id}
            className="group relative aspect-video size-full overflow-hidden rounded-sm bg-sky-700 bg-cover bg-center bg-no-repeat p-2"
            href={`/board/${board.id}`}
            style={{ backgroundImage: `url(${board.imageThumbUrl})` }}
          >
            {/* Overlay that darkens on hover for better visual feedback */}
            <div className="absolute inset-0 bg-black/30 transition group-hover:bg-black/40" />
            <p className="relative font-semibold text-white">{board.title}</p>
          </Link>
        ))}

        {/* Create new board button with a popover form */}
        <FormPopover side="right" sideOffset={10}>
          <div
            className="bg-muted relative flex aspect-video size-full flex-col items-center justify-center gap-y-1 rounded-sm transition hover:opacity-75"
            role="button"
          >
            <p className="text-sm">Create new board</p>
            {/* Display the number of available board slots or "Unlimited" for pro users */}
            <span className="text-xs">
              {isPro
                ? "Unlimited"
                : `${MAX_FREE_BOARDS - availableCount} remaining`}
            </span>
            {/* Tooltip explaining the board limit for free workspaces */}
            <Hint
              description={
                isPro
                  ? "You have unlimited board slots for your Pro workspace."
                  : "Free Workspaces can have up to 5 open boards. For unlimited boards upgrade this workspace."
              }
              sideOffset={40}
            >
              <HelpCircleIcon className="absolute right-2 bottom-2 size-3.5" />
            </Hint>
          </div>
        </FormPopover>
      </div>
    </div>
  );
};

/**
 * BoardList.Skeleton
 *
 * A placeholder skeleton component rendered while the BoardList is loading.
 * Displays a matching grid of skeleton elements to prevent layout shift
 * and improve perceived performance.
 *
 * @example
 * // Usage with React Suspense
 * <Suspense fallback={<BoardList.Skeleton />}>
 *   <BoardList />
 * </Suspense>
 */
BoardList.Skeleton = function SkeletonBoardList() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      <Skeleton className="aspect-video size-full p-2" />
      <Skeleton className="aspect-video size-full p-2" />
      <Skeleton className="aspect-video size-full p-2" />
      <Skeleton className="aspect-video size-full p-2" />
      <Skeleton className="aspect-video size-full p-2" />
      <Skeleton className="aspect-video size-full p-2" />
      <Skeleton className="aspect-video size-full p-2" />
      <Skeleton className="aspect-video size-full p-2" />
    </div>
  );
};
