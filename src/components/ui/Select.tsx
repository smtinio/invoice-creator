"use client";

import { useId } from "react";

/**
 * Moderna Library — Select.
 *
 * Figma: "Dropdown input. State: Default, Hover, Focus, Open (shows nested
 * Menu), Error, Disabled. Filled: False = placeholder, True = chosen value."
 *
 * Built on a native <select>: it gets keyboard support, mobile pickers and
 * screen-reader behaviour for free. The Open state in Figma uses the Menu
 * component, which a native control renders itself — see DESIGN-NOTES.
 */

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.ComponentPropsWithoutRef<"select">, "id"> {
  label: string;
  options: readonly SelectOption[];
  helperText?: string;
  error?: string;
  hideLabel?: boolean;
}

export function Select({
  label,
  options,
  helperText,
  error,
  hideLabel = false,
  className = "",
  disabled,
  ...selectProps
}: SelectProps) {
  const id = useId();
  const description = error ?? helperText;
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <div className={`flex w-full flex-col gap-[6px] ${className}`}>
      <label
        htmlFor={id}
        className={
          hideLabel
            ? "sr-only"
            : `type-utility-1-medium w-full ${
                disabled ? "text-text-disabled" : "text-text-primary"
              }`
        }
      >
        {label}
      </label>

      <div className="relative w-full">
        <select
          {...selectProps}
          id={id}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={descriptionId}
          className={[
            "h-[40px] w-full appearance-none rounded-[6px] border",
            // Room on the right for the chevron sitting over the control.
            "py-0 pl-[12px] pr-[36px]",
            "type-paragraph-2-regular",
            "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-disabled",
            error
              ? "border-error-default bg-error-subtle text-text-primary"
              : "border-border-default bg-surface-default text-text-primary hover:border-border-strong",
          ].join(" ")}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* eslint-disable-next-line @next/next/no-img-element -- static SVG in /public */}
        <img
          src="/icons/chevron-down-sm.svg"
          alt=""
          width={16}
          height={16}
          aria-hidden="true"
          className="pointer-events-none absolute right-[12px] top-1/2 -translate-y-1/2"
        />
      </div>

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
