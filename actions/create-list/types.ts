import { z } from "zod";

import { ActionState } from "@/lib/create-safe-action";
import type { List } from "@/lib/generated/prisma/browser";

import { CreateList } from "./schema";

export type InputType = z.infer<typeof CreateList>;
export type ReturnType = ActionState<InputType, List>;
