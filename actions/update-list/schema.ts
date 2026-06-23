import { z } from "zod";

export const UpdateList = z.object({
  title: z
    .string({
      error: "Title is required",
    })
    .trim()
    .min(3, {
      error: "Title is too short",
    }),
  id: z.string().min(1, { error: "List id is required" }),
  boardId: z.string().min(1, { error: "Board id is required" }),
});
