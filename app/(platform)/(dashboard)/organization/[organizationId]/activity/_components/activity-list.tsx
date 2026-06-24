import { redirect } from "next/navigation";

import { auth } from "@clerk/nextjs/server";

import { ActivityItem } from "@/components/activity-item";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/db";

/**
 * ActivityList Component
 *
 * An async server component that fetches and displays audit logs
 * for the currently authenticated organization.
 *
 * - Redirects to "/select-org" if no organization is selected.
 * - Displays a fallback message if no activity logs are found.
 * - Renders a list of `ActivityItem` components for each audit log,
 *   sorted by most recent first.
 */
export const ActivityList = async () => {
  // Get the current organization ID from the authenticated session
  const { orgId } = await auth();

  // Redirect to organization selection if no org is active
  if (!orgId) {
    redirect("/select-org");
  }

  // Fetch all audit logs for the current organization, newest first
  const auditLogs = await db.auditLog.findMany({
    where: {
      orgId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <ol className="mt-4 space-y-4">
      {auditLogs.length === 0 ? (
        <li className="text-muted-foreground text-center text-xs">
          No activity found inside this organization
        </li>
      ) : (
        auditLogs.map((log) => <ActivityItem key={log.id} data={log} />)
      )}
    </ol>
  );
};

/**
 * ActivityList.Skeleton
 *
 * A skeleton loader for the ActivityList component.
 * Rendered as a placeholder while the audit log data is being fetched.
 */
ActivityList.Skeleton = function ActivityListSkeleton() {
  return (
    <ol className="mt-4 space-y-4">
      {/* Skeleton placeholders with varying widths to simulate real content */}
      <Skeleton className="h-14 w-[80%]" />
      <Skeleton className="h-14 w-[50%]" />
      <Skeleton className="h-14 w-[70%]" />
      <Skeleton className="h-14 w-[80%]" />
      <Skeleton className="h-14 w-[75%]" />
    </ol>
  );
};
