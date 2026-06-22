import { z } from "zod";

/** Type for validation errors keyed by field names */
export type FieldErrors<T> = {
  [K in keyof T]?: string[];
};

/** Generic response structure for Server Actions */
export type ActionState<TInput, TOutput> = {
  fieldErrors?: FieldErrors<TInput>;
  error?: string | null;
  data?: TOutput;
};

/**
 * Creates a type-safe action wrapper that validates input using a Zod schema
 * before executing the handler logic.
 */
export const createSafeAction = <TInput, TOutput>(
  schema: z.Schema<TInput>,
  handler: (validatedData: TInput) => Promise<ActionState<TInput, TOutput>>,
) => {
  return async (data: TInput): Promise<ActionState<TInput, TOutput>> => {
    // Validate input data against the provided schema
    const validationResult = schema.safeParse(data);

    if (!validationResult.success) {
      return {
        fieldErrors: validationResult.error.flatten()
          .fieldErrors as FieldErrors<TInput>,
      };
    }

    return handler(validationResult.data);
  };
};
