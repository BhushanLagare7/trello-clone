"use client";

import { ComponentRef, useRef, useState } from "react";

import { toast } from "sonner";
import { useEventListener } from "usehooks-ts";

import { updateList } from "@/actions/update-list";
import { FormInput } from "@/components/form/form-input";
import { useAction } from "@/hooks/use-action";
import { List } from "@/lib/generated/prisma/client";

import { ListOptions } from "./list-options";

interface ListHeaderProps {
  /** The list data containing id, title, and boardId */
  data: List;
  /** Callback to trigger the add card form */
  onAddCard: () => void;
}

/**
 * Renders the header of a list, including an editable title and list options.
 * Clicking the title switches to an inline edit mode, while submitting or
 * blurring the input saves the changes.
 */
export const ListHeader = ({ data, onAddCard }: ListHeaderProps) => {
  const [title, setTitle] = useState(data.title);
  const [isEditing, setIsEditing] = useState(false);

  const formRef = useRef<ComponentRef<"form">>(null);
  const inputRef = useRef<ComponentRef<"input">>(null);

  /** Enables edit mode and focuses the title input */
  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  };

  const disableEditing = () => {
    setIsEditing(false);
  };

  const { execute } = useAction(updateList, {
    onSuccess: (data) => {
      toast.success(`Renamed to "${data.title}"`);
      setTitle(data.title);
      disableEditing();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  /**
   * Handles form submission by extracting form fields and triggering
   * the update action. Skips the update if the title hasn't changed.
   */
  const handleSubmit = (formData: FormData) => {
    const title = formData.get("title") as string;
    const id = formData.get("id") as string;
    const boardId = formData.get("boardId") as string;

    // No-op if the title is unchanged
    if (title === data.title) {
      return disableEditing();
    }

    execute({
      title,
      id,
      boardId,
    });
  };

  /** Submits the form when the input loses focus */
  const onBlur = () => {
    formRef.current?.requestSubmit();
  };

  /** Submits the form when the Escape key is pressed */
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      formRef.current?.requestSubmit();
    }
  };

  // Attach global keydown listener to handle Escape key submission
  useEventListener("keydown", onKeyDown);

  return (
    <div className="flex items-start justify-between gap-x-2 px-2 pt-2 text-sm font-semibold">
      {/* Toggle between editable form and static title display */}
      {isEditing ? (
        <form ref={formRef} action={handleSubmit} className="flex-1 px-0.5">
          {/* Hidden fields to pass list id and boardId with the form submission */}
          <input hidden id="id" name="id" readOnly value={data.id} />
          <input
            hidden
            id="boardId"
            name="boardId"
            readOnly
            value={data.boardId}
          />
          <FormInput
            ref={inputRef}
            className="hover:border-input focus:border-input h-7 truncate border-transparent bg-transparent px-1.75 py-1 text-sm font-medium transition focus:bg-white"
            defaultValue={title}
            id="title"
            placeholder="Enter list title.."
            onBlur={onBlur}
          />
          <button hidden type="submit" />
        </form>
      ) : (
        // Clicking the title div enables edit mode
        <div
          className="h-7 w-full border-transparent px-2.5 py-1 text-sm font-medium"
          onClick={enableEditing}
        >
          {title}
        </div>
      )}
      <ListOptions data={data} onAddCard={onAddCard} />
    </div>
  );
};
