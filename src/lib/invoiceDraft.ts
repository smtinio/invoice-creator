/**
 * The shape of the items step while it is being edited.
 *
 * Money and quantities live here as the raw strings the user typed, not as
 * numbers. Parsing on every keystroke would fight the user — "12." and "0."
 * are valid things to be in the middle of typing but not valid numbers. The
 * text is the source of truth for the field; `money.ts` turns it into cents
 * for the arithmetic.
 *
 * Session only. Nothing in here is persisted or sent anywhere.
 */

import {
  type Cents,
  type ExpenseLine,
  type Milliunits,
  type ServiceLine,
  formatCents,
  parseCents,
  parseQuantity,
} from "./money";

export interface ServiceDraft {
  id: string;
  description: string;
  /** Raw text, e.g. "3" or "1.5". */
  quantityText: string;
  /** Raw text, e.g. "400" or "$400.00". */
  rateText: string;
}

export interface ExpenseDraft {
  id: string;
  description: string;
  amountText: string;
  /**
   * Receipt image, held in memory for this session only. The brief lists
   * receipt attachments as a V1.1 idea but the design includes the control —
   * see DESIGN-NOTES.
   */
  receipt: File | null;
}

/**
 * Row ids, used only as React keys and for finding a row to update — they are
 * never rendered into the DOM or persisted.
 *
 * A counter rather than `Math.random()` or `crypto.randomUUID()`: those are
 * unstable values, so calling one while a page is prerendering gives the
 * server and the browser different answers. Next refuses to build a page that
 * does it, and it is right to — that is a hydration mismatch waiting to
 * happen. A counter renders the same sequence in both places.
 */
let idCounter = 0;

export function newId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export function emptyService(): ServiceDraft {
  return { id: newId("service"), description: "", quantityText: "", rateText: "" };
}

export function emptyExpense(): ExpenseDraft {
  return { id: newId("expense"), description: "", amountText: "", receipt: null };
}

/** An empty quantity means 1 — the placeholder in the design says so. */
export const DEFAULT_QUANTITY: Milliunits = 1_000;

export function serviceQuantity(draft: ServiceDraft): Milliunits {
  if (draft.quantityText.trim() === "") return DEFAULT_QUANTITY;
  return parseQuantity(draft.quantityText) ?? 0;
}

export function serviceRate(draft: ServiceDraft): Cents {
  return parseCents(draft.rateText) ?? 0;
}

export function expenseAmount(draft: ExpenseDraft): Cents {
  return parseCents(draft.amountText) ?? 0;
}

/** Drafts the totals engine can consume. */
export function toServiceLines(drafts: readonly ServiceDraft[]): ServiceLine[] {
  return drafts.map((draft) => ({
    id: draft.id,
    description: draft.description,
    quantity: serviceQuantity(draft),
    rate: serviceRate(draft),
  }));
}

export function toExpenseLines(drafts: readonly ExpenseDraft[]): ExpenseLine[] {
  return drafts.map((draft) => ({
    id: draft.id,
    description: draft.description,
    amount: expenseAmount(draft),
  }));
}

/** A row the user has actually put something in. */
export function isServiceFilled(draft: ServiceDraft): boolean {
  return draft.description.trim() !== "" || draft.rateText.trim() !== "";
}

export function isExpenseFilled(draft: ExpenseDraft): boolean {
  return draft.description.trim() !== "" || draft.amountText.trim() !== "";
}

/**
 * Tidies a money field when the user leaves it: "400" becomes "$400.00".
 * Unparseable text is left exactly as typed so nothing is silently discarded.
 */
export function normalizeMoneyText(raw: string): string {
  if (raw.trim() === "") return "";
  const cents = parseCents(raw);
  return cents === null ? raw : formatCents(cents);
}

/** Percentages are stored as text too, and tidied the same way. */
export function parseBasisPoints(raw: string): number | null {
  const cleaned = raw.trim().replace(/[%\s]/g, "");
  if (cleaned === "" || !/^\d*\.?\d*$/.test(cleaned) || !/\d/.test(cleaned)) {
    return null;
  }
  return Math.round(Number(cleaned) * 100);
}

export function normalizePercentText(raw: string): string {
  if (raw.trim() === "") return "";
  const basisPoints = parseBasisPoints(raw);
  if (basisPoints === null) return raw;
  return `${Number((basisPoints / 100).toFixed(2))}%`;
}
