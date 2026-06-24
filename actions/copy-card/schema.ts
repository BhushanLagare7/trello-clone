import { z } from "zod";

export const CopyCard = z.object({
  id: z.string().min(1, "Card ID is required."),
  boardId: z.string().min(1, "Board ID is required."),
});
