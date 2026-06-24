"use client";

import { ActivityIcon } from "lucide-react";

import { ActivityItem } from "@/components/activity-item";
import { Skeleton } from "@/components/ui/skeleton";
import type { AuditLog } from "@/lib/generated/prisma/browser";

/** Props for the Activity component */
interface ActivityProps {
  /** List of audit log entries to display */
  items: AuditLog[];
}

/**
 * Activity Component
 *
 * A client component that renders a list of audit log entries
 * for a specific card, displayed under an "Activity" heading
 * with an accompanying icon.
 *
 * @param items - Array of `AuditLog` entries to render
 */
export const Activity = ({ items }: ActivityProps) => {
  return (
    <div className="flex w-full items-start gap-x-3">
      {/* Activity section icon */}
      <ActivityIcon className="mt-0.5 size-5 text-neutral-700" />
      <div className="w-full">
        <p className="mb-2 font-semibold text-neutral-700">Activity</p>

        {/* Render each audit log entry as an ActivityItem */}
        <ol className="mt-2 space-y-4">
          {items.map((item) => (
            <ActivityItem key={item.id} data={item} />
          ))}
        </ol>
      </div>
    </div>
  );
};

/**
 * Activity.Skeleton
 *
 * A skeleton loader for the Activity component.
 * Rendered as a placeholder while the audit log data is being fetched.
 */
Activity.Skeleton = function ActivitySkeleton() {
  return (
    <div className="flex w-full items-start gap-x-3">
      {/* Icon placeholder */}
      <Skeleton className="size-6 bg-neutral-200" />
      <div className="w-full">
        {/* Heading placeholder */}
        <Skeleton className="mb-2 h-6 w-24 bg-neutral-200" />
        {/* Activity log list placeholder */}
        <Skeleton className="h-10 w-full bg-neutral-200" />
      </div>
    </div>
  );
};
