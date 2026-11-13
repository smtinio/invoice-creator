"use client";

import { useId } from "react";

/**
 * Moderna Library — Input.
 *
 * Figma: "Text input. State: Default, Hover, Focus, Error, Disabled. Filled:
 * False shows placeholder (text/tertiary), True shows entered value
 * (text/primary). Toggle label, helper text, and leading icon from properties.
 * Field is 40px tall."
 *
 * The leading-icon property is not built yet — no screen needs it so far.
 */

interface InputProps extends Omit<React.ComponentPropsWithoutRef<"input">, "id"> {
  label: string;
  /** Small line under the field. Replaced by `error` when there is one. */
  helperText?: string;
  /** Shown in place of the helper text and switches the field to its error state. */
  error?: string;
}

export function Input({
  label,
  helperText,
  error,
  className = "",
  ...inputProps
}: InputProps) {
  // Generated here so every field is label-linked without the caller having to
  // invent unique ids.
  const id = useId();
  const description = error ?? helperText;
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <div className={`flex w-full flex-col gap-[6px] ${className}`}>
      <label htmlFor={id} className="type-utility-1-medium w-full text-text-primary">
        {label}
      </label>

      <input
        {...inputProps}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={descriptionId}
        className={[
          "h-[40px] w-full rounded-[6px] border px-[12px]",
          "type-paragraph-2-regular text-text-primary placeholder:text-text-tertiary",
          "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-disabled",
          error
            ? "border-error-default bg-error-subtle"
            : "border-border-default bg-surface-default hover:border-border-strong",
        ].join(" ")}
      />

      {description && (
        <p
          id={descriptionId}
          className={`type-utility-2-regular w-full ${
            error ? "text-error-default" : "text-text-secondary"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
