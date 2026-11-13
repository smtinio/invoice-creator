import { Banner } from "@/components/ui/Banner";

/**
 * The site-wide "still in development" notice (Figma: Desktop - 7, node
 * 28:1640).
 *
 * Rendered once by AppHeader so it appears on every page, sitting below the
 * wordmark and stepper and aligned to the same content column.
 *
 * The copy is verbatim from the frame, including its "DueDay" spelling, which
 * differs from the "Dueday" in the wordmark — see DESIGN-NOTES.
 */
export function DevelopmentNotice() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-[16px] pt-[24px] sm:px-[24px] md:px-[80px]">
      <Banner tone="info" layout="inline" title="DueDay Is Still In Development">
        Most features are disabled.
      </Banner>
    </div>
  );
}
