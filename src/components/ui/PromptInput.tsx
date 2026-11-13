"use client";

import { useId } from "react";

/**
 * Moderna Library — Prompt Input.
 *
 * Figma: "AI prompt field. State: Default, Focus, Filled (entered text; Submit
 * swaps to ArrowUp), Disabled. Toggle Add and Mic from properties."
 *
 * This is the front end only. Nothing here sends anything anywhere — wiring it
 * to the drafting endpoint is a later step, and when it happens the text must
 * go through `redact()` first and only on an explicit submit.
 */

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  /** Privacy + AI-fallibility copy shown under the field. */
  disclaimer?: React.ReactNode;
  showAdd?: boolean;
  showMic?: boolean;
  disabled?: boolean;
  /** Accessible name for the field. */
  label: string;
}

export function PromptInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Ask anything",
  disclaimer,
  showAdd = true,
  showMic = true,
  disabled = false,
  label,
}: PromptInputProps) {
  const id = useId();
  const disclaimerId = disclaimer ? `${id}-disclaimer` : undefined;
  const isFilled = value.trim().length > 0;

  return (
    <div className="flex w-full flex-col items-center gap-[8px]">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (isFilled && !disabled) onSubmit?.(value);
        }}
        className={[
          "flex w-full items-center gap-[4px] rounded-[999px] border p-[8px]",
          "border-border-default bg-surface-default",
          "shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.12)]",
          "focus-within:border-border-focus",
        ].join(" ")}
      >
        {showAdd && (
          <button
            type="button"
            aria-label="Add an attachment"
            title="Add an attachment"
            disabled={disabled}
            className="flex size-[40px] shrink-0 items-center justify-center rounded-[999px] hover:bg-surface-muted disabled:opacity-40"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static SVG in /public */}
            <img src="/icons/prompt-add.svg" alt="" width={20} height={20} />
          </button>
        )}

        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        <input
          id={id}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          aria-describedby={disclaimerId}
          onChange={(event) => onChange(event.target.value)}
          className={[
            "min-w-px flex-1 border-0 bg-transparent px-[8px] outline-none",
            "type-paragraph-1-regular text-text-primary placeholder:text-text-tertiary",
            "disabled:cursor-not-allowed",
          ].join(" ")}
        />

        {showMic && (
          <button
            type="button"
            aria-label="Dictate"
            title="Dictate"
            disabled={disabled}
            className="flex size-[40px] shrink-0 items-center justify-center rounded-[999px] hover:bg-surface-muted disabled:opacity-40"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static SVG in /public */}
            <img src="/icons/prompt-mic.svg" alt="" width={20} height={20} />
          </button>
        )}

        <button
          type="submit"
          aria-label="Draft line items"
          title="Draft line items"
          // The frame draws Submit filled even with an empty field, so it is
          // not disabled on empty — the form's handler ignores the submit
          // instead.
          disabled={disabled}
          className={[
            "flex size-[40px] shrink-0 items-center justify-center rounded-[999px]",
            "bg-secondary-default hover:bg-secondary-hover",
            "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-secondary-default",
          ].join(" ")}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static SVG in /public */}
          <img src="/icons/prompt-submit.svg" alt="" width={20} height={20} />
        </button>
      </form>

      {disclaimer && (
        <p
          id={disclaimerId}
          className="type-utility-2-regular w-full text-center text-text-tertiary"
        >
          {disclaimer}
        </p>
      )}
    </div>
  );
}
