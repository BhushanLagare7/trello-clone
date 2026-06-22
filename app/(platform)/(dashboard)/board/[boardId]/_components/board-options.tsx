"use client";

import { MoreHorizontalIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { deleteBoard } from "@/actions/delete-board";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAction } from "@/hooks/use-action";

/** Props for the BoardOptions component */
interface BoardOptionsProps {
  /** The unique identifier of the board to perform actions on */
  id: string;
}

/**
 * Renders a popover menu with available board actions.
 * Currently supports deleting the board.
 *
 * @param id - The unique identifier of the target board
 */
export const BoardOptions = ({ id }: BoardOptionsProps) => {
  const { execute, isLoading } = useAction(deleteBoard, {
    // Display error toast if the delete action fails
    onError: (error) => {
      toast.error(error);
    },
  });

  /** Dispatches the delete action for the current board */
  const onDelete = () => {
    execute({ id });
  };

  return (
    // Popover serves as the container for the board actions menu
    <Popover>
      {/* Trigger button — displays a horizontal dots icon */}
      <PopoverTrigger asChild>
        <Button className="h-auto w-auto p-2" variant="transparent">
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="px-0 pt-3 pb-3" side="bottom">
        {/* Popover header label */}
        <div className="pb-4 text-center text-sm font-medium text-neutral-600">
          Board actions
        </div>

        {/* Close button positioned at the top-right of the popover */}
        <PopoverClose asChild>
          <Button
            className="absolute top-2 right-2 h-auto w-auto p-2 text-neutral-600"
            variant="ghost"
          >
            <XIcon className="size-4" />
          </Button>
        </PopoverClose>

        {/* Delete action — disabled while the request is in progress */}
        <Button
          className="h-auto w-full justify-start rounded-none p-2 px-5 text-sm font-normal"
          disabled={isLoading}
          variant="ghost"
          onClick={onDelete}
        >
          Delete this board
        </Button>
      </PopoverContent>
    </Popover>
  );
};
