"use client";

import { Banner } from "@/components/ui/Banner";
import { Input } from "@/components/ui/Input";
import { formatCents, type InvoiceTotals } from "@/lib/money";
import type { TaxSuggestion } from "@/lib/taxSuggestion";

/**
 * The subtotal / discount / expenses / tax / total block from Desktop - 4.
 *
 * Every figure here is read from `InvoiceTotals`. Nothing in this file does
 * arithmetic — that all lives in `money.ts`, which is where the tests are.
 *
 * The 52px right padding reserves the width of the row Remove buttons (40px
 * plus the 12px gap) so these figures align with the Amount column above.
 */

const ROW = "flex w-full items-center gap-[12px] sm:pr-[52px]";
const LABEL = "type-paragraph-1-regular min-w-px flex-1 text-text-secondary";

interface TotalsPanelProps {
  totals: InvoiceTotals;
  discountText: string;
  onDiscountChange: (value: string) => void;
  onDiscountBlur: () => void;
  taxText: string;
  onTaxChange: (value: string) => void;
  onTaxBlur: () => void;
  taxSuggestion: TaxSuggestion | null;
}

export function TotalsPanel({
  totals,
  discountText,
  onDiscountChange,
  onDiscountBlur,
  taxText,
  onTaxChange,
  onTaxBlur,
  taxSuggestion,
}: TotalsPanelProps) {
  return (
    <>
      <div className={ROW}>
        <p className={LABEL}>Services subtotal</p>
        <p
          className={`type-paragraph-1-medium shrink-0 whitespace-nowrap text-right ${
            totals.servicesSubtotal === 0 ? "text-text-tertiary" : "text-text-primary"
          }`}
        >
          {formatCents(totals.servicesSubtotal)}
        </p>
      </div>

      <div className={ROW}>
        <p className={LABEL}>Discount (services only)</p>
        {/* Sized by the wrapper, not by a width class on Input — see the note
            in ServicesTable. */}
        <div className="w-[96px] shrink-0 sm:w-[128px]">
          <Input
            hideLabel
            label="Discount percentage, applied to services only"
            inputMode="decimal"
            placeholder="0%"
            value={discountText}
            onChange={(event) => onDiscountChange(event.target.value)}
            onBlur={onDiscountBlur}
          />
        </div>
        <p
          className={`type-paragraph-1-medium shrink-0 text-right sm:w-[112px] ${
            totals.discountAmount === 0 ? "text-text-tertiary" : "text-success-default"
          }`}
        >
          {/* A minus sign (U+2212), not a hyphen — it lines up with digits. */}
          {totals.discountAmount === 0 ? formatCents(0) : `−${formatCents(totals.discountAmount)}`}
        </p>
      </div>

      <div className={ROW}>
        <p className={LABEL}>Expenses (reimbursed at cost)</p>
        <p
          className={`type-paragraph-1-medium shrink-0 whitespace-nowrap text-right ${
            totals.expensesTotal === 0 ? "text-text-tertiary" : "text-text-primary"
          }`}
        >
          {formatCents(totals.expensesTotal)}
        </p>
      </div>

      <div className={ROW}>
        <p className={LABEL}>Sales tax</p>
        <div className="w-[96px] shrink-0 sm:w-[128px]">
          <Input
            hideLabel
            label="Sales tax rate"
            inputMode="decimal"
            placeholder="0%"
            value={taxText}
            onChange={(event) => onTaxChange(event.target.value)}
            onBlur={onTaxBlur}
          />
        </div>
        <p
          className={`type-paragraph-1-medium shrink-0 text-right sm:w-[112px] ${
            totals.taxAmount === 0 ? "text-text-tertiary" : "text-text-primary"
          }`}
        >
          {formatCents(totals.taxAmount)}
        </p>
      </div>

      {/* Advisory only. The rate is never applied until the user types it. */}
      {taxSuggestion && (
        <Banner tone="info" title={taxSuggestion.title}>
          {taxSuggestion.reason} Not tax advice — check with your state if unsure.
        </Banner>
      )}

      <div className="h-px w-full shrink-0 bg-border-default" />

      <div className={ROW}>
        <p className="type-paragraph-1-medium min-w-px flex-1 text-text-primary">
          Total due
        </p>
        <p className="type-heading-3-medium shrink-0 whitespace-nowrap text-right text-text-primary">
          {formatCents(totals.total)}
        </p>
      </div>
    </>
  );
}
