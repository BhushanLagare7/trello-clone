import { HelpCircleIcon, User2Icon } from "lucide-react";

import { FormPopover } from "@/components/form/form-popover";
import { Hint } from "@/components/hint";
import { Skeleton } from "@/components/ui/skeleton";

export const BoardList = async () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center text-lg font-semibold text-neutral-700">
        <User2Icon className="mr-2 size-6" />
        Your boards
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <FormPopover side="right" sideOffset={10}>
          <div
            className="bg-muted relative flex aspect-video size-full flex-col items-center justify-center gap-y-1 rounded-sm transition hover:opacity-75"
            role="button"
          >
            <p className="text-sm"> Create new board</p>
            <span className="text-xs">5 remaining</span>
            <Hint
              description="Free Workspaces can have up to 5 open boards. For unlimited boards upgrade this workspace."
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
