"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

import { useOrganizationList } from "@clerk/nextjs";

/**
 * Synchronizes the active Clerk organization with the `organizationId` URL parameter.
 * Renders nothing — used purely for its side effect.
 */
export const OrgControl = (): null => {
  const params = useParams<{ organizationId: string }>();
  const { setActive } = useOrganizationList();

  // Update the active organization whenever the URL parameter changes
  useEffect(() => {
    if (!setActive || !params.organizationId) return;

    setActive({ organization: params.organizationId });
  }, [params.organizationId, setActive]);

  return null;
};
