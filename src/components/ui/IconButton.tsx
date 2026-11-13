/**
 * Moderna Library — Icon Button.
 *
 * Figma: "Square 36px icon-only button... Always give it an accessible label
 * (aria-label) in code, and pair with a tooltip."
 *
 * The items frames use 40px containers for the row Remove and Attach receipt
 * controls, so `size` defaults to 40 and the frame wins over the description.
 * `label` is required rather than optional — an icon-only control with no
 * accessible name is unusable with a screen reader.
 */

interface IconButtonProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "children"> {
  /** Path to an exported icon under /public/icons. */
  icon: string;
  /** Accessible name, also used as the native tooltip. */
  label: string;
  iconSize?: number;
  size?: number;
}

export function IconButton({
  icon,
  label,
  iconSize = 20,
  size = 40,
  className = "",
  type = "button",
  ...buttonProps
}: IconButtonProps) {
  return (
    <button
      {...buttonProps}
      type={type}
      aria-label={label}
      title={label}
      style={{ width: size, height: size }}
      className={[
        "flex shrink-0 items-center justify-center rounded-[6px]",
        "hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40",
        className,
      ].join(" ")}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG in /public */}
      <img src={icon} alt="" width={iconSize} height={iconSize} aria-hidden="true" />
    </button>
  );
}
