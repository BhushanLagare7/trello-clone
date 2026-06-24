import { z } from "zod";

export const DeleteCard = z.object({
  id: z.string().min(1, "ID is required"),
  boardId: z.string().min(1, "Board ID is required"),
});
