import { z } from "zod";

import { ActionState } from "@/lib/create-safe-action";
import { List } from "@/lib/generated/prisma/client";

import { CopyList } from "./schema";

export type InputType = z.infer<typeof CopyList>;
export type ReturnType = ActionState<InputType, List>;
