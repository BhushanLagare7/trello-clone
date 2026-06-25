"use client";

import { ComponentRef, useRef } from "react";
import { useRouter } from "next/navigation";

import { XIcon } from "lucide-react";
import { toast } from "sonner";

import { createBoard } from "@/actions/create-board";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BOARD_LIMIT_ERROR } from "@/constants/boards";
import { useAction } from "@/hooks/use-action";
import { useProModal } from "@/hooks/use-pro-modal";

import { FormInput } from "./form-input";
import { FormPicker } from "./form-picker";
import { FormSubmit } from "./form-submit";

/** Props for the FormPopover component */
interface FormPopoverProps {
  /** The trigger element that opens the popover */
  children: React.ReactNode;
  /** The preferred side of the trigger to render the popover */
  side?: "top" | "bottom" | "left" | "right";
  /** The alignment of the popover relative to the trigger */
  align?: "start" | "center" | "end";
  /** The distance in pixels between the popover and its trigger */
  sideOffset?: number;
}

/**
 * FormPopover component that renders a popover form for creating a new board.
 * Handles form submission, displays success/error toast notifications,
 * and redirects the user to the newly created board upon success.
 *
 * @param {FormPopoverProps} props - The props for the FormPopover component.
 */
export const FormPopover = ({
  children,
  align,
  side = "bottom",
  sideOffset = 0,
}: FormPopoverProps) => {
  const router = useRouter();
  const proModal = useProModal();

  // Ref for the close button, used to programmatically close the popover on success
  const closeRef = useRef<ComponentRef<"button">>(null);

  const { execute, fieldErrors } = useAction(createBoard, {
    /** Closes the popover and redirects to the new board page on success */
    onSuccess: (data) => {
      toast.success("Board created successfully!");
      closeRef.current?.click();
      router.push(`/board/${data.id}`);
    },
    /** Displays an error toast and opens the upgrade modal only for board-limit errors */
    onError: (error) => {
      toast.error(error);
      if (error === BOARD_LIMIT_ERROR) {
        proModal.onOpen();
      }
    },
  });

  /**
   * Handles form submission by extracting the title and image values
   * from the form data and executing the createBoard action.
   *
   * @param {FormData} formData - The form data containing the board title and image.
   */
  const onSubmit = (formData: FormData) => {
    const title = formData.get("title") as string;
    const image = formData.get("image") as string;

    execute({ title, image });
  };

  return (
    <Popover>
      {/* Wraps the trigger element to open the popover on interaction */}
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align={align}
        className="w-80 pt-3"
        side={side}
        sideOffset={sideOffset}
      >
        <div className="pb-4 text-center text-sm font-medium text-neutral-600">
          Create Board
        </div>

        {/* Close button to dismiss the popover */}
        <PopoverClose ref={closeRef} asChild>
          <Button
            aria-label="Close"
            className="absolute top-2 right-2 size-auto p-2 text-neutral-600"
            variant="ghost"
          >
            <XIcon className="size-4" />
          </Button>
        </PopoverClose>

        {/* Board creation form with image picker and title input */}
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-4">
            {/* Image picker for selecting a board cover image */}
            <FormPicker errors={fieldErrors} id="image" />
            <FormInput
              errors={fieldErrors}
              id="title"
              label="Board title"
              type="text"
            />
          </div>
          <FormSubmit className="w-full">Create</FormSubmit>
        </form>
      </PopoverContent>
    </Popover>
  );
};
