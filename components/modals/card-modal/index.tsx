"use client";

import { useQuery } from "@tanstack/react-query";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCardModal } from "@/hooks/use-card-modal";
import { fetcher } from "@/lib/fetcher";
import type { AuditLog } from "@/lib/generated/prisma/browser";
import { CardWithList } from "@/types";

import { Actions } from "./actions";
import { Activity } from "./activity";
import { Description } from "./description";
import { Header } from "./header";

/**
 * CardModal Component
 *
 * A modal dialog that displays detailed information about a card,
 * including its header, description, and available actions.
 * Fetches card data based on the current card ID from the modal state.
 */
export const CardModal = () => {
  // Retrieve card ID, modal open state, and close handler from the modal store
  const id = useCardModal((state) => state.id);
  const isOpen = useCardModal((state) => state.isOpen);
  const onClose = useCardModal((state) => state.onClose);

  // Fetch card data using React Query; only runs when the modal is open and an
  // id is available, preventing a request to /api/cards/undefined on first render.
  const { data: cardData } = useQuery<CardWithList>({
    queryKey: ["card", id],
    queryFn: () => fetcher(`/api/cards/${id}`),
    enabled: isOpen && !!id,
  });

  // Fetch audit logs for the card; only runs when the modal is open and an
  // id is available, preventing a request to /api/cards/${id}/logs on first render.
  const { data: auditLogsData } = useQuery<AuditLog[]>({
    queryKey: ["card-logs", id],
    queryFn: () => fetcher(`/api/cards/${id}/logs`),
    enabled: isOpen && !!id,
  });

  return (
    // Dialog visibility is controlled by `isOpen`; `onClose` is triggered on dismiss
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        {/* Render skeleton placeholder while card data is loading */}
        {!cardData ? <Header.Skeleton /> : <Header data={cardData} />}

        {/* Responsive grid layout: 3 columns for content, 1 for actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:gap-4">
          <div className="col-span-3">
            <div className="w-full space-y-6">
              {/* Show description skeleton while loading, otherwise render description */}
              {!cardData ? (
                <Description.Skeleton />
              ) : (
                <Description data={cardData} />
              )}
              {!auditLogsData ? (
                <Activity.Skeleton />
              ) : (
                <Activity items={auditLogsData} />
              )}
            </div>
          </div>
          {/* Show actions skeleton while loading, otherwise render action buttons */}
          {!cardData ? <Actions.Skeleton /> : <Actions data={cardData} />}
        </div>
      </DialogContent>
    </Dialog>
  );
};
