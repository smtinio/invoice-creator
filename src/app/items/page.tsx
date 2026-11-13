"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AppHeader } from "@/components/AppHeader";
import { EarlyPaymentCard } from "@/components/items/EarlyPaymentCard";
import { ExpensesSection } from "@/components/items/ExpensesSection";
import { ServicesTable } from "@/components/items/ServicesTable";
import { TotalsPanel } from "@/components/items/TotalsPanel";
import { Button } from "@/components/ui/Button";
import { PromptInput } from "@/components/ui/PromptInput";
import { TabPanel, Tabs, type TabDefinition } from "@/components/ui/Tabs";
import {
  type ExpenseDraft,
  type ServiceDraft,
  emptyExpense,
  emptyService,
  isServiceFilled,
  normalizePercentText,
  parseBasisPoints,
  toExpenseLines,
  toServiceLines,
} from "@/lib/invoiceDraft";
import { EARLY_PAYMENT_TERMS, calculateTotals } from "@/lib/money";
import { getTaxSuggestion } from "@/lib/taxSuggestion";

/**
 * Step 2 — "Items & services".
 *
 * Figma: Desktop - 3 (describe it), Desktop - 4 (manual, empty and filled),
 * Desktop - 4b (expenses expanded).
 *
 * Session state only. Nothing here is saved, and the Describe-it tab does not
 * send anything anywhere yet — it is the front end only.
 */

type ItemsTabId = "describe" | "manual";

const TABS: readonly TabDefinition<ItemsTabId>[] = [
  { id: "describe", label: "Describe it" },
  { id: "manual", label: "Enter manually" },
];

export default function ItemsPage() {
  const router = useRouter();

  const [tab, setTab] = useState<ItemsTabId>("describe");
  const [prompt, setPrompt] = useState("");

  const [services, setServices] = useState<ServiceDraft[]>(() => [emptyService()]);
  const [expenses, setExpenses] = useState<ExpenseDraft[]>(() => [emptyExpense()]);
  // Collapsed by default, per the brief.
  const [expensesExpanded, setExpensesExpanded] = useState(false);

  const [discountText, setDiscountText] = useState("");
  const [taxText, setTaxText] = useState("");

  const [earlyPaymentEnabled, setEarlyPaymentEnabled] = useState(false);
  const [earlyPaymentTermsId, setEarlyPaymentTermsId] = useState(
    EARLY_PAYMENT_TERMS[0].id,
  );

  // All arithmetic goes through money.ts; this just feeds it the drafts.
  const totals = useMemo(
    () =>
      calculateTotals({
        services: toServiceLines(services),
        expenses: toExpenseLines(expenses),
        discount: (() => {
          const basisPoints = parseBasisPoints(discountText);
          return basisPoints === null || basisPoints === 0
            ? { kind: "none" as const }
            : { kind: "percent" as const, basisPoints };
        })(),
        taxBasisPoints: parseBasisPoints(taxText) ?? 0,
      }),
    [services, expenses, discountText, taxText],
  );

  // Null until a rules source is chosen — see lib/taxSuggestion.ts.
  const taxSuggestion = getTaxSuggestion(null);

  const hasAnyService = services.some(isServiceFilled);

  return (
    <div className="min-h-dvh bg-surface-default pb-[80px]">
      <AppHeader currentStep={2} />

      <main className="mx-auto w-full max-w-[846px] px-[24px]">
        <div className="mt-[64px] flex flex-col items-center gap-[24px]">
          <div className="flex w-full flex-col items-center gap-[12px] text-center text-text-primary">
            <h1 className="type-display-3-regular w-full">Second,</h1>
            <p className="type-heading-1-regular w-full">What did you do?</p>
          </div>

          <Tabs
            tabs={TABS}
            selected={tab}
            onSelect={setTab}
            label="How would you like to add your work?"
          />
        </div>

        {tab === "describe" ? (
          <TabPanel tabId="describe" className="mt-[64px]">
            <PromptInput
              label="Describe the work you did"
              value={prompt}
              onChange={setPrompt}
              placeholder="Ask anything"
              disclaimer={
                <>
                  Your description is sent to Anthropic Claude to draft line
                  items, for privacy purposes, please leave out client contact
                  or bank details. SeanKT Dueday is AI and can make mistakes.
                  Please double-check your invoice.
                </>
              }
            />
          </TabPanel>
        ) : (
          <TabPanel tabId="manual" className="mt-[32px]">
            <div className="flex w-full flex-col items-start gap-[12px] rounded-[16px] border border-border-default bg-surface-default p-[16px] sm:p-[24px]">
              <ServicesTable
                services={services}
                onChange={setServices}
                onAdd={() => setServices((rows) => [...rows, emptyService()])}
              />

              <div className="h-px w-full shrink-0 bg-border-default" />

              <ExpensesSection
                expenses={expenses}
                expanded={expensesExpanded}
                onToggle={() => setExpensesExpanded((open) => !open)}
                onChange={setExpenses}
                onAdd={() => setExpenses((rows) => [...rows, emptyExpense()])}
              />

              <div className="h-px w-full shrink-0 bg-border-default" />

              <TotalsPanel
                totals={totals}
                discountText={discountText}
                onDiscountChange={setDiscountText}
                onDiscountBlur={() => setDiscountText(normalizePercentText(discountText))}
                taxText={taxText}
                onTaxChange={setTaxText}
                onTaxBlur={() => setTaxText(normalizePercentText(taxText))}
                taxSuggestion={taxSuggestion}
              />

              <EarlyPaymentCard
                enabled={earlyPaymentEnabled}
                onEnabledChange={setEarlyPaymentEnabled}
                termsId={earlyPaymentTermsId}
                onTermsChange={setEarlyPaymentTermsId}
                totals={totals}
              />
            </div>

            {/* The Back / Continue row belongs to the manual frames only; the
                Describe-it frame has no actions. See DESIGN-NOTES. */}
            <div className="mt-[32px] flex w-full items-center justify-between gap-[16px]">
              <Button variant="outline" onClick={() => router.push("/")}>
                Back
              </Button>

              {/* Disabled until there is at least one real service, matching
                  the empty-state frame. Step 3 does not exist yet. */}
              <Button disabled={!hasAnyService}>Continue to customer details</Button>
            </div>
          </TabPanel>
        )}
      </main>
    </div>
  );
}
