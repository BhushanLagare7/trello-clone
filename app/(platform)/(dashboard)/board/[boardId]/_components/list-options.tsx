"use client";

import { ComponentRef, useRef } from "react";

import { MoreHorizontalIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { copyList } from "@/actions/copy-list";
import { deleteList } from "@/actions/delete-list";
import { FormSubmit } from "@/components/form/form-submit";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useAction } from "@/hooks/use-action";
import { List } from "@/lib/generated/prisma/client";

interface ListOptionsProps {
  /** The list data containing id, title, and boardId */
  data: List;
  /** Callback to trigger the add card form */
  onAddCard: () => void;
}

/**
 * Renders a popover menu with actions for a list, including
 * adding a card, copying the list, and deleting the list.
 */
export const ListOptions = ({ data, onAddCard }: ListOptionsProps) => {
  // Ref used to programmatically close the popover after an action completes
  const closeRef = useRef<ComponentRef<"button">>(null);

  const { execute: executeDelete, isLoading: isDeleting } = useAction(
    deleteList,
    {
      onSuccess: (data) => {
        toast.success(`List "${data.title}" deleted`);
        closeRef.current?.click();
      },
      onError: (error) => {
        toast.error(error);
      },
    },
  );

  const { execute: executeCopy, isLoading: isCopying } = useAction(copyList, {
    onSuccess: (data) => {
      toast.success(`List "${data.title}" copied`);
      closeRef.current?.click();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  /** Extracts form fields and triggers the delete list action */
  const onDelete = (formData: FormData) => {
    if (isDeleting) return;
    const id = formData.get("id") as string;
    const boardId = formData.get("boardId") as string;

    executeDelete({ id, boardId });
  };

  /** Extracts form fields and triggers the copy list action */
  const onCopy = (formData: FormData) => {
    if (isCopying) return;
    const id = formData.get("id") as string;
    const boardId = formData.get("boardId") as string;

    executeCopy({ id, boardId });
  };

  return (
    <Popover>
      {/* Trigger button rendered as a ghost icon button */}
      <PopoverTrigger asChild>
        <Button className="size-auto p-2" variant="ghost">
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="px-0 pt-3 pb-3" side="bottom">
        <div className="text-center text-sm font-medium text-neutral-600">
          List actions
        </div>
        {/* Close button that dismisses the popover */}
        <PopoverClose ref={closeRef} asChild>
          <Button
            className="absolute top-2 right-2 size-auto p-2 text-neutral-600"
            variant="ghost"
          >
            <XIcon className="size-4" />
          </Button>
        </PopoverClose>
        <Button
          className="h-auto w-full justify-start rounded-none px-5 text-sm font-normal"
          variant="ghost"
          onClick={onAddCard}
        >
          Add card...
        </Button>
        {/* Hidden fields pass list id and boardId with the copy form submission */}
        <form action={onCopy}>
          <input defaultValue={data.id} hidden id="id" name="id" />
          <input
            defaultValue={data.boardId}
            hidden
            id="boardId"
            name="boardId"
          />
          <FormSubmit
            className="h-auto w-full justify-start rounded-none px-5 text-sm font-normal"
            disabled={isCopying}
            variant="ghost"
          >
            Copy list...
          </FormSubmit>
        </form>
        <Separator />
        {/* Hidden fields pass list id and boardId with the delete form submission */}
        <form action={onDelete}>
          <input defaultValue={data.id} hidden id="id" name="id" />
          <input
            defaultValue={data.boardId}
            hidden
            id="boardId"
            name="boardId"
          />
          <FormSubmit
            className="h-auto w-full justify-start rounded-none px-5 text-sm font-normal"
            disabled={isDeleting}
            variant="ghost"
          >
            Delete this list
          </FormSubmit>
        </form>
      </PopoverContent>
    </Popover>
  );
};
