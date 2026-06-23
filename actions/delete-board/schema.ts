import { z } from "zod";

export const DeleteBoard = z.object({
  id: z.string().min(1, "ID is required").trim(),
});
