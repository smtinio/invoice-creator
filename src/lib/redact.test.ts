import { describe, expect, it } from "vitest";

import {
  MAX_DESCRIPTION_LENGTH,
  hasRedactions,
  prepareDescriptionForAi,
  redact,
  redactText,
} from "./redact";

describe("redact: emails", () => {
  it("masks a plain address", () => {
    expect(redactText("invoice sam@example.com please")).toBe(
      "invoice [email] please",
    );
  });

  it("masks addresses with dots, plus tags and subdomains", () => {
    expect(redactText("sam.t+invoices@mail.example.co.uk")).toBe("[email]");
    expect(redactText("a_b-c%d@sub.domain.io")).toBe("[email]");
  });

  it("masks several addresses and counts them", () => {
    const result = redact("a@b.com and c@d.org");
    expect(result.text).toBe("[email] and [email]");
    expect(result.counts.email).toBe(2);
  });

  it("leaves text with an @ but no address alone", () => {
    expect(redactText("design @ 50/hr")).toBe("design @ 50/hr");
  });
});

describe("redact: phone numbers", () => {
  it("masks common US formats", () => {
    expect(redactText("call 555-123-4567")).toBe("call [phone]");
    expect(redactText("call (555) 123-4567")).toBe("call [phone]");
    expect(redactText("call 555.123.4567")).toBe("call [phone]");
    expect(redactText("call 555 123 4567")).toBe("call [phone]");
  });

  it("masks numbers with a country code", () => {
    expect(redactText("call +1 555-123-4567")).toBe("call [phone]");
    expect(redactText("call +1 (555) 123-4567")).toBe("call [phone]");
  });

  it("counts phone replacements", () => {
    const result = redact("555-123-4567 or 555-765-4321");
    expect(result.counts.phone).toBe(2);
    expect(result.text).toBe("[phone] or [phone]");
  });
});

describe("redact: long digit strings", () => {
  it("masks a run of 8 or more digits", () => {
    expect(redactText("acct 12345678")).toBe("acct [number]");
    expect(redactText("routing 123456789012")).toBe("routing [number]");
  });

  it("masks a digit run broken up by separators", () => {
    expect(redactText("card 1234-5678")).toBe("card [number]");
  });

  it("leaves short numbers alone so money and quantities survive", () => {
    expect(redactText("3 concepts at $400 each")).toBe("3 concepts at $400 each");
    expect(redactText("4 hours at $75/hr")).toBe("4 hours at $75/hr");
    expect(redactText("1234567")).toBe("1234567"); // 7 digits, under the limit
  });

  it("masks a bare 10-digit run that is not formatted as a phone number", () => {
    expect(redactText("5551234567")).toBe("[number]");
  });
});

describe("redact: precedence between rules", () => {
  it("masks an email containing digits as an email, not a number", () => {
    const result = redact("sam12345678@example.com");
    expect(result.text).toBe("[email]");
    expect(result.counts.email).toBe(1);
    expect(result.counts.number).toBe(0);
  });

  it("prefers the phone rule over the digit rule for formatted numbers", () => {
    const result = redact("555-123-4567");
    expect(result.counts.phone).toBe(1);
    expect(result.counts.number).toBe(0);
  });
});

describe("redact: the realistic case", () => {
  it("keeps the billable facts and drops the contact details", () => {
    const result = redact(
      "3 logo concepts at $400 each, plus 4 hours of revisions at $75/hr, " +
        "also bought a $60 stock photo. Bill sam@acme.com, call 555-123-4567, " +
        "acct 000123456789.",
    );

    expect(result.text).toBe(
      "3 logo concepts at $400 each, plus 4 hours of revisions at $75/hr, " +
        "also bought a $60 stock photo. Bill [email], call [phone], " +
        "acct [number].",
    );
    expect(result.counts).toEqual({ email: 1, phone: 1, number: 1 });
  });
});

describe("redact: edge cases", () => {
  it("handles an empty string", () => {
    expect(redact("")).toEqual({
      text: "",
      counts: { email: 0, phone: 0, number: 0 },
    });
  });

  it("returns empty for a non-string, rather than throwing", () => {
    // The server route receives untrusted JSON, so this must not crash.
    expect(redact(undefined as unknown as string).text).toBe("");
    expect(redact(null as unknown as string).text).toBe("");
    expect(redact(42 as unknown as string).text).toBe("");
  });

  it("leaves clean text untouched", () => {
    const clean = "Built a landing page and two illustrations.";
    expect(redactText(clean)).toBe(clean);
  });

  it("is idempotent — scrubbing twice changes nothing more", () => {
    // The server re-runs the scrub on already-scrubbed client text.
    const once = redactText("sam@example.com 555-123-4567 12345678");
    expect(redactText(once)).toBe(once);
  });
});

describe("prepareDescriptionForAi", () => {
  it("trims surrounding whitespace", () => {
    expect(prepareDescriptionForAi("  some work  ").text).toBe("some work");
  });

  it("caps the length", () => {
    const long = "a".repeat(MAX_DESCRIPTION_LENGTH + 500);
    expect(prepareDescriptionForAi(long).text).toHaveLength(MAX_DESCRIPTION_LENGTH);
  });

  it("scrubs before truncating, so a cut cannot expose half an address", () => {
    const padding = "a".repeat(MAX_DESCRIPTION_LENGTH - 5);
    const result = prepareDescriptionForAi(`${padding} sam@example.com`);
    expect(result.text).not.toContain("sam@");
    expect(result.counts.email).toBe(1);
  });
});

describe("hasRedactions", () => {
  it("is false when nothing was replaced", () => {
    expect(hasRedactions({ email: 0, phone: 0, number: 0 })).toBe(false);
  });

  it("is true when any kind was replaced", () => {
    expect(hasRedactions({ email: 1, phone: 0, number: 0 })).toBe(true);
    expect(hasRedactions({ email: 0, phone: 0, number: 2 })).toBe(true);
  });
});
