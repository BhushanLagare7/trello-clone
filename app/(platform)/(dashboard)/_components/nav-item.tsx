"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import {
  ActivityIcon,
  CreditCardIcon,
  LayoutIcon,
  SettingsIcon,
} from "lucide-react";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Represents a Clerk organization with display metadata */
export type Organization = {
  id: string;
  slug: string;
  imageUrl: string;
  name: string;
};

interface NavItemProps {
  /** Whether the accordion item is currently expanded */
  isExpanded: boolean;
  /** Whether this organization is the currently active one */
  isActive: boolean;
  /** Organization data to display */
  organization: Organization;
  /** Callback to toggle accordion expansion */
  onExpand: (id: string) => void;
}

/**
 * Sidebar navigation item for a single organization.
 *
 * - Renders as an accordion with the org name/image as the trigger
 * - Expands to reveal sub-routes: Boards, Activity, Settings, Billing
 * - Highlights the active organization and current route
 */
export const NavItem = ({
  isExpanded,
  isActive,
  organization,
  onExpand,
}: NavItemProps) => {
  const router = useRouter();
  const pathname = usePathname();

  // Sub-navigation routes scoped to this organization
  const routes = [
    {
      label: "Boards",
      icon: <LayoutIcon className="mr-2 size-4" />,
      href: `/organization/${organization.id}`,
    },
    {
      label: "Activity",
      icon: <ActivityIcon className="mr-2 size-4" />,
      href: `/organization/${organization.id}/activity`,
    },
    {
      label: "Settings",
      icon: <SettingsIcon className="mr-2 size-4" />,
      href: `/organization/${organization.id}/settings`,
    },
    {
      label: "Billing",
      icon: <CreditCardIcon className="mr-2 size-4" />,
      href: `/organization/${organization.id}/billing`,
    },
  ];

  const onClick = (href: string) => {
    router.push(href);
  };

  return (
    <AccordionItem className="border-none" value={organization.id}>
      {/* Organization header — image + name */}
      <AccordionTrigger
        className={cn(
          "flex items-center gap-x-2 rounded-md p-1.5 text-start text-neutral-700 no-underline transition hover:bg-neutral-500/10 hover:no-underline",
          isActive && !isExpanded && "bg-sky-500/10 text-sky-700",
        )}
        onClick={() => onExpand(organization.id)}
      >
        <div className="flex items-center gap-x-2">
          <div className="relative size-7">
            <Image
              alt="Organization"
              className="rounded-sm object-cover"
              fill
              src={organization.imageUrl}
            />
          </div>
          <span className="text-sm font-medium">{organization.name}</span>
        </div>
      </AccordionTrigger>

      {/* Expanded sub-navigation links */}
      <AccordionContent className="pt-1 text-neutral-700">
        {routes.map((route) => (
          <Button
            key={route.href}
            className={cn(
              "mb-1 w-full justify-start pl-10 font-normal",
              pathname === route.href && "bg-sky-500/10 text-sky-700",
            )}
            size="sm"
            variant="ghost"
            onClick={() => onClick(route.href)}
          >
            {route.icon}
            {route.label}
          </Button>
        ))}
      </AccordionContent>
    </AccordionItem>
  );
};

/** Loading placeholder skeleton for a NavItem */
NavItem.Skeleton = function SkeletonNavItem() {
  return (
    <div className="flex items-center gap-x-2">
      <div className="relative size-10 shrink-0">
        <Skeleton className="absolute h-full w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
};
