import { z } from "zod";

export const DeleteBoard = z.object({
  id: z.string().min(1, { error: "ID is required" }).trim(),
});
