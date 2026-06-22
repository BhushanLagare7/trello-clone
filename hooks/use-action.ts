import { useCallback, useState } from "react";

import { ActionState, FieldErrors } from "@/lib/create-safe-action";

/** Type definition for an async server action */
type Action<TInput, TOutput> = (
  data: TInput,
) => Promise<ActionState<TInput, TOutput>>;

/** Callback hooks for action lifecycle events */
interface UseActionOptions<TOutput> {
  onSuccess?: (data: TOutput) => void;
  onError?: (error: string) => void;
  onComplete?: () => void;
}

/**
 * Custom hook to manage the state and execution of safe server actions.
 * Provides loading states, error handling, and result data.
 */
export const useAction = <TInput, TOutput>(
  action: Action<TInput, TOutput>,
  options: UseActionOptions<TOutput> = {},
) => {
  const [fieldErrors, setFieldErrors] = useState<
    FieldErrors<TInput> | undefined
  >(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [data, setData] = useState<TOutput | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /** Executes the action with provided input and updates state accordingly */
  const execute = useCallback(
    async (input: TInput) => {
      setIsLoading(true);

      try {
        const result = await action(input);

        if (!result) return;

        // Validation errors are set if present
        setFieldErrors(result.fieldErrors);

        // Server error with error Callback is set if present
        if (result.error) {
          setError(result.error);
          options.onError?.(result.error);
        }

        // Data with success callback is set if present
        if (result.data !== undefined) {
          setData(result.data);
          options.onSuccess?.(result.data);
        }
      } catch (err) {
        const errString = err instanceof Error ? err.message : "Something went wrong";
        setError(errString);
        options.onError?.(errString);
      } finally {
        setIsLoading(false);
        options.onComplete?.();
      }
    },
    [action, options],
  );

  return {
    execute,
    fieldErrors,
    error,
    data,
    isLoading,
  };
};
