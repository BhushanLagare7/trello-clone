import { z } from "zod";

import { ActionState } from "@/lib/create-safe-action";
import type { List } from "@/lib/generated/prisma/browser";

import { UpdateList } from "./schema";

export type InputType = z.infer<typeof UpdateList>;
export type ReturnType = ActionState<InputType, List>;
