"use client";

import { useId } from "react";

import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import {
  EARLY_PAYMENT_TERMS,
  type EarlyPaymentTerms,
  earlyPaymentOutcome,
  formatBasisPoints,
  formatCents,
  type InvoiceTotals,
} from "@/lib/money";

/**
 * The "Early payment discount" card from Desktop - 4.
 *
 * This is a conditional offer, not a line item: it never changes Total due.
 * The card shows what the client would pay by settling early alongside the
 * full amount, which is why both figures appear.
 */

interface EarlyPaymentCardProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  termsId: string;
  onTermsChange: (id: string) => void;
  totals: InvoiceTotals;
}

export function EarlyPaymentCard({
  enabled,
  onEnabledChange,
  termsId,
  onTermsChange,
  totals,
}: EarlyPaymentCardProps) {
  const labelId = useId();
  const descriptionId = `${labelId}-description`;

  const terms: EarlyPaymentTerms =
    EARLY_PAYMENT_TERMS.find((option) => option.id === termsId) ?? EARLY_PAYMENT_TERMS[0];
  const outcome = earlyPaymentOutcome(totals, terms);

  return (
    <div className="flex w-full flex-col gap-[12px] rounded-[12px] border border-border-default bg-surface-default p-[16px]">
      <div className="flex w-full flex-col gap-[12px] sm:flex-row sm:items-center">
        <div className="flex min-w-px flex-1 items-center gap-[12px]">
          <Switch
            checked={enabled}
            onChange={onEnabledChange}
            labelledBy={labelId}
            describedBy={descriptionId}
          />
          <span className="flex min-w-px flex-1 flex-col gap-[2px]">
            <span id={labelId} className="type-paragraph-1-medium w-full text-text-primary">
              Early payment discount
            </span>
            <span id={descriptionId} className="type-utility-2-regular w-full text-text-tertiary">
              Offer a cash discount when the client pays before the due date.
              2/10 Net 30 is the most common.
            </span>
          </span>
        </div>

        {/* Sized by the wrapper, not by a width class on Select — see the
            note in ServicesTable. */}
        <div className="w-full sm:w-[176px] sm:shrink-0">
          <Select
            hideLabel
            label="Early payment terms"
            value={terms.id}
            onChange={(event) => onTermsChange(event.target.value)}
            disabled={!enabled}
            options={EARLY_PAYMENT_TERMS.map((option) => ({
              value: option.id,
              label: option.label,
            }))}
          />
        </div>
      </div>

      {enabled && (
        <>
          <div className="h-px w-full shrink-0 bg-border-default" />

          <div className="flex w-full items-center gap-[12px]">
            <span className="flex min-w-px flex-1 flex-col gap-[2px]">
              <span className="type-paragraph-1-regular w-full text-text-secondary">
                If paid within {terms.discountDays} days
              </span>
              <span className="type-utility-2-regular w-full text-text-tertiary">
                {formatBasisPoints(terms.discountBasisPoints)} cash discount on
                services ({formatCents(outcome.discount)}). Expenses are not
                discounted.
              </span>
            </span>
            <span className="type-paragraph-1-medium shrink-0 whitespace-nowrap text-right text-success-default">
              {formatCents(outcome.amountIfPaidEarly)}
            </span>
          </div>

          <div className="flex w-full items-center gap-[12px]">
            <span className="flex min-w-px flex-1 flex-col gap-[2px]">
              <span className="type-paragraph-1-regular w-full text-text-secondary">
                Net amount due within {terms.netDays} days
              </span>
              <span className="type-utility-2-regular w-full text-text-tertiary">
                Full invoice total
              </span>
            </span>
            <span className="type-paragraph-1-medium shrink-0 whitespace-nowrap text-right text-text-primary">
              {formatCents(totals.total)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
