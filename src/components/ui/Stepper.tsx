import { Fragment } from "react";

/**
 * Moderna Library — Step, chained with connectors.
 *
 * Figma: "One step in a multi-step flow. State: Complete (check), Active,
 * Upcoming. Chain with 40px border/default connectors."
 *
 * The frame uses 24px connectors, so that is what is built here. The Complete
 * state needs a check icon that this frame did not export — see README.
 */

export type StepState = "complete" | "active" | "upcoming";

export interface StepDefinition {
  label: string;
}

interface StepperProps {
  steps: readonly StepDefinition[];
  /** 1-based. Earlier steps render as complete, later ones as upcoming. */
  currentStep: number;
  className?: string;
}

function stateOf(index: number, currentStep: number): StepState {
  const stepNumber = index + 1;
  if (stepNumber < currentStep) return "complete";
  if (stepNumber === currentStep) return "active";
  return "upcoming";
}

function Step({
  label,
  number,
  state,
}: {
  label: string;
  number: number;
  state: StepState;
}) {
  const isActive = state === "active";

  return (
    <li className="flex items-center gap-[8px]" aria-current={isActive ? "step" : undefined}>
      <span
        className={[
          "flex size-[24px] shrink-0 items-center justify-center overflow-clip rounded-[12px]",
          "type-utility-2-medium",
          isActive
            ? "bg-primary-default text-text-inverse"
            : "bg-surface-muted text-text-secondary",
        ].join(" ")}
      >
        {number}
      </span>

      {/* Labels are the first thing to go when the row runs out of room. The
          numbered indicators and the heading still say where you are. */}
      <span
        className={[
          "hidden whitespace-nowrap md:inline",
          isActive
            ? "type-utility-1-medium text-text-primary"
            : "type-utility-1-regular text-text-secondary",
        ].join(" ")}
      >
        {label}
      </span>
    </li>
  );
}

export function Stepper({ steps, currentStep, className = "" }: StepperProps) {
  return (
    <nav aria-label="Progress" className={className}>
      <ol className="flex items-center gap-[8px]">
        {steps.map((step, index) => (
          <Fragment key={step.label}>
            {index > 0 && (
              /* The Figma connector asset is a 1px line in border/default,
                 which is a border rather than an image. */
              /* 24px in the frame, shortened on small screens so four steps
                 still fit across a phone. */
              <li
                aria-hidden="true"
                className="h-px w-[12px] shrink-0 bg-border-default sm:w-[24px]"
              />
            )}
            <Step
              label={step.label}
              number={index + 1}
              state={stateOf(index, currentStep)}
            />
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
