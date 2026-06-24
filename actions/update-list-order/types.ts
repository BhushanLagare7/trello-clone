import { z } from "zod";

import { ActionState } from "@/lib/create-safe-action";
import { List } from "@/lib/generated/prisma/client";

import { UpdateListOrder } from "./schema";

export type InputType = z.infer<typeof UpdateListOrder>;
export type ReturnType = ActionState<InputType, List[]>;
