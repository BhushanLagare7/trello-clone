import { format } from "date-fns";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { generateLogMessage } from "@/lib/generate-log-message";
import type { AuditLog } from "@/lib/generated/prisma/browser";

interface ActivityItemProps {
  data: AuditLog;
}

export const ActivityItem = ({ data }: ActivityItemProps) => {
  return (
    <li className="flex items-center gap-x-2">
      <Avatar className="size-8">
        <AvatarImage src={data.userImage} />
      </Avatar>
      <div className="flex flex-col space-y-0.5">
        <p className="text-muted-foreground text-sm">
          <span className="font-semibold text-neutral-700 lowercase">
            {data.userName}
          </span>{" "}
          {generateLogMessage(data)}
        </p>
        <p className="text-muted-foreground text-xs">
          {format(new Date(data.createdAt), "MMM d, yyyy 'at' h:mm a")}
        </p>
      </div>
    </li>
  );
};
