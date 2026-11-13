"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

/**
 * Moderna Library — Dropzone.
 *
 * Figma: "File drop area. Edit the prompt/accepted-types text directly; the
 * 'browse' word is styled as a link. Stretch to fill its container."
 *
 * Figma shows only the empty state. The drag-over and filled states below are
 * built from existing tokens — see README for what to confirm.
 */

interface DropzoneProps {
  label: string;
  /** e.g. "Drop your logo here or " — the word "browse" is appended as a link. */
  prompt: string;
  /** e.g. "PNG, JPG or SVG. Appears at the top of your invoice." */
  hint: string;
  accept: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
}

/** Checks a dropped file against the `accept` list, which the picker can't enforce. */
function isAccepted(file: File, accept: string): boolean {
  return accept
    .split(",")
    .map((entry) => entry.trim())
    .some((entry) =>
      entry.endsWith("/*")
        ? file.type.startsWith(entry.slice(0, -1))
        : file.type === entry,
    );
}

export function Dropzone({
  label,
  prompt,
  hint,
  accept,
  file,
  onFileChange,
}: DropzoneProps) {
  const inputId = useId();
  const labelId = `${inputId}-label`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived from the file rather than stored in state, so there is one source
  // of truth. An object URL pins the file in memory until it is revoked, which
  // the effect below does when the file changes or the component unmounts.
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function accept_(incoming: File | undefined) {
    if (!incoming) return;
    if (!isAccepted(incoming, accept)) {
      setError(`${incoming.name} isn't a supported file type.`);
      return;
    }
    setError(null);
    onFileChange(incoming);
  }

  return (
    <div className="flex w-full flex-col gap-[8px]">
      <p id={labelId} className="type-utility-1-medium whitespace-nowrap text-text-primary">
        {label}
      </p>

      {/* Visually hidden but still focusable, so the zone works from the
          keyboard. The zone below is its <label>, which is what makes the
          whole area clickable without a fake role="button". */}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        aria-labelledby={labelId}
        className="peer sr-only"
        onChange={(event) => accept_(event.target.files?.[0])}
      />

      {file && previewUrl ? (
        <div className="flex w-full items-center gap-[16px] rounded-[8px] border border-border-default bg-surface-subtle px-[24px] py-[16px]">
          {/* eslint-disable-next-line @next/next/no-img-element -- a local
              object URL, which next/image cannot optimize. */}
          <img
            src={previewUrl}
            alt=""
            className="h-[48px] w-[48px] shrink-0 object-contain"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
            <p className="type-paragraph-2-medium truncate text-text-primary">
              {file.name}
            </p>
            <p className="type-utility-2-regular text-text-tertiary">
              {(file.size / 1024).toFixed(0)} KB
            </p>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="type-utility-1-medium shrink-0 text-text-link underline"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={() => {
              onFileChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="type-utility-1-medium shrink-0 text-text-secondary underline"
          >
            Remove
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragOver(false);
            accept_(event.dataTransfer.files?.[0]);
          }}
          className={[
            "flex w-full flex-col items-center justify-center gap-[8px] overflow-clip",
            "cursor-pointer rounded-[8px] border-[1.5px] border-dashed px-[24px] py-[40px]",
            // The real input is visually hidden, so mirror its focus ring here.
            "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2",
            "peer-focus-visible:outline-border-focus",
            isDragOver
              ? "border-border-focus bg-primary-subtle"
              : "border-border-strong bg-surface-subtle",
          ].join(" ")}
        >
          {/* Exported from the Figma "Upload" icon. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- a static
              SVG in /public; next/image adds no value here. */}
          <img src="/icons/upload.svg" alt="" width={28} height={28} />

          {/* The Figma layer is nowrap, but holding that here would push the
              card wider than a phone screen, so these wrap instead. */}
          <p className="type-paragraph-2-medium text-center text-text-primary">
            {prompt}
            <span className="text-text-link underline">browse</span>
          </p>

          <p className="type-utility-2-regular text-center text-text-tertiary">
            {hint}
          </p>
        </label>
      )}

      {error && <p className="type-utility-2-regular text-error-default">{error}</p>}
    </div>
  );
}
