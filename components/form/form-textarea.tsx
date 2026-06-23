"use client";

import { forwardRef, KeyboardEventHandler } from "react";
import { useFormStatus } from "react-dom";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { FormErrors } from "./form-errors";

/** Props for the FormTextarea component */
interface FormTextareaProps {
  /** Unique identifier for the textarea, also used as the form field name */
  id: string;
  /** Optional label text displayed above the textarea */
  label?: string;
  /** Placeholder text shown when the textarea is empty */
  placeholder?: string;
  /** Whether the field is required for form submission */
  required?: boolean;
  /** Whether the textarea is manually disabled (also disabled during form submission) */
  disabled?: boolean;
  /** Validation errors keyed by field name */
  errors?: Record<string, string[] | undefined>;
  /** Additional CSS classes to apply to the textarea */
  className?: string;
  onBlur?: () => void;
  onClick?: () => void;
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement> | undefined;
  /** Initial value for the uncontrolled textarea */
  defaultValue?: string;
}

/**
 * A form-aware textarea component that integrates with React's form status.
 * Automatically disables itself during form submission and displays validation errors.
 *
 * @example
 * <FormTextarea
 *   id="description"
 *   label="Description"
 *   placeholder="Enter description..."
 *   errors={formErrors}
 * />
 */
export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      id,
      label,
      placeholder,
      required,
      disabled,
      errors,
      onBlur,
      onClick,
      onKeyDown,
      className,
      defaultValue,
    },
    ref,
  ) => {
    // Tracks whether a parent form submission is in progress
    const { pending } = useFormStatus();

    return (
      <div className="w-full space-y-2">
        <div className="w-full space-y-1">
          {label ? (
            <Label
              className="text-xs font-semibold text-neutral-700"
              htmlFor={id}
            >
              {label}
            </Label>
          ) : null}
          <Textarea
            ref={ref}
            aria-describedby={`${id}-error`} // Links textarea to its error message for accessibility
            className={cn(
              "resize-none shadow-sm ring-0 outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
              className,
            )}
            defaultValue={defaultValue}
            disabled={pending || disabled} // Disable during submission or when explicitly disabled
            id={id}
            name={id}
            placeholder={placeholder}
            required={required}
            onBlur={onBlur}
            onClick={onClick}
            onKeyDown={onKeyDown}
          />
        </div>
        {/* Displays field-specific validation errors below the textarea */}
        <FormErrors errors={errors} id={id} />
      </div>
    );
  },
);

FormTextarea.displayName = "FormTextarea";
