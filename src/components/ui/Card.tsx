/**
 * Moderna Library — Modal, used here as a standalone card.
 *
 * In Figma this is the "Modal" component ("Intuit-style dialog... Place over a
 * 40% black scrim"), but the Desktop - 2 frame uses it as a card sitting
 * directly on the page with no scrim and no dismiss affordance. It is named
 * Card here to match how it behaves: calling it Modal in code would imply a
 * focus trap and an Escape handler that this screen neither has nor wants.
 *
 * Header, Content and Footer mirror the three slots inside the Figma component.
 */

interface CardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Right-aligned action row. Omitted when a screen has no actions. */
  footer?: React.ReactNode;
  className?: string;
}

export function Card({
  title,
  description,
  children,
  footer,
  className = "",
}: CardProps) {
  return (
    <section
      className={[
        "flex w-full flex-col gap-[32px] rounded-[16px] bg-surface-default shadow-modal",
        // Desktop padding from the frame; tightened on small screens, which
        // the design does not cover.
        "px-[24px] pt-[32px] pb-[24px] sm:px-[40px] md:px-[64px] md:pt-[64px] md:pb-[48px]",
        className,
      ].join(" ")}
    >
      <header className="flex w-full flex-col gap-[12px]">
        <h2 className="type-heading-1-bold w-full text-text-primary">{title}</h2>
        {description && (
          <p className="type-paragraph-1-regular w-full text-text-secondary">
            {description}
          </p>
        )}
      </header>

      <div className="flex w-full flex-col gap-[16px]">{children}</div>

      {footer && (
        <footer className="flex w-full items-center justify-end gap-[16px]">
          {footer}
        </footer>
      )}
    </section>
  );
}
