/**
 * Money and invoice math.
 *
 * Every amount in this app is an integer number of **cents**. Floats are never
 * used for money: 0.1 + 0.2 !== 0.3 in binary floating point, and that error
 * compounds across line items. USD only.
 *
 * This module is pure — no React, no DOM. The UI reads values from here and
 * never does arithmetic of its own.
 */

/** An integer count of cents. 1234 means $12.34. */
export type Cents = number;

/**
 * A quantity, stored as thousandths of a unit so fractional hours survive
 * exactly. 1500 means 1.5 units. Integer-only, same reasoning as Cents.
 */
export type Milliunits = number;

export const MILLIUNITS_PER_UNIT = 1000;

export interface ServiceLine {
  id: string;
  description: string;
  /** Thousandths of a unit, e.g. 4 hours = 4000. */
  quantity: Milliunits;
  /** Price for one whole unit. */
  rate: Cents;
}

export interface ExpenseLine {
  id: string;
  description: string;
  /** Reimbursed at cost — there is no qty x rate for expenses. */
  amount: Cents;
  /**
   * Expenses are not taxable unless the user explicitly says so.
   * No UI for this in V1; the field exists so the math is already correct.
   */
  taxable?: boolean;
}

export type Discount =
  | { kind: "none" }
  /** Basis points, so 7.5% is 750. Avoids a float percentage. */
  | { kind: "percent"; basisPoints: number }
  | { kind: "flat"; amount: Cents };

export interface InvoiceTotals {
  /** Per-service-line amounts, in the same order as the input. */
  serviceLineAmounts: Cents[];
  servicesSubtotal: Cents;
  /** Always >= 0, and never more than servicesSubtotal. */
  discountAmount: Cents;
  discountedServices: Cents;
  expensesTotal: Cents;
  taxableBase: Cents;
  taxAmount: Cents;
  total: Cents;
}

/** Rounds half away from zero, unlike Math.round which rounds -0.5 up to -0. */
export function roundHalfUp(value: number): number {
  return value < 0 ? -Math.round(-value) : Math.round(value);
}

function assertInteger(value: number, label: string): void {
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    throw new TypeError(`${label} must be an integer, got ${value}`);
  }
}

/** qty x rate, rounded to the cent. */
export function serviceLineAmount(line: ServiceLine): Cents {
  assertInteger(line.quantity, "quantity");
  assertInteger(line.rate, "rate");
  return roundHalfUp((line.quantity * line.rate) / MILLIUNITS_PER_UNIT);
}

export function sumCents(amounts: readonly Cents[]): Cents {
  return amounts.reduce((runningTotal, amount) => {
    assertInteger(amount, "amount");
    return runningTotal + amount;
  }, 0);
}

/**
 * The discount applies to the services subtotal only — never to expenses,
 * which are passed through at cost. Clamped so it can't exceed the subtotal
 * or turn negative.
 */
export function discountAmount(servicesSubtotal: Cents, discount: Discount): Cents {
  if (discount.kind === "none") return 0;

  const raw =
    discount.kind === "percent"
      ? roundHalfUp((servicesSubtotal * discount.basisPoints) / 10_000)
      : discount.amount;

  return Math.min(Math.max(raw, 0), Math.max(servicesSubtotal, 0));
}

/**
 * The whole invoice, in the order laid out in the brief:
 * line amounts -> services subtotal -> discount -> expenses -> tax -> total.
 *
 * @param taxBasisPoints single rate for the invoice, e.g. 8.875% = 888 (rounded
 *   to the nearest basis point by the caller). Defaults to 0 — tax is never
 *   applied unless the user has accepted a rate.
 */
export function calculateTotals(input: {
  services: readonly ServiceLine[];
  expenses: readonly ExpenseLine[];
  discount?: Discount;
  taxBasisPoints?: number;
}): InvoiceTotals {
  const discount = input.discount ?? { kind: "none" };
  const taxBasisPoints = input.taxBasisPoints ?? 0;

  const serviceLineAmounts = input.services.map(serviceLineAmount);
  const servicesSubtotal = sumCents(serviceLineAmounts);

  const discountCents = discountAmount(servicesSubtotal, discount);
  const discountedServices = servicesSubtotal - discountCents;

  const expenseAmounts = input.expenses.map((expense) => expense.amount);
  const expensesTotal = sumCents(expenseAmounts);
  const taxableExpenses = sumCents(
    input.expenses.filter((expense) => expense.taxable).map((expense) => expense.amount),
  );

  const taxableBase = discountedServices + taxableExpenses;
  const taxAmount = roundHalfUp((taxableBase * taxBasisPoints) / 10_000);

  return {
    serviceLineAmounts,
    servicesSubtotal,
    discountAmount: discountCents,
    discountedServices,
    expensesTotal,
    taxableBase,
    taxAmount,
    total: discountedServices + expensesTotal + taxAmount,
  };
}

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/** 123456 -> "$1,234.56" */
export function formatCents(amount: Cents): string {
  return usdFormatter.format(amount / 100);
}

/**
 * Parses what someone types into a money field: "1,234.56", "$12", ".5", "12.".
 * Returns null for anything it can't read, so callers decide how to show the
 * error rather than silently getting a 0.
 */
export function parseCents(raw: string): Cents | null {
  const cleaned = raw.trim().replace(/[$,\s]/g, "");
  if (cleaned === "" || !/^-?\d*\.?\d*$/.test(cleaned) || !/\d/.test(cleaned)) {
    return null;
  }
  return roundHalfUp(Number(cleaned) * 100);
}

/** Parses a quantity like "1.5" or "4" into milliunits. */
export function parseQuantity(raw: string): Milliunits | null {
  const cleaned = raw.trim().replace(/[,\s]/g, "");
  if (cleaned === "" || !/^\d*\.?\d*$/.test(cleaned) || !/\d/.test(cleaned)) {
    return null;
  }
  return roundHalfUp(Number(cleaned) * MILLIUNITS_PER_UNIT);
}

/** 4000 -> "4", 1500 -> "1.5" */
export function formatQuantity(quantity: Milliunits): string {
  const units = quantity / MILLIUNITS_PER_UNIT;
  return String(Number(units.toFixed(3)));
}

/** 888 -> "8.875%" is not representable; basis points give "8.88%". */
export function formatBasisPoints(basisPoints: number): string {
  return `${Number((basisPoints / 100).toFixed(2))}%`;
}
