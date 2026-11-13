"use client";

import { useId, useRef } from "react";

import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import {
  type ExpenseDraft,
  expenseAmount,
  isExpenseFilled,
  normalizeMoneyText,
} from "@/lib/invoiceDraft";
import { formatCents, sumCents } from "@/lib/money";

/**
 * The collapsible Expenses section from Desktop - 4 (collapsed) and 4b
 * (expanded).
 *
 * Collapsed by default per the brief. The summary on the right reads
 * "None added" or "N items · $total" when collapsed, and just the total when
 * expanded — both taken from the frames.
 *
 * Expense rows are description + amount only. No qty x rate: expenses are
 * reimbursed at cost.
 */

interface ExpensesSectionProps {
  expenses: readonly ExpenseDraft[];
  expanded: boolean;
  onToggle: () => void;
  onChange: (expenses: ExpenseDraft[]) => void;
  onAdd: () => void;
}

export function ExpensesSection({
  expenses,
  expanded,
  onToggle,
  onChange,
  onAdd,
}: ExpensesSectionProps) {
  const panelId = useId();

  const filled = expenses.filter(isExpenseFilled);
  const total = sumCents(expenses.map(expenseAmount));

  const summary = expanded
    ? formatCents(total)
    : filled.length === 0
      ? "None added"
      : `${filled.length} item${filled.length === 1 ? "" : "s"} · ${formatCents(total)}`;

  function update(id: string, patch: Partial<ExpenseDraft>) {
    onChange(expenses.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  return (
    <div className="flex w-full flex-col gap-[12px]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="flex w-full items-center gap-[8px] rounded-[6px] text-left sm:pr-[52px]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- static SVG in /public */}
        <img
          src={expanded ? "/icons/chevron-down.svg" : "/icons/chevron-right.svg"}
          alt=""
          width={20}
          height={20}
          aria-hidden="true"
          className="shrink-0"
        />

        <span className="flex min-w-px flex-1 flex-col gap-[2px]">
          <span className="type-paragraph-1-medium text-text-primary">Expenses</span>
          <span className="type-utility-2-regular text-text-tertiary">
            Out-of-pocket costs to be reimbursed, like materials or stock photos
          </span>
        </span>

        <span className="type-utility-1-medium shrink-0 text-right text-text-secondary">
          {summary}
        </span>
      </button>

      {expanded && (
        <div id={panelId} className="flex w-full flex-col gap-[12px]">
          {expenses.map((row, index) => (
            <ExpenseRow
              key={row.id}
              row={row}
              index={index}
              onUpdate={(patch) => update(row.id, patch)}
              onRemove={() => onChange(expenses.filter((item) => item.id !== row.id))}
              canRemove={expenses.length > 1}
            />
          ))}

          <Button variant="tertiary" onClick={onAdd} className="self-start">
            {/* eslint-disable-next-line @next/next/no-img-element -- static SVG in /public */}
            <img src="/icons/plus.svg" alt="" width={16} height={16} aria-hidden="true" />
            Add expense
          </Button>
        </div>
      )}
    </div>
  );
}

function ExpenseRow({
  row,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: {
  row: ExpenseDraft;
  index: number;
  onUpdate: (patch: Partial<ExpenseDraft>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const receiptInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex w-full flex-col items-stretch gap-[12px] sm:flex-row sm:items-center">
      {/* Sized by the wrapper, not by a width class on Input — see the note
          in ServicesTable. */}
      <div className="min-w-px flex-1">
        <Input
          hideLabel
          label={`Expense ${index + 1} description`}
          placeholder="What did you pay for?"
          value={row.description}
          onChange={(event) => onUpdate({ description: event.target.value })}
        />
      </div>

      <div className="flex w-full items-center gap-[12px] sm:w-auto">
        {/* The receipt never leaves the browser; it is held in memory for this
            session only. */}
        <input
          ref={receiptInputRef}
          type="file"
          accept="image/png,image/jpeg,application/pdf"
          className="sr-only"
          onChange={(event) => onUpdate({ receipt: event.target.files?.[0] ?? null })}
        />
        <IconButton
          icon="/icons/receipt.svg"
          label={
            row.receipt
              ? `Replace receipt for expense ${index + 1} (${row.receipt.name})`
              : `Attach a receipt to expense ${index + 1}`
          }
          onClick={() => receiptInputRef.current?.click()}
          className={row.receipt ? "bg-primary-subtle" : ""}
        />

        <div className="min-w-0 flex-1 sm:w-[112px] sm:flex-none">
          <Input
            hideLabel
            label={`Expense ${index + 1} amount`}
            inputMode="decimal"
            placeholder="$0.00"
            value={row.amountText}
            onChange={(event) => onUpdate({ amountText: event.target.value })}
            onBlur={() => onUpdate({ amountText: normalizeMoneyText(row.amountText) })}
          />
        </div>

        <IconButton
          icon="/icons/close.svg"
          label={`Remove expense ${index + 1}`}
          onClick={onRemove}
          className={canRemove ? "" : "invisible"}
        />
      </div>
    </div>
  );
}
