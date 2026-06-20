"use client";

import Link from "next/link";

import { useOrganization, useOrganizationList } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import { useLocalStorage } from "usehooks-ts";

import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { NavItem, Organization } from "./nav-item";

interface SidebarProps {
  /** Local storage key used to persist expanded accordion state */
  storageKey?: string;
}

/**
 * Sidebar component displaying user's workspaces (organizations).
 *
 * - Fetches active organization and memberships via Clerk
 * - Persists accordion expansion state in localStorage
 * - Shows loading skeleton while data is being fetched
 */
export const Sidebar = ({ storageKey = "t-sidebar-state" }: SidebarProps) => {
  // Persist expanded organization state in localStorage
  const [expanded, setExpanded] = useLocalStorage<Record<string, boolean>>(
    storageKey,
    {},
  );

  // Active organization
  const { organization: activeOrganization, isLoaded: isLoadedOrg } =
    useOrganization();

  // List of user's organization memberships
  const { userMemberships, isLoaded: isLoadedOrgList } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  // Compute default expanded accordion items from stored state
  const defaultAccordionValue: string[] = Object.keys(expanded).reduce(
    (acc: string[], key: string) => {
      if (expanded[key]) acc.push(key);
      return acc;
    },
    [],
  );

  // Toggle expansion state for a given organization
  const onExpand = (id: string) => {
    setExpanded((curr) => ({
      ...curr,
      [id]: !curr[id],
    }));
  };

  // Show skeleton while organizations are loading
  if (!isLoadedOrg || !isLoadedOrgList || userMemberships.isLoading) {
    return (
      <>
        <div className="mb-2 flex items-center justify-between">
          <Skeleton className="h-10 w-[50%]" />
          <Skeleton className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <NavItem.Skeleton />
          <NavItem.Skeleton />
          <NavItem.Skeleton />
        </div>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-1 flex items-center text-xs font-medium">
        <span className="pl-4">Workspaces</span>

        {/* Create / Select organization button */}
        <Button
          asChild
          className="ml-auto"
          size="icon"
          type="button"
          variant="ghost"
        >
          <Link href="/select-org">
            <Plus className="size-4" />
          </Link>
        </Button>
      </div>

      {/* Organization list */}
      <Accordion
        className="space-y-2"
        defaultValue={defaultAccordionValue}
        type="multiple"
      >
        {userMemberships.data.map(({ organization }) => {
          if (
            !organization.id ||
            !organization.slug ||
            !organization.imageUrl ||
            !organization.name
          ) {
            return null;
          }

          return (
            <NavItem
              key={organization.id}
              isActive={activeOrganization?.id === organization.id}
              isExpanded={expanded[organization.id]}
              organization={organization as Organization}
              onExpand={onExpand}
            />
          );
        })}
      </Accordion>
    </>
  );
};
