/**
 * Moderna Library — Banner.
 *
 * Figma: "Full-width status/feedback message. Tone: Neutral (processing/
 * system), Info, Success, Warning, Error. Layout: Inline (title + message on
 * one line) or Stacked (title above message)."
 *
 * Only the Info tone appears in the frames so far. The others are built from
 * the matching status tokens — see DESIGN-NOTES.
 */

type BannerTone = "neutral" | "info" | "success" | "warning" | "error";

interface BannerProps {
  tone?: BannerTone;
  title?: string;
  children: React.ReactNode;
  /** Stacked puts the title above the message; inline keeps them on one line. */
  layout?: "stacked" | "inline";
  className?: string;
}

const TONE_CLASSES: Record<BannerTone, string> = {
  neutral: "border-border-default bg-surface-subtle",
  info: "border-primary-default bg-primary-subtle",
  success: "border-success-default bg-success-subtle",
  warning: "border-warning-default bg-warning-subtle",
  error: "border-error-default bg-error-subtle",
};

/** Only Info has an exported glyph so far; the rest reuse it until designed. */
const TONE_ICON: Record<BannerTone, string> = {
  neutral: "/icons/info.svg",
  info: "/icons/info.svg",
  success: "/icons/info.svg",
  warning: "/icons/info.svg",
  error: "/icons/info.svg",
};

export function Banner({
  tone = "info",
  title,
  children,
  layout = "stacked",
  className = "",
}: BannerProps) {
  return (
    <div
      // Advisory, not urgent — polite lets a screen reader finish the current
      // sentence before announcing it.
      role="status"
      aria-live="polite"
      className={[
        "flex w-full items-start gap-[12px] rounded-[8px] border px-[24px] py-[20px]",
        TONE_CLASSES[tone],
        className,
      ].join(" ")}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG in /public */}
      <img
        src={TONE_ICON[tone]}
        alt=""
        width={20}
        height={20}
        className="mt-[2px] shrink-0"
      />

      <div
        className={
          layout === "inline"
            ? "flex min-w-0 flex-1 flex-wrap items-baseline gap-x-[8px] gap-y-[4px]"
            : "flex min-w-0 flex-1 flex-col gap-[4px]"
        }
      >
        {title && (
          <p
            className={`type-paragraph-2-bold text-text-primary ${
              layout === "inline" ? "shrink-0" : "w-full"
            }`}
          >
            {title}
          </p>
        )}
        <p
          className={`type-paragraph-2-regular text-text-secondary ${
            layout === "inline" ? "min-w-0 flex-1" : "w-full"
          }`}
        >
          {children}
        </p>
      </div>
    </div>
  );
}
