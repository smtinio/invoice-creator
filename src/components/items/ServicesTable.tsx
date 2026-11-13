"use client";

import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import {
  type ServiceDraft,
  normalizeMoneyText,
  serviceQuantity,
  serviceRate,
} from "@/lib/invoiceDraft";
import { formatCents, serviceLineAmount } from "@/lib/money";

/**
 * The Services table from Desktop - 4.
 *
 * Column widths come straight from the frame: description fills, Qty 88,
 * Rate 128, Amount 112, and a 40px slot for Remove. The totals rows below
 * reserve that same 52px (40 + the 12px gap) on the right so their figures
 * line up with the Amount column.
 */

interface ServicesTableProps {
  services: readonly ServiceDraft[];
  onChange: (services: ServiceDraft[]) => void;
  onAdd: () => void;
}

export function ServicesTable({ services, onChange, onAdd }: ServicesTableProps) {
  function update(id: string, patch: Partial<ServiceDraft>) {
    onChange(services.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function remove(id: string) {
    onChange(services.filter((row) => row.id !== id));
  }

  // With a single row there is nothing to remove down to, so the control is
  // hidden — matching the empty-state frame.
  const canRemove = services.length > 1;

  return (
    <>
      <h3 className="type-paragraph-1-medium w-full text-text-primary">Services</h3>

      {/* Column headings. Hidden from screen readers because each field below
          carries its own label; read out here they would be duplicated. */}
      <div
        aria-hidden="true"
        className="type-utility-1-medium hidden w-full items-center gap-[12px] text-text-secondary sm:flex"
      >
        <p className="min-w-px flex-1">Item or service</p>
        <p className="w-[88px] shrink-0">Qty</p>
        <p className="w-[128px] shrink-0">Rate</p>
        <p className="w-[112px] shrink-0 text-right">Amount</p>
        <p className="w-[40px] shrink-0" />
      </div>

      {services.map((row, index) => {
        const amount = serviceLineAmount({
          id: row.id,
          description: row.description,
          quantity: serviceQuantity(row),
          rate: serviceRate(row),
        });

        return (
          <div
            key={row.id}
            className="flex w-full flex-col items-stretch gap-[12px] sm:flex-row sm:items-center"
          >
            {/* Each cell is sized by its wrapper, never by a width class on
                Input — Input sets w-full on its own root, and two competing
                width utilities are resolved by stylesheet order rather than
                the order they appear in the class attribute. */}
            <div className="min-w-px flex-1">
              <Input
                hideLabel
                label={`Service ${index + 1} description`}
                placeholder="Describe the item or service"
                value={row.description}
                onChange={(event) => update(row.id, { description: event.target.value })}
              />
            </div>

            {/* The frame's fixed column widths total more than a phone is
                wide, so below sm the numeric fields share the row instead. */}
            <div className="flex w-full items-center gap-[12px] sm:w-auto">
              <div className="min-w-0 flex-1 sm:w-[88px] sm:flex-none">
                <Input
                  hideLabel
                  label={`Service ${index + 1} quantity`}
                  inputMode="decimal"
                  placeholder="1"
                  value={row.quantityText}
                  onChange={(event) => update(row.id, { quantityText: event.target.value })}
                />
              </div>

              <div className="min-w-0 flex-1 sm:w-[128px] sm:flex-none">
                <Input
                  hideLabel
                  label={`Service ${index + 1} rate`}
                  inputMode="decimal"
                  placeholder="$0.00"
                  value={row.rateText}
                  onChange={(event) => update(row.id, { rateText: event.target.value })}
                  onBlur={() => update(row.id, { rateText: normalizeMoneyText(row.rateText) })}
                />
              </div>

              <p
                className={`type-paragraph-1-medium shrink-0 text-right sm:w-[112px] ${
                  amount === 0 ? "text-text-tertiary" : "text-text-primary"
                }`}
              >
                <span className="sr-only">{`Service ${index + 1} amount: `}</span>
                {formatCents(amount)}
              </p>

              <IconButton
                icon="/icons/close.svg"
                label={`Remove service ${index + 1}`}
                onClick={() => remove(row.id)}
                // Kept in the layout when hidden so the columns do not shift.
                className={canRemove ? "" : "invisible"}
              />
            </div>
          </div>
        );
      })}

      <Button variant="tertiary" onClick={onAdd} className="self-start">
        {/* eslint-disable-next-line @next/next/no-img-element -- static SVG in /public */}
        <img src="/icons/plus.svg" alt="" width={16} height={16} aria-hidden="true" />
        Add service
      </Button>
    </>
  );
}
