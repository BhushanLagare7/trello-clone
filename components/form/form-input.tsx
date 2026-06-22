"use client";

import { forwardRef } from "react";
import { useFormStatus } from "react-dom";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { FormErrors } from "./form-errors";

/**
 * Props for the FormInput component.
 */
interface FormInputProps {
  id: string;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  errors?: Record<string, string[] | undefined>; // Server-side validation errors
  className?: string;
  defaultValue?: string;
  onBlur?: () => void;
}

/**
 * A reusable form input field with integrated label, error handling,
 * and automatic disabled state during form submission.
 */
export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      id,
      label,
      type,
      placeholder,
      required,
      disabled,
      errors,
      className,
      defaultValue = "",
      onBlur,
    },
    ref,
  ) => {
    // Detects if the parent form is currently submitting
    const { pending } = useFormStatus();

    return (
      <div className="space-y-2">
        <div className="space-y-1">
          {label ? (
            <Label
              className="text-xs font-semibold text-neutral-700"
              htmlFor={id}
            >
              {label}
            </Label>
          ) : null}
          <Input
            ref={ref}
            aria-describedby={`${id}-error`}
            className={cn("h-7 px-2 py-1 text-sm", className)}
            defaultValue={defaultValue}
            disabled={pending || disabled}
            id={id}
            name={id}
            placeholder={placeholder}
            required={required}
            type={type}
            onBlur={onBlur}
          />
        </div>
        {/* Displays validation errors based on field ID */}
        <FormErrors errors={errors} id={id} />
      </div>
    );
  },
);

FormInput.displayName = "FormInput";
