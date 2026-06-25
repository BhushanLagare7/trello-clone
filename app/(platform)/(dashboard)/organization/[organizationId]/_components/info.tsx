"use client";

import Image from "next/image";

import { useOrganization } from "@clerk/nextjs";
import { CreditCard } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

/** Props for the Info component */
interface InfoProps {
  // Whether the organization is a Pro plan
  isPro: boolean;
}

/**
 * Displays basic information about the active Clerk organization.
 * Includes the logo, name, and billing plan status.
 */
export const Info = ({ isPro }: InfoProps) => {
  const { organization, isLoaded } = useOrganization();

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return <Info.Skeleton />;
  }

  // Hide component if no organization is active
  if (!organization) {
    return null;
  }

  return (
    <div className="flex items-center gap-x-4">
      <div className="relative size-15">
        <Image
          alt="Organization"
          className="rounded-md object-cover"
          fill
          src={organization.imageUrl}
        />
      </div>
      <div className="space-y-1">
        <p className="text-xl font-semibold">{organization.name}</p>
        <div className="text-muted-foreground flex items-center text-xs">
          <CreditCard className="mr-1 size-3" />
          {isPro ? "Pro" : "Free"}
        </div>
      </div>
    </div>
  );
};

/**
 * Loading placeholder for the Info component.
 */
Info.Skeleton = function SkeletonInfo() {
  return (
    <div className="flex items-center gap-x-4">
      <div className="relative size-15">
        <Skeleton className="absolute size-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-10 w-50" />
        <div className="flex items-center">
          <Skeleton className="mr-2 size-4" />
          <Skeleton className="h-4 w-25" />
        </div>
      </div>
    </div>
  );
};
