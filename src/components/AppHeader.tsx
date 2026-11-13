import { DevelopmentNotice } from "@/components/DevelopmentNotice";
import { Stepper, type StepDefinition } from "@/components/ui/Stepper";

/** The four steps from the brief, in order. */
export const INVOICE_STEPS: readonly StepDefinition[] = [
  { label: "Your details" },
  { label: "Items & services" },
  { label: "Customer details" },
  { label: "Send & download" },
];

interface AppHeaderProps {
  /** 1-based index into INVOICE_STEPS. */
  currentStep: number;
}

/**
 * The page chrome: wordmark, stepper, and the site-wide development notice
 * beneath them. Every page renders this, so the notice appears everywhere
 * without each page having to remember it.
 */
export function AppHeader({ currentStep }: AppHeaderProps) {
  return (
    <>
      <header className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-[16px] px-[16px] pt-[40px] sm:px-[24px] md:px-[80px]">
        {/* The wordmark stacks two lines with their line boxes pulled together,
            which is the -14px in the frame. */}
        <p className="type-heading-1-bold whitespace-nowrap text-text-primary">
          <span className="block">SeanKT</span>
          <span className="-mt-[14px] block">Dueday</span>
        </p>

        <Stepper steps={INVOICE_STEPS} currentStep={currentStep} />
      </header>

      <DevelopmentNotice />
    </>
  );
}
