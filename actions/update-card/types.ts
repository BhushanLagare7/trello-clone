import { z } from "zod";

import { ActionState } from "@/lib/create-safe-action";
import { Card } from "@/lib/generated/prisma/client";

import { UpdateCard } from "./schema";

export type InputType = z.infer<typeof UpdateCard>;
export type ReturnType = ActionState<InputType, Card>;
