"use client";

import { ComponentRef, useRef, useState } from "react";

import { toast } from "sonner";

import { updateBoard } from "@/actions/update-board";
import { FormInput } from "@/components/form/form-input";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/use-action";
import { Board } from "@/lib/generated/prisma/client";

/** Props for the BoardTitleForm component */
interface BoardTitleFormProps {
  /** The board object whose title is being displayed and edited */
  data: Board;
}

/**
 * Renders the board title as an inline editable field.
 * Displays a button by default; switches to a text input on click.
 * Submits the updated title on blur or form submission.
 *
 * @param data - The board object containing the current title and id
 */
export const BoardTitleForm = ({ data }: BoardTitleFormProps) => {
  const { execute, fieldErrors } = useAction(updateBoard, {
    // On success, show a toast, sync local title state, and exit edit mode
    onSuccess: (data) => {
      toast.success(`Board "${data.title}" updated!`);
      setTitle(data.title);
      disableEditing();
    },
    // On error, display the error message via toast
    onError: (error) => {
      toast.error(error);
    },
  });

  const formRef = useRef<ComponentRef<"form">>(null);
  const inputRef = useRef<ComponentRef<"input">>(null);

  const [title, setTitle] = useState(data.title);
  const [isEditing, setIsEditing] = useState(false);

  /** Switches to edit mode and focuses/selects the input field */
  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  };

  /** Exits edit mode and returns to the button display */
  const disableEditing = () => {
    setIsEditing(false);
  };

  /**
   * Handles form submission by extracting the title and
   * dispatching the updateBoard action.
   *
   * @param formData - The submitted form data containing the new title
   */
  const onSubmit = (formData: FormData) => {
    const title = formData.get("title") as string;

    execute({
      title,
      id: data.id,
    });
  };

  /** Triggers form submission when the input loses focus */
  const onBlur = () => {
    formRef.current?.requestSubmit();
  };

  // Render inline form input when in edit mode
  if (isEditing) {
    return (
      <form
        ref={formRef}
        action={onSubmit}
        className="flex items-center gap-x-2"
      >
        <FormInput
          ref={inputRef}
          className="h-7 border-none bg-transparent px-1.75 py-1 text-lg font-bold focus-visible:ring-transparent focus-visible:outline-none"
          defaultValue={title}
          errors={fieldErrors}
          id="title"
          onBlur={onBlur}
        />
      </form>
    );
  }

  // Render board title as a clickable button when not in edit mode
  return (
    <Button
      className="size-auto p-1 px-2 text-lg font-bold"
      variant="transparent"
      onClick={enableEditing}
    >
      {title}
    </Button>
  );
};
