# CLAUDE.md — SeanKT Dueday (working name: InvoiceMe)

> Project brief for Claude Code. Read this before building anything. The **PII rules in Section 6 are hard requirements**. Follow them in every change and every refactor.

---

## 1. What we're building

**An AI-assisted, no-account invoice generator for freelancers.** You describe the work you did in plain language, AI drafts the line items, you review and edit them, and the app does the math and produces a polished PDF.

- Each invoice is a **fresh, one-time session**. Nothing about invoices or clients is saved.
- The app remembers only the **business profile** (identity, logo, payment methods, next invoice number), stored in the browser.
- **Target user:** freelancers, including trades and contractors.
- **Purpose:** a learning project and a portfolio piece. Scope is small on purpose so it ships.

**One sentence:** Describe your work, get a polished invoice.

### About the developer
Sean is a product designer who is **fairly new to development**. When you make a decision, explain it briefly in plain language. Prefer simple, conventional solutions over clever ones. Don't add dependencies without saying why.

---

## 2. Core flow (4-step stepper)

1. **Your details** (first visit only): business info, logo, then payment methods.
2. **Items & services**: describe the work (AI) or enter it manually. Services, expenses, discount, tax and total all live on this step.
3. **Customer details**: client name/email/address, invoice number, dates, notes.
4. **Send & download**: full-size PDF preview and download. The user sends it themselves; no email delivery in V1.

Refreshing or choosing "Start new invoice" starts a new invoice. The business profile persists.

---

## 3. Building from Figma

The designs are in Figma and use Sean's **Moderna Library** design system. Screens will be provided one at a time.

**Workflow for each screen:**
1. Pull the frame using the Figma MCP (`get_design_context`, `get_screenshot`, `get_variable_defs`) and look at the screenshot before writing code.
2. **Match the design.** Use spacing, type, color and radius from the Figma variables/tokens. Don't eyeball values or swap in defaults.
3. Put design tokens in one place (CSS variables or a theme file) named after the Moderna Library tokens, so Figma and code stay in sync.
4. Build reusable UI components (Button, Input, Card, Stepper, Toggle, etc.) once and reuse them. Check for an existing component before making a new one.
5. If the Figma frame is missing a state (hover, focus, error, empty, loading, disabled, mobile), **ask or flag it**. Don't invent a new visual style.
6. After building, compare your result against the Figma screenshot and list any differences.

**Chosen directions:**
- **Desktop - 4**: Items step, expenses collapsed ✅
- **Desktop - 4b**: Items step, expenses expanded ✅
- **Desktop - 5**: modal version of the items step ❌ *explored but not chosen, don't build it*

**Platform:** desktop-first, fully responsive down to mobile.

---

## 4. Screens & requirements

### 4.1 Your details (onboarding + profile, persisted)
- Business/display name, your name (optional), email, phone (optional), address (optional)
- **Logo upload** (required feature), shown on the PDF
- Payment methods, all optional; only filled-in ones show on the PDF:
  - Bank details
  - Venmo handle
  - Zelle contact (with optional QR code image upload)
  - PayPal link
- Default payment terms (optional)
- Last-used invoice number (for auto-increment)
- Copy: **"Saved only in this browser. Nothing is uploaded."**
- Editable at any time from Settings

### 4.2 Items & services (session only)
- Toggle above the editor: **"Describe it" / "Enter manually"**. Inline, **no modal**.
- **Services**: description, quantity, rate, amount; add / edit / remove
- **Expenses**: a separate, **collapsible** section under Services in the same card
  - **Collapsed by default**; header shows `N items · $total`
  - Rows: description + amount only (no qty × rate)
  - Reimbursed at cost
- Services subtotal
- **Discount**: optional, % or flat, **applies to services only** (never expenses). Manual only, never automatic.
- **Tax**: single rate per invoice, default 0%. Show a suggestion banner with the suggested rate, a short reason, and "Not tax advice". The user must accept or edit it. **Never apply tax silently.**
- Total due
- Back / Continue

### 4.3 Customer details (session only)
- Client name, email, address
- Invoice number: pre-filled as last used + 1, editable
- Issue date (defaults to today)
- Due date presets: **Due on receipt, Net 15, Net 30, Custom date**
- Notes / payment terms
- "Start new invoice" with a warning if there's unsaved work

### 4.4 Send & download
- Live, full-size PDF preview and download
- One polished template: logo, business details, client details, invoice number, dates
- Services and Expenses as separate sections; subtotal, discount, expenses, tax, total
- Payment methods (filled ones only), including QR image
- Notes / terms
- Must handle long descriptions, many line items, and page breaks

### 4.5 Settings / Profile
- Edit profile, payment methods, logo
- **"Clear my data"**: wipes the stored profile and images completely
- Optional: export/import profile as a file (may not make V1)

---

## 5. AI drafting

- Free-text "describe the work" input (Prompt Input component)
- Example: *"3 logo concepts at $400 each, plus 4 hours of revisions at $75/hr, also bought a $60 stock photo"* → 2 service rows + 1 expense row
- AI returns **structured JSON rows**, each tagged `service` or `expense`, with description, quantity, unit price/amount, and missing-info flags
- Results land in the **same editor** used for manual entry
- Missing info is flagged inline (e.g. "no rate given"). **AI never guesses money.**
- **AI never sets** totals, discount, tax, or invoice numbers. The app does all math.
- Manual entry must work fully without AI
- Graceful failure state when AI is unavailable
- Disclaimer under the input:
  > "Your description is sent to Claude to draft line items, so leave out client contact or bank details. SeanKT Dueday is AI and can make mistakes. Please double-check your invoice."
- Validate the response shape (e.g. with Zod) before showing anything

---

## 6. PII & privacy (HARD RULES)

All profile, client and payment data is PII.

**What may leave the browser**
1. **Only the "describe the work" text** is sent to the AI endpoint, and **only when the user clicks to draft**. Nothing automatic or in the background.
2. **Never send** business profile data, client fields, payment methods (bank, Venmo/Zelle/PayPal, QR images), logo, invoice number, or manually typed line items.
3. **Scrub before sending.** A small, unit-tested `redact()` module replaces emails → `[email]`, phone numbers → `[phone]`, and digit strings of 8+ → `[number]`. Run the same scrub **again server-side**.

**Serverless AI endpoint**
4. API key lives in an **environment variable only**. Never in client code, the build output, or error messages.
5. **Stateless pass-through.** No database, no files, no caching of request content.
6. **No content logging.** Never log request/response bodies, prompts, or model output. Log only timestamp, status, latency, and error type.
7. **Rate-limit per IP** and cap the description length.
8. **Minimal system prompt:** ask only for row extraction. Never ask the model to echo or infer names, contact details or identities.

**In the browser**
9. Profile data lives in **IndexedDB** on the device. No analytics, error tracking, or session replay that captures form contents.
10. **No PII** in URLs, `console.log`, or third-party requests (including font/CDN calls).
11. "Clear my data" fully removes the stored profile and images.

---

## 7. Money & calculations

- **Integer cents everywhere.** Never use floats for money.
- Calculations live in **plain modules** (e.g. `lib/money.ts`), not inside UI components, and **must have tests**.

**Calculation order:**
1. Each service line = qty × rate, rounded to the cent
2. Services subtotal = sum of service lines
3. Discount applies to the services subtotal only
4. Expenses total = sum of expense amounts (at cost)
5. Tax = rate × (discounted services + any expenses marked taxable), rounded half-up. Expenses aren't taxable unless the user marks them.
6. Total = discounted services + expenses + tax

**Tax suggestion:** rules must come from a maintained rules table or a tax API, **not** from the AI's general knowledge. Suggestions are advisory only. Many states tax based on the client's location, so the suggestion may need to update after customer details are entered.

**Currency:** USD only.

---

## 8. Tech stack

Not finalized yet. Unless Sean says otherwise, default to:

| Concern | Default | Why |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | One project holds the UI and the serverless AI route; deploys easily to Vercel |
| Styling | CSS variables for Moderna tokens + Tailwind or CSS Modules | Tokens stay in one place |
| Local storage | IndexedDB via `idb-keyval` or `idb`, behind a small `lib/storage.ts` module | Holds images; simple API |
| Validation | Zod | Validates AI responses and forms |
| PDF | `@react-pdf/renderer` | Same PDF for preview and download |
| Tests | Vitest | Money and `redact()` modules |
| AI | Claude API, called only from `app/api/draft/route.ts` | Keeps the key server-side |
| Hosting | Vercel | Check that request bodies aren't logged |

Confirm with Sean before changing these.

---

## 9. Build order

1. **Foundation:** setup, routing, design tokens, money module + tests, `redact()` + tests
2. **Your details:** form, logo + QR upload, IndexedDB, onboarding flow
3. **Items & services (manual):** services, collapsible expenses, discount, tax suggestion, totals
4. **Customer details:** client info, date presets, invoice number
5. **PDF:** template, live preview, download, page-break testing
6. **AI drafting:** serverless endpoint (stateless, no body logging, rate-limited, server-side redaction), structured output, failure states
7. **Polish:** responsive, empty/error states, accessibility pass, privacy copy, deploy
8. **Portfolio:** case study (AI review moment, tax suggestion, privacy approach)

---

## 10. Out of scope (don't build)

- Saving invoices or clients; invoice list or dashboard
- Draft/Sent/Paid/Overdue statuses, payment tracking
- Accounts, cloud sync, hosted database (no Supabase here)
- Emailing invoices, payment processing, reminders
- Multiple templates, multi-currency, recurring invoices
- Fully autonomous agent flows
- Automatic discounts
- The modal version of the items step (Desktop - 5)

**V1.1 ideas (not now):** receipt attachments on expenses, expense markup line, per-expense "taxable" toggle UI.

---

## 11. Definition of done

A freelancer can:
- [ ] Set up their profile once and see it after a refresh
- [ ] Upload a logo and payment QR code
- [ ] Describe their work and get editable service and expense rows
- [ ] Build an invoice manually without AI
- [ ] Add expenses that aren't discounted
- [ ] Get correct totals with discount and tax
- [ ] See a tax suggestion with a reason, and accept or change it
- [ ] Pick a due-date preset or custom date
- [ ] Preview and download a professional PDF with logo and payment methods
- [ ] Use it comfortably on desktop and mobile

Privacy checks:
- [ ] Network tab shows only the scrubbed description is sent, only on user action
- [ ] Serverless logs contain no prompt or response content
- [ ] API key is absent from the client bundle
- [ ] "Clear my data" fully removes the stored profile and images

---

## 12. Open questions (ask, don't assume)

- Final product name (Dueday in designs, not trademark-checked)
- Which Claude model to use for drafting
- Final framework and PDF approach (defaults above)
- Tax rules source (static table vs. tax API)
- Payment methods placement in onboarding (likely a second screen under "Your details")
- Whether profile export/import makes V1
