"use client";

import { useIsClient } from "usehooks-ts";

import { CardModal } from "@/components/modals/card-modal";

export const ModalProvider = () => {
  // Ensures component only renders on client to prevent hydration mismatch
  const isClient = useIsClient();

  if (!isClient) {
    return null;
  }

  return (
    <>
      <CardModal />
    </>
  );
};
