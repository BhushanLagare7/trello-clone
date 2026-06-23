"use client";

import { ComponentRef, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { PlusIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { useEventListener, useOnClickOutside } from "usehooks-ts";

import { createList } from "@/actions/create-list";
import { FormInput } from "@/components/form/form-input";
import { FormSubmit } from "@/components/form/form-submit";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/use-action";

import { ListWrapper } from "./list-wrapper";

/**
 * Form component for creating a new list on a board.
 * Toggles between a button and an inline form on user interaction.
 */
export const ListForm = () => {
  const router = useRouter();
  const params = useParams<{ boardId: string }>();

  const formRef = useRef<ComponentRef<"form">>(null);
  const inputRef = useRef<ComponentRef<"input">>(null);

  const [isEditing, setIsEditing] = useState(false);

  /** Activates the form and focuses the title input */
  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    });
  };

  /** Deactivates the form and returns to the button view */
  const disableEditing = () => {
    setIsEditing(false);
  };

  const { execute, fieldErrors } = useAction(createList, {
    onSuccess: (data) => {
      toast.success(`List "${data.title}" created`);
      disableEditing();
      router.refresh(); // Sync the board UI with newly created list
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  /** Closes the form when the Escape key is pressed */
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      disableEditing();
    }
  };

  // Close form on Escape key press or outside click
  useEventListener("keydown", onKeyDown);
  useOnClickOutside(
    formRef as React.RefObject<HTMLFormElement>,
    disableEditing,
  );

  /** Extracts form data and triggers the create list action */
  const onSubmit = (formData: FormData) => {
    const title = formData.get("title") as string;
    const boardId = formData.get("boardId") as string;

    execute({
      title,
      boardId,
    });
  };

  // Render the inline form when editing mode is active
  if (isEditing) {
    return (
      <ListWrapper>
        <form
          ref={formRef}
          action={onSubmit}
          className="w-full space-y-4 rounded-md bg-white p-3 shadow-md"
        >
          <FormInput
            ref={inputRef}
            className="hover:border-input focus:border-input h-7 border-transparent px-2 py-1 text-sm font-medium transition"
            errors={fieldErrors}
            id="title"
            placeholder="Enter list title..."
          />
          {/* Hidden field to associate the new list with the current board */}
          <input defaultValue={params.boardId} hidden name="boardId" />
          <div className="flex items-center gap-x-1">
            <FormSubmit>Add list</FormSubmit>
            <Button size="sm" variant="ghost" onClick={disableEditing}>
              <XIcon className="size-5" />
            </Button>
          </div>
        </form>
      </ListWrapper>
    );
  }

  // Render the trigger button when not in editing mode
  return (
    <ListWrapper>
      <button
        className="flex w-full items-center rounded-md bg-white/80 p-3 text-sm font-medium transition hover:bg-white/50"
        onClick={enableEditing}
      >
        <PlusIcon className="mr-2 size-4" />
        Add a list
      </button>
    </ListWrapper>
  );
};
