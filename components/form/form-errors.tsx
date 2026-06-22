import { XCircleIcon } from "lucide-react";

interface FormErrorsProps {
  id: string; // The specific field ID to check for errors
  errors?: Record<string, string[] | undefined>; // Object containing arrays of error messages
}

/**
 * Renders a list of validation errors for a specific form field.
 */
export const FormErrors = ({ id, errors }: FormErrorsProps) => {
  if (!errors) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="mt-2 text-xs text-rose-500"
      id={`${id}-error`}
    >
      {errors?.[id]?.map((error: string) => (
        <div
          key={error}
          className="flex items-center rounded-sm border border-rose-500 bg-rose-500/10 p-2 font-medium"
        >
          <XCircleIcon className="mr-2 size-4" />
          {error}
        </div>
      ))}
    </div>
  );
};
