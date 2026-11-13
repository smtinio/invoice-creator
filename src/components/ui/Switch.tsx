"use client";

/**
 * A 40x24 on/off switch, matching the "Switch (on)" / "Switch (off)" layers in
 * the items frames.
 *
 * Those are flat images in Figma rather than instances of a documented
 * component, so the colours are read off the frames and the geometry from the
 * layer size. See DESIGN-NOTES.
 *
 * Uses a real checkbox underneath so it is keyboard- and screen-reader-operable
 * without reimplementing any of that.
 */

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Accessible name. Pass the id of a visible label via `labelledBy` instead when there is one. */
  label?: string;
  labelledBy?: string;
  describedBy?: string;
  disabled?: boolean;
}

export function Switch({
  checked,
  onChange,
  label,
  labelledBy,
  describedBy,
  disabled = false,
}: SwitchProps) {
  return (
    <span className="relative inline-flex h-[24px] w-[40px] shrink-0">
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        aria-label={label}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.checked)}
        className="peer absolute inset-0 z-10 m-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
      />

      {/* Track */}
      <span
        aria-hidden="true"
        className={[
          "pointer-events-none h-[24px] w-[40px] rounded-[999px] transition-colors",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2",
          "peer-focus-visible:outline-border-focus",
          checked ? "bg-primary-default" : "bg-surface-muted",
          disabled ? "opacity-60" : "",
        ].join(" ")}
      />

      {/* Knob */}
      <span
        aria-hidden="true"
        className={[
          "pointer-events-none absolute top-[2px] size-[20px] rounded-[999px]",
          "bg-surface-default shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-[left]",
          checked ? "left-[18px]" : "left-[2px]",
        ].join(" ")}
      />
    </span>
  );
}
