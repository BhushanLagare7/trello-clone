"use client";

import { useParams } from "next/navigation";

import { CopyIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";

import { copyCard } from "@/actions/copy-card";
import { deleteCard } from "@/actions/delete-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAction } from "@/hooks/use-action";
import { useCardModal } from "@/hooks/use-card-modal";
import { CardWithList } from "@/types";

/** Props for the Actions component */
interface ActionsProps {
  data: CardWithList; // The card data, used to identify the card for copy/delete operations
}

/**
 * Actions Component
 *
 * Provides action buttons (Copy and Delete) for a card within the modal.
 * Each action triggers its respective server action, displays a toast
 * notification on completion, and closes the modal on success.
 */
export const Actions = ({ data }: ActionsProps) => {
  const { boardId } = useParams<{ boardId: string }>();
  const cardModal = useCardModal();

  // Initialize the copyCard action with success/error handlers and loading state
  const { execute: executeCopyCard, isLoading: isLoadingCopy } = useAction(
    copyCard,
    {
      onSuccess: (data) => {
        toast.success(`Card "${data.title}" copied`);
        cardModal.onClose();
      },
      onError: (error) => {
        toast.error(error);
      },
    },
  );

  // Initialize the deleteCard action with success/error handlers and loading state
  const { execute: executeDeleteCard, isLoading: isLoadingDelete } = useAction(
    deleteCard,
    {
      onSuccess: (data) => {
        toast.success(`Card "${data.title}" deleted`);
        cardModal.onClose();
      },
      onError: (error) => {
        toast.error(error);
      },
    },
  );

  /** Executes the copy action for the current card */
  const onCopy = () => {
    executeCopyCard({
      id: data.id,
      boardId,
    });
  };

  /** Executes the delete action for the current card */
  const onDelete = () => {
    executeDeleteCard({
      id: data.id,
      boardId,
    });
  };

  return (
    <div className="mt-2 space-y-2">
      <p className="text-xs font-semibold">Actions</p>
      {/* Copy button: disabled while the copy action is in progress */}
      <Button
        className="w-full justify-start"
        disabled={isLoadingCopy}
        size="inline"
        variant="gray"
        onClick={onCopy}
      >
        <CopyIcon className="mr-2 size-4" />
        Copy
      </Button>
      {/* Delete button: disabled while the delete action is in progress */}
      <Button
        className="w-full justify-start"
        disabled={isLoadingDelete}
        size="inline"
        variant="gray"
        onClick={onDelete}
      >
        <TrashIcon className="mr-2 size-4" />
        Delete
      </Button>
    </div>
  );
};

/**
 * ActionsSkeleton Component
 *
 * Renders a placeholder skeleton for the Actions component
 * while card data is being fetched.
 */
Actions.Skeleton = function ActionsSkeleton() {
  return (
    <div className="mt-2 space-y-2">
      {/* "Actions" label placeholder */}
      <Skeleton className="h-4 w-20 bg-neutral-200" />
      {/* Copy button placeholder */}
      <Skeleton className="h-8 w-full bg-neutral-200" />
      {/* Delete button placeholder */}
      <Skeleton className="h-8 w-full bg-neutral-200" />
    </div>
  );
};
