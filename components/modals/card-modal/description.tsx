"use client";

import { ComponentRef, RefObject, useRef, useState } from "react";
import { useParams } from "next/navigation";

import { useQueryClient } from "@tanstack/react-query";
import { AlignLeftIcon } from "lucide-react";
import { toast } from "sonner";
import { useEventListener, useOnClickOutside } from "usehooks-ts";

import { updateCard } from "@/actions/update-card";
import { FormSubmit } from "@/components/form/form-submit";
import { FormTextarea } from "@/components/form/form-textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAction } from "@/hooks/use-action";
import { CardWithList } from "@/types";

/** Props for the Description component */
interface DescriptionProps {
  data: CardWithList; // The card data, including its description and associated list
}

/**
 * Description Component
 *
 * Displays a card's description with inline editing capability.
 * Clicking the description area enables editing via a textarea form.
 * The form can be dismissed by pressing Escape, clicking outside,
 * or submitting, which updates the card and invalidates relevant caches.
 */
export const Description = ({ data }: DescriptionProps) => {
  const params = useParams();
  const queryClient = useQueryClient();

  // Tracks whether the description is currently in edit mode
  const [isEditing, setIsEditing] = useState(false);

  // Refs for detecting outside clicks and focusing the textarea on edit enable
  const formRef = useRef<ComponentRef<"form">>(null);
  const textareaRef = useRef<ComponentRef<"textarea">>(null);

  /** Enables edit mode and focuses the textarea */
  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    });
  };

  /** Disables edit mode and hides the form */
  const disableEditing = () => {
    setIsEditing(false);
  };

  /** Disables editing when the Escape key is pressed */
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      disableEditing();
    }
  };

  // Attach global keydown listener and outside click handler for dismissing the form
  useEventListener("keydown", onKeyDown);
  useOnClickOutside(formRef as RefObject<HTMLFormElement>, disableEditing);

  // Initialize the updateCard action with success and error handlers
  const { execute, fieldErrors } = useAction(updateCard, {
    onSuccess: (data) => {
      // Invalidate card and card-logs queries to reflect the updated description
      queryClient.invalidateQueries({
        queryKey: ["card", data.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["card-logs", data.id],
      });
      toast.success(`Card "${data.title}" updated`);
      disableEditing();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  /**
   * Handles form submission for updating the card description.
   * Extracts description and boardId from form data before executing the update.
   */
  const onSubmit = (formData: FormData) => {
    const description = formData.get("description") as string;
    const boardId = params.boardId as string;

    execute({
      id: data.id,
      description,
      boardId,
    });
  };

  return (
    <div className="flex w-full items-start gap-x-3">
      <AlignLeftIcon className="mt-0.5 size-5 text-neutral-700" />
      <div className="w-full">
        <p className="mb-2 font-semibold text-neutral-700">Description</p>
        {isEditing ? (
          /* Edit mode: renders the textarea form with Save and Cancel actions */
          <form ref={formRef} action={onSubmit} className="space-y-2">
            <FormTextarea
              ref={textareaRef}
              className="mt-2 w-full"
              defaultValue={data.description ?? undefined}
              errors={fieldErrors}
              id="description"
              placeholder="Add a more detailed description"
            />
            <div className="flex items-center gap-x-2">
              <FormSubmit>Save</FormSubmit>
              <Button
                size="sm"
                type="button"
                variant="ghost"
                onClick={disableEditing}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          /* View mode: clicking or keyboard-activating this element switches to edit mode */
          <div
            className="min-h-19.5 rounded-md bg-neutral-200 px-3.5 py-3 text-sm font-medium"
            role="button"
            tabIndex={0}
            onClick={enableEditing}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                enableEditing();
              }
            }}
          >
            {/* Display existing description or a placeholder prompt */}
            {data.description ?? "Add a more detailed description..."}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * DescriptionSkeleton Component
 *
 * Renders a placeholder skeleton for the Description component
 * while card data is being fetched.
 */
Description.Skeleton = function DescriptionSkeleton() {
  return (
    <div className="flex w-full items-start gap-x-3">
      {/* Icon placeholder */}
      <Skeleton className="size-6 bg-neutral-200" />
      <div className="w-full">
        {/* Title placeholder */}
        <Skeleton className="mb-2 h-6 w-24 bg-neutral-200" />
        {/* Description content placeholder */}
        <Skeleton className="h-19.5 w-full bg-neutral-200" />
      </div>
    </div>
  );
};
