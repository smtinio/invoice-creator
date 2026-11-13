/**
 * Sales tax suggestions.
 *
 * The brief is firm about two things here:
 *   - the rules must come from a maintained rules table or a tax API, never
 *     from the model's general knowledge;
 *   - a suggestion is advisory. Tax is never applied until the user types it.
 *
 * Which rules source to use is still an open question, so `getTaxSuggestion`
 * has no real lookup behind it yet and returns null for every address. The
 * Banner simply does not render, which is the honest state of things: we
 * cannot suggest a rate we have no source for.
 *
 * `SAMPLE_SUGGESTION` exists so the designed banner can be seen on screen
 * while that decision is outstanding. It is not wired into the page.
 */

export interface TaxSuggestion {
  /** e.g. "Suggested from your address: no sales tax" */
  title: string;
  /** One sentence of reasoning. The "Not tax advice" line is added by the UI. */
  reason: string;
  /** The suggested rate in basis points. 0 means "no sales tax". */
  basisPoints: number;
}

export const SAMPLE_SUGGESTION: TaxSuggestion = {
  title: "Suggested from your address: no sales tax",
  reason:
    "Design services are generally exempt in California. Physical goods like prints may be taxable.",
  basisPoints: 0,
};

/**
 * Returns a suggested rate for a business address, or null when we have no
 * basis for one.
 *
 * Always null today. When a rules source is chosen, this is the only function
 * that needs to change.
 */
export function getTaxSuggestion(address: string | null): TaxSuggestion | null {
  void address;
  return null;
}
