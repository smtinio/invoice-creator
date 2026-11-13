/**
 * Scrubs personal data out of the free-text "describe the work" string before
 * it leaves the browser.
 *
 * This is the only text the app ever sends to the AI endpoint, and it runs
 * through here first. The server runs the same function again on the way in —
 * a client-side scrub alone is not a guarantee, since the request body can be
 * anything.
 *
 * Deliberately conservative: it would rather mask a harmless number than let
 * an account number through. The replacements are visible to the user so they
 * can see what was removed.
 *
 * Pure and dependency-free so it can run identically in the browser and in the
 * serverless route.
 */

export const REDACTIONS = {
  email: "[email]",
  phone: "[phone]",
  number: "[number]",
} as const;

export interface RedactResult {
  text: string;
  /** How many substitutions were made, by kind. For UI hints, never logged with content. */
  counts: { email: number; phone: number; number: number };
}

/** Cap on the description length, enforced on both sides of the wire. */
export const MAX_DESCRIPTION_LENGTH = 2_000;

// Local part then domain. Intentionally loose — a near-miss address is still
// something we do not want to transmit.
const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

// North-American-style phone numbers: optional +1, optional parens, and
// separators of space, dot or dash. Requires a separator or parens somewhere so
// that a bare 10-digit run falls through to the digit-string rule instead.
const PHONE_PATTERN =
  /(?:\+?\d{1,3}[\s.-]*)?(?:\(\d{3}\)|\d{3})[\s.-]+\d{3}[\s.-]+\d{4}\b/g;

// Any run of 8 or more digits: account numbers, routing numbers, long IDs.
// Separators inside the run are ignored, so 1234-5678 counts as 8 digits.
const LONG_DIGIT_PATTERN = /\d(?:[\s.-]*\d){7,}/g;

/**
 * Returns the scrubbed text plus a count of what was replaced.
 *
 * Order matters: emails first (they can contain digits), then phone numbers
 * (more specific), then any remaining long digit run.
 */
export function redact(input: string): RedactResult {
  const counts = { email: 0, phone: 0, number: 0 };

  if (typeof input !== "string") {
    return { text: "", counts };
  }

  let text = input;

  text = text.replace(EMAIL_PATTERN, () => {
    counts.email += 1;
    return REDACTIONS.email;
  });

  text = text.replace(PHONE_PATTERN, () => {
    counts.phone += 1;
    return REDACTIONS.phone;
  });

  text = text.replace(LONG_DIGIT_PATTERN, () => {
    counts.number += 1;
    return REDACTIONS.number;
  });

  return { text, counts };
}

/** Convenience wrapper for callers that only need the scrubbed string. */
export function redactText(input: string): string {
  return redact(input).text;
}

/**
 * What actually goes on the wire: trimmed, length-capped, and scrubbed.
 * Truncating before scrubbing would be wrong — it could cut an email in half
 * and leave the first part visible — so the scrub runs first.
 */
export function prepareDescriptionForAi(input: string): RedactResult {
  const { text, counts } = redact(input);
  return { text: text.trim().slice(0, MAX_DESCRIPTION_LENGTH), counts };
}

/** True if anything was removed, for the "we removed X" hint under the input. */
export function hasRedactions(counts: RedactResult["counts"]): boolean {
  return counts.email > 0 || counts.phone > 0 || counts.number > 0;
}
