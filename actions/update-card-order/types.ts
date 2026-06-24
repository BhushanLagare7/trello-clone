import { z } from "zod";

import { ActionState } from "@/lib/create-safe-action";
import type { Card } from "@/lib/generated/prisma/browser";

import { UpdateCardOrder } from "./schema";

export type InputType = z.infer<typeof UpdateCardOrder>;
export type ReturnType = ActionState<InputType, Card[]>;
