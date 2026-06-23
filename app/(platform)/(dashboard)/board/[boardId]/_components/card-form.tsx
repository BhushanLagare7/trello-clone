"use client";

import { ComponentRef, forwardRef, KeyboardEventHandler, useRef } from "react";
import { useParams } from "next/navigation";

import { PlusIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { useEventListener, useOnClickOutside } from "usehooks-ts";

import { createCard } from "@/actions/create-card";
import { FormSubmit } from "@/components/form/form-submit";
import { FormTextarea } from "@/components/form/form-textarea";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/use-action";

/** Props for the CardForm component */
interface CardFormProps {
  /** ID of the list where the new card will be created */
  listId: string;
  /** Callback to switch the form into editing/visible mode */
  enableEditing: () => void;
  /** Callback to exit editing mode and hide the form */
  disableEditing: () => void;
  /** Controls whether the card creation form or the "Add a card" button is shown */
  isEditing: boolean;
}

/**
 * A form component for creating new cards within a list.
 * Renders as a simple "Add a card" button by default, switching to a
 * textarea form when editing is enabled.
 *
 * - Submits on Enter key (without Shift) or via the submit button
 * - Cancels editing on Escape key or clicking outside the form
 *
 * @example
 * <CardForm
 *   listId="list-123"
 *   isEditing={isEditing}
 *   enableEditing={enableEditing}
 *   disableEditing={disableEditing}
 * />
 */
export const CardForm = forwardRef<HTMLTextAreaElement, CardFormProps>(
  ({ listId, enableEditing, disableEditing, isEditing }, ref) => {
    const params = useParams();
    const formRef = useRef<ComponentRef<"form">>(null);

    const { execute, fieldErrors } = useAction(createCard, {
      onSuccess: (data) => {
        toast.success(`Card "${data.title}" created`);
        formRef.current?.reset(); // Clear form fields after successful submission
      },
      onError: (error) => {
        toast.error(error);
      },
    });

    /** Exits editing mode when the Escape key is pressed */
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        disableEditing();
      }
    };

    // Close the form when clicking outside of it
    useOnClickOutside(
      formRef as React.RefObject<HTMLFormElement>,
      disableEditing,
    );
    useEventListener("keydown", onKeyDown);

    /** Submits the form on Enter key press, unless Shift is held (for new lines) */
    const onTextareakeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (
      e,
    ) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };

    /** Extracts form data and triggers the create card action */
    const onSubmit = (formData: FormData) => {
      const title = formData.get("title") as string;
      const listId = formData.get("listId") as string;
      const boardId = params.boardId as string;

      execute({ title, listId, boardId });
    };

    // Editing state: show the card creation form
    if (isEditing) {
      return (
        <form
          ref={formRef}
          action={onSubmit}
          className="m-1 space-y-4 px-1 py-0.5"
        >
          <FormTextarea
            ref={ref}
            errors={fieldErrors}
            id="title"
            placeholder="Enter a title for this card..."
            onKeyDown={onTextareakeyDown}
          />
          {/* Hidden field to associate the card with its parent list */}
          <input defaultValue={listId} hidden id="listId" name="listId" />
          <div className="flex items-center gap-x-1">
            <FormSubmit>Add card</FormSubmit>
            <Button size="sm" variant="ghost" onClick={disableEditing}>
              <XIcon className="size-5" />
            </Button>
          </div>
        </form>
      );
    }

    // Default state: show the "Add a card" trigger button
    return (
      <div className="px-2 pt-2">
        <Button
          className="text-muted-foreground h-auto w-full justify-start px-2 py-1.5 text-sm"
          size="sm"
          variant="ghost"
          onClick={enableEditing}
        >
          <PlusIcon className="mr-2 size-4" />
          Add a card
        </Button>
      </div>
    );
  },
);

CardForm.displayName = "CardForm";
