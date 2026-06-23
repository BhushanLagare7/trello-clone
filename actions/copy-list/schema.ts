import { z } from "zod";

export const CopyList = z.object({
  id: z.string().min(1, { error: "List id is required" }),
  boardId: z.string().min(1, { error: "Board id is required" }),
});
