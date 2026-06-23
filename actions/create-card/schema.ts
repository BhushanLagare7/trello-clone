import { z } from "zod";

export const CreateCard = z.object({
  title: z
    .string({
      error: "Title is required",
    })
    .min(3, {
      error: "Title is too short",
    }),
  boardId: z.string().min(1, {
    error: "Board ID is required",
  }),
  listId: z.string().min(1, {
    error: "List ID is required",
  }),
});
