/**
 * Moderna Library — Button.
 *
 * Figma: "Bertie CMS button. Type: Primary (main action), Secondary (neutral),
 * Tertiary (low-emphasis/ghost), Error (destructive), Outline (paired
 * cancel/secondary in modals and forms). State: Default, Hover, Disabled.
 * Label uses utility/1/medium."
 */

type ButtonType = "primary" | "secondary" | "tertiary" | "error" | "outline";

interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  /** Named `variant` rather than `type`, which <button> already uses for submit/reset. */
  variant?: ButtonType;
}

const VARIANT_CLASSES: Record<ButtonType, string> = {
  primary:
    "bg-primary-default text-text-inverse hover:bg-primary-hover",
  secondary:
    "bg-secondary-default text-text-inverse hover:bg-secondary-hover",
  tertiary:
    "bg-transparent text-text-primary hover:bg-surface-muted",
  error: "bg-error-default text-text-inverse hover:bg-error-hover",
  outline:
    "border border-border-default bg-surface-default text-text-primary hover:border-border-strong",
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      {...buttonProps}
      type={type}
      className={[
        "flex items-center justify-center gap-[8px] rounded-[6px] px-[20px] py-[12px]",
        "type-utility-1-medium",
        VARIANT_CLASSES[variant],
        // Figma lists a Disabled state but does not show its colors. These use
        // the two tokens the system reserves for disabled UI; confirm against
        // the component before relying on them.
        "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-disabled",
        "disabled:border-border-default disabled:hover:bg-surface-muted",
        className,
      ].join(" ")}
    />
  );
}
