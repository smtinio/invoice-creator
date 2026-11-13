import { describe, expect, it } from "vitest";

import {
  EARLY_PAYMENT_TERMS,
  calculateTotals,
  discountAmount,
  earlyPaymentOutcome,
  formatBasisPoints,
  formatCents,
  formatQuantity,
  parseCents,
  parseQuantity,
  roundHalfUp,
  serviceLineAmount,
  sumCents,
  type ExpenseLine,
  type ServiceLine,
} from "./money";

const service = (
  quantity: number,
  rate: number,
  description = "Work",
): ServiceLine => ({ id: `s-${quantity}-${rate}`, description, quantity, rate });

const expense = (amount: number, taxable = false): ExpenseLine => ({
  id: `e-${amount}`,
  description: "Expense",
  amount,
  taxable,
});

describe("roundHalfUp", () => {
  it("rounds .5 away from zero in both directions", () => {
    expect(roundHalfUp(0.5)).toBe(1);
    expect(roundHalfUp(1.5)).toBe(2);
    expect(roundHalfUp(2.5)).toBe(3);
    expect(roundHalfUp(-0.5)).toBe(-1);
    expect(roundHalfUp(-1.5)).toBe(-2);
  });

  it("leaves integers alone", () => {
    expect(roundHalfUp(7)).toBe(7);
    expect(roundHalfUp(0)).toBe(0);
  });
});

describe("serviceLineAmount", () => {
  it("multiplies whole quantities", () => {
    // 3 concepts at $400
    expect(serviceLineAmount(service(3000, 40_000))).toBe(120_000);
  });

  it("handles fractional hours exactly", () => {
    // 1.5 hours at $75/hr = $112.50
    expect(serviceLineAmount(service(1500, 7_500))).toBe(11_250);
    // 0.25 hours at $75/hr = $18.75
    expect(serviceLineAmount(service(250, 7_500))).toBe(1_875);
  });

  it("rounds a half cent up rather than truncating", () => {
    // 0.5 units at $0.05 = $0.025 -> 3 cents
    expect(serviceLineAmount(service(500, 5))).toBe(3);
  });

  it("is exact where floats would not be", () => {
    // 3 x $0.10 must be 30 cents, not 30.000000000000004
    expect(serviceLineAmount(service(3000, 10))).toBe(30);
  });

  it("rejects non-integer inputs", () => {
    expect(() => serviceLineAmount(service(1.5, 7_500))).toThrow(TypeError);
    expect(() => serviceLineAmount(service(1500, 75.5))).toThrow(TypeError);
  });
});

describe("sumCents", () => {
  it("sums to zero for no lines", () => {
    expect(sumCents([])).toBe(0);
  });

  it("sums many lines exactly", () => {
    expect(sumCents([10, 10, 10, 1, 1, 1])).toBe(33);
  });
});

describe("discountAmount", () => {
  it("is zero when there is no discount", () => {
    expect(discountAmount(100_000, { kind: "none" })).toBe(0);
  });

  it("takes a percentage in basis points", () => {
    // 10% of $1,000
    expect(discountAmount(100_000, { kind: "percent", basisPoints: 1_000 })).toBe(10_000);
    // 7.5% of $1,000
    expect(discountAmount(100_000, { kind: "percent", basisPoints: 750 })).toBe(7_500);
  });

  it("rounds a fractional percentage half up", () => {
    // 10% of $10.05 = $1.005 -> $1.01
    expect(discountAmount(1_005, { kind: "percent", basisPoints: 1_000 })).toBe(101);
  });

  it("takes a flat amount as given", () => {
    expect(discountAmount(100_000, { kind: "flat", amount: 2_500 })).toBe(2_500);
  });

  it("never exceeds the services subtotal", () => {
    expect(discountAmount(5_000, { kind: "flat", amount: 9_999 })).toBe(5_000);
    expect(discountAmount(5_000, { kind: "percent", basisPoints: 20_000 })).toBe(5_000);
  });

  it("never goes negative", () => {
    expect(discountAmount(5_000, { kind: "flat", amount: -100 })).toBe(0);
    expect(discountAmount(0, { kind: "percent", basisPoints: 1_000 })).toBe(0);
  });
});

describe("calculateTotals", () => {
  it("returns zeros for an empty invoice", () => {
    const totals = calculateTotals({ services: [], expenses: [] });
    expect(totals).toMatchObject({
      servicesSubtotal: 0,
      discountAmount: 0,
      expensesTotal: 0,
      taxAmount: 0,
      total: 0,
    });
  });

  it("walks the brief's worked example", () => {
    // 3 logo concepts at $400, 4 hours of revisions at $75/hr, $60 stock photo
    const totals = calculateTotals({
      services: [service(3000, 40_000), service(4000, 7_500)],
      expenses: [expense(6_000)],
    });

    expect(totals.serviceLineAmounts).toEqual([120_000, 30_000]);
    expect(totals.servicesSubtotal).toBe(150_000);
    expect(totals.expensesTotal).toBe(6_000);
    expect(totals.total).toBe(156_000);
  });

  it("applies no tax by default", () => {
    const totals = calculateTotals({ services: [service(1000, 10_000)], expenses: [] });
    expect(totals.taxAmount).toBe(0);
    expect(totals.total).toBe(10_000);
  });

  it("discounts services but never expenses", () => {
    const totals = calculateTotals({
      services: [service(1000, 100_000)], // $1,000
      expenses: [expense(10_000)], // $100 at cost
      discount: { kind: "percent", basisPoints: 1_000 }, // 10%
    });

    expect(totals.discountAmount).toBe(10_000); // 10% of services only
    expect(totals.discountedServices).toBe(90_000);
    expect(totals.expensesTotal).toBe(10_000); // untouched
    expect(totals.total).toBe(100_000); // $900 + $100
  });

  it("taxes discounted services and leaves plain expenses untaxed", () => {
    const totals = calculateTotals({
      services: [service(1000, 100_000)], // $1,000
      expenses: [expense(10_000)], // $100, not taxable
      discount: { kind: "flat", amount: 10_000 }, // -$100
      taxBasisPoints: 1_000, // 10%
    });

    expect(totals.taxableBase).toBe(90_000); // discounted services only
    expect(totals.taxAmount).toBe(9_000);
    expect(totals.total).toBe(109_000); // 900 + 100 + 90
  });

  it("includes expenses in the tax base only when marked taxable", () => {
    const totals = calculateTotals({
      services: [service(1000, 100_000)],
      expenses: [expense(10_000, true), expense(5_000, false)],
      taxBasisPoints: 1_000,
    });

    expect(totals.taxableBase).toBe(110_000); // services + taxable expense
    expect(totals.taxAmount).toBe(11_000);
    expect(totals.expensesTotal).toBe(15_000);
    expect(totals.total).toBe(126_000);
  });

  it("rounds tax half up at the invoice level", () => {
    // 8.875% is not representable in basis points; 8.88% of $10.05
    // = 89.244 cents -> 89
    const totals = calculateTotals({
      services: [service(1000, 1_005)],
      expenses: [],
      taxBasisPoints: 888,
    });
    expect(totals.taxAmount).toBe(89);
  });

  it("stays exact across many small lines", () => {
    const services = Array.from({ length: 100 }, () => service(1000, 10)); // 100 x $0.10
    const totals = calculateTotals({ services, expenses: [] });
    expect(totals.servicesSubtotal).toBe(1_000); // exactly $10.00
    expect(totals.total).toBe(1_000);
  });

  it("zeroes out services when the discount covers the whole subtotal", () => {
    const totals = calculateTotals({
      services: [service(1000, 50_000)],
      expenses: [expense(2_000)],
      discount: { kind: "flat", amount: 50_000 },
      taxBasisPoints: 1_000,
    });

    expect(totals.discountedServices).toBe(0);
    expect(totals.taxAmount).toBe(0);
    expect(totals.total).toBe(2_000); // expenses still due
  });
});

describe("earlyPaymentOutcome", () => {
  // The Figma frame (Desktop - 4) states every figure in this scenario, so it
  // doubles as a check that the whole pipeline agrees with the design.
  const designScenario = calculateTotals({
    services: [service(3000, 40_000), service(4000, 7_500)], // 3 x $400, 4 x $75
    expenses: [expense(6_000), expense(4_500)], // $60 + $45
    discount: { kind: "percent", basisPoints: 1_000 }, // 10%
    taxBasisPoints: 0,
  });

  it("reproduces every total shown in the design", () => {
    expect(designScenario.servicesSubtotal).toBe(150_000); // $1,500.00
    expect(designScenario.discountAmount).toBe(15_000); // -$150.00
    expect(designScenario.expensesTotal).toBe(10_500); // $105.00
    expect(designScenario.taxAmount).toBe(0); // $0.00
    expect(designScenario.total).toBe(145_500); // $1,455.00
  });

  it("reproduces the design's 2/10 Net 30 figures", () => {
    const outcome = earlyPaymentOutcome(designScenario, { discountBasisPoints: 200 });
    expect(outcome.discount).toBe(2_700); // $27.00
    expect(outcome.amountIfPaidEarly).toBe(142_800); // $1,428.00
  });

  it("discounts services only, never expenses", () => {
    const totals = calculateTotals({
      services: [service(1000, 100_000)], // $1,000
      expenses: [expense(100_000)], // $1,000 of expenses
    });
    // 2% of the services alone, not of the $2,000 total.
    expect(earlyPaymentOutcome(totals, { discountBasisPoints: 200 }).discount).toBe(2_000);
  });

  it("is zero on an empty invoice", () => {
    const totals = calculateTotals({ services: [], expenses: [] });
    expect(earlyPaymentOutcome(totals, { discountBasisPoints: 200 })).toEqual({
      discount: 0,
      amountIfPaidEarly: 0,
    });
  });

  it("rounds half up", () => {
    const totals = calculateTotals({ services: [service(1000, 1_250)], expenses: [] });
    // 2% of $12.50 = 25 cents exactly
    expect(earlyPaymentOutcome(totals, { discountBasisPoints: 200 }).discount).toBe(25);
    // 1% of $12.50 = 12.5 cents -> 13
    expect(earlyPaymentOutcome(totals, { discountBasisPoints: 100 }).discount).toBe(13);
  });

  it("offers the conventional preset terms", () => {
    expect(EARLY_PAYMENT_TERMS[0]).toMatchObject({
      label: "2/10 Net 30",
      discountBasisPoints: 200,
      discountDays: 10,
      netDays: 30,
    });
  });
});

describe("formatCents", () => {
  it("formats dollars and cents", () => {
    expect(formatCents(0)).toBe("$0.00");
    expect(formatCents(5)).toBe("$0.05");
    expect(formatCents(123_456)).toBe("$1,234.56");
  });

  it("formats negatives", () => {
    expect(formatCents(-2_500)).toBe("-$25.00");
  });
});

describe("parseCents", () => {
  it("reads common money shapes", () => {
    expect(parseCents("12")).toBe(1_200);
    expect(parseCents("12.5")).toBe(1_250);
    expect(parseCents("12.34")).toBe(1_234);
    expect(parseCents("$1,234.56")).toBe(123_456);
    expect(parseCents(" 0.05 ")).toBe(5);
    expect(parseCents(".5")).toBe(50);
    expect(parseCents("12.")).toBe(1_200);
  });

  it("rounds a third decimal place half up", () => {
    expect(parseCents("0.125")).toBe(13);
  });

  it("is exact where floats drift", () => {
    expect(parseCents("1.10")).toBe(110);
    expect(parseCents("4.35")).toBe(435);
  });

  it("returns null for anything it cannot read", () => {
    expect(parseCents("")).toBeNull();
    expect(parseCents("   ")).toBeNull();
    expect(parseCents("abc")).toBeNull();
    expect(parseCents("1.2.3")).toBeNull();
    expect(parseCents("$")).toBeNull();
    expect(parseCents(".")).toBeNull();
  });
});

describe("parseQuantity", () => {
  it("reads whole and fractional quantities", () => {
    expect(parseQuantity("4")).toBe(4_000);
    expect(parseQuantity("1.5")).toBe(1_500);
    expect(parseQuantity("0.25")).toBe(250);
  });

  it("returns null for junk and for negatives", () => {
    expect(parseQuantity("")).toBeNull();
    expect(parseQuantity("two")).toBeNull();
    expect(parseQuantity("-3")).toBeNull();
  });
});

describe("formatQuantity", () => {
  it("drops trailing zeros", () => {
    expect(formatQuantity(4_000)).toBe("4");
    expect(formatQuantity(1_500)).toBe("1.5");
    expect(formatQuantity(250)).toBe("0.25");
  });
});

describe("formatBasisPoints", () => {
  it("renders a readable percentage", () => {
    expect(formatBasisPoints(0)).toBe("0%");
    expect(formatBasisPoints(1_000)).toBe("10%");
    expect(formatBasisPoints(750)).toBe("7.5%");
    expect(formatBasisPoints(888)).toBe("8.88%");
  });
});
