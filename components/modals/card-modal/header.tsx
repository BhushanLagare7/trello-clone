"use client";

import { ComponentRef, useRef, useState } from "react";
import { useParams } from "next/navigation";

import { useQueryClient } from "@tanstack/react-query";
import { LayoutIcon } from "lucide-react";
import { toast } from "sonner";

import { updateCard } from "@/actions/update-card";
import { FormInput } from "@/components/form/form-input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAction } from "@/hooks/use-action";
import { CardWithList } from "@/types";

/** Props for the Header component */
interface HeaderProps {
  data: CardWithList; // The card data, including its title and associated list
}

/**
 * Header Component
 *
 * Displays and allows inline editing of a card's title within a modal.
 * Automatically submits the updated title on blur and invalidates
 * relevant React Query caches upon a successful update.
 */
export const Header = ({ data }: HeaderProps) => {
  const queryClient = useQueryClient();
  const params = useParams();

  // Initialize the updateCard action with success and error handlers
  const { execute } = useAction(updateCard, {
    onSuccess: (data) => {
      // Invalidate card and card-logs queries to reflect the updated title
      queryClient.invalidateQueries({
        queryKey: ["card", data.id],
      });

      queryClient.invalidateQueries({
        queryKey: ["card-logs", data.id],
      });

      toast.success(`Renamed to "${data.title}"`);
      setTitle(data.title);
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  // Ref to programmatically trigger form submission on input blur
  const inputRef = useRef<ComponentRef<"input">>(null);

  // Local state to track the current title displayed in the input
  const [title, setTitle] = useState(data.title);

  /** Triggers form submission when the input loses focus */
  const onBlur = () => {
    inputRef.current?.form?.requestSubmit();
  };

  /**
   * Handles form submission for updating the card title.
   * Skips the update if the title hasn't changed.
   */
  const onSubmit = (formData: FormData) => {
    const title = formData.get("title") as string;
    const boardId = params.boardId as string;

    // Avoid unnecessary API calls if the title is unchanged
    if (title === data.title) {
      return;
    }

    execute({
      title,
      boardId,
      id: data.id,
    });
  };

  return (
    <div className="mb-6 flex w-full items-start gap-x-3">
      <LayoutIcon className="mt-1 size-5 text-neutral-700" />
      <div className="w-full">
        {/* Inline editable form for the card title */}
        <form action={onSubmit}>
          {/* key={title} remounts the input with the updated defaultValue whenever
              the title state changes after a successful save, keeping the visible
              field in sync with the normalized server value. */}
          <FormInput
            key={title}
            ref={inputRef}
            className="focus-visible:border-input relative -left-1.5 mb-0.5 w-[95%] truncate border-transparent bg-transparent px-1 text-xl font-semibold text-neutral-700 focus-visible:bg-white"
            defaultValue={title}
            id="title"
            onBlur={onBlur}
          />
        </form>
        {/* Display the name of the list this card belongs to */}
        <p className="text-muted-foreground text-sm">
          in list <span className="underline">{data.list.title}</span>
        </p>
      </div>
    </div>
  );
};

/**
 * HeaderSkeleton Component
 *
 * Renders a placeholder skeleton for the Header component
 * while card data is being fetched.
 */
Header.Skeleton = function HeaderSkeleton() {
  return (
    <div className="mb-6 flex items-start gap-x-3">
      {/* Icon placeholder */}
      <Skeleton className="mt-1 size-6 bg-neutral-200" />
      <div>
        {/* Title placeholder */}
        <Skeleton className="mb-1 h-6 w-24 bg-neutral-200" />
        {/* List name placeholder */}
        <Skeleton className="h-4 w-12 bg-neutral-200" />
      </div>
    </div>
  );
};
