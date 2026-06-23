import { z } from "zod";

export const UpdateBoard = z.object({
  title: z
    .string({
      error: "Title is required",
    })
    .min(3, {
      error: "Title is too short",
    }),
  id: z.string().min(1, { error: "ID is required" }),
});
