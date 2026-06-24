import { z } from "zod";

import { ActionState } from "@/lib/create-safe-action";
import type { Card } from "@/lib/generated/prisma/browser";

import { DeleteCard } from "./schema";

export type InputType = z.infer<typeof DeleteCard>;
export type ReturnType = ActionState<InputType, Card>;
