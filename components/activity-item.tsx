import { format } from "date-fns";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateLogMessage } from "@/lib/generate-log-message";
import type { AuditLog } from "@/lib/generated/prisma/browser";

/** Props for the ActivityItem component */
interface ActivityItemProps {
  /** The audit log entry to display */
  data: AuditLog;
}

/**
 * ActivityItem Component
 *
 * A client component that renders a single audit log entry
 * in a list format, including the user's avatar, name, action description,
 * and the timestamp of the event.
 *
 * @param data - The audit log entry to display
 */
export const ActivityItem = ({ data }: ActivityItemProps) => {
  return (
    <li className="flex items-center gap-x-2">
      {/* User avatar */}
      <Avatar className="size-8">
        <AvatarImage src={data.userImage} />
        <AvatarFallback>{data.userName.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col space-y-0.5">
        {/* Activity log message */}
        <p className="text-muted-foreground text-sm">
          <span className="font-semibold text-neutral-700 lowercase">
            {data.userName}
          </span>{" "}
          {generateLogMessage(data)}
        </p>

        {/* Timestamp */}
        <p className="text-muted-foreground text-xs">
          {format(new Date(data.createdAt), "MMM d, yyyy 'at' h:mm a")}
        </p>
      </div>
    </li>
  );
};
