# German invoice compliance matrix

Status: design constraints and implementation limitations, **not** tax/legal approval. Reviewed against German federal resources as of 2026-11-17.

## Current allowed scope

- EUR, Germany domestic service invoices, legally verified seller profile. A company/person can be an issuer only if the configured party is the actual legal invoice issuer.
- `small_business` under § 19 UStG: user must verify their eligibility. No displayed VAT. § 19 UStG exemption text appears on outputs.
- `vat_registered`: only regular German 7%/19% position rates; no automatic 0%, reverse charge, EU cross-border, OSS or other tax exemptions until explicitly supported and verified.
- `unverified`: cannot create new drafts or issue invoices.
- Each invoice includes seller/recipient name and address, tax identifier, number, issue/service dates, positions, amount, and payment information when configured.
- Seller/customer details snapshotted when draft is created and permanently frozen when invoice number is reserved. Editing address book later cannot change issued invoices.
- Number `RE-YYYY-XXXXXX`: unique, issued in a PostgreSQL locked transaction, no reuse. § 34a UStDV Kleinunternehmerrechnungen technically do not need an invoice number, but we still assign it for uniform tracking.
- Existing prior numbers must be imported/reserved in the `billing_sequences` table **before first real invoice**. A new 000001 is not safe by default for businesses with earlier numbers.
- No edit or deletion of issued invoices. An official corrected invoice requires a separate linked document and own properly compliant workflow (NOT implemented in this iteration).

## E-Rechnung limitations

- A simple PDF, FODT/ODT or printable HTML is a **sonstige Rechnung**, not the XML-based E-Rechnung required by EN 16931.
- Since 2025-01-01, in-scope German B2B billing requires E-Rechnung with transition windows for issuance. The general transition through 2026 and qualifying 800,000-euro turnover transition through 2027 are not a waiver of recipients' ability to receive e-invoices.
- Kleinunternehmer remain excluded from mandatory E-Rechnung issuance in their exemption cases, but must be able to receive E-Rechnungen.
- ZUGFeRD/Factur-X and XRechnung require genuine validated EN 16931 structured XML and, in the former case, suitable PDF/A-3 embedding. None is implemented yet. Do not rename ordinary PDF to ZUGFeRD.
- Payment event recording in CMS is not itself bank settlement verification and does not move money.

## Stripe Managed Payments

Managed Payments is configured in the existing shop as Merchant of Record. The direct-sale invoice module must not send a second customer tax invoice for an eligible Stripe-issued customer invoice. Reconciliation of Stripe-issued documents and seller payouts is separate future work.

## Legal references

- BMF, E-Rechnung FAQ: https://www.bundesfinanzministerium.de/Content/DE/FAQ/e-rechnung.html
- § 14 UStG: https://www.gesetze-im-internet.de/ustg_1980/__14.html
- § 34a UStDV: https://www.gesetze-im-internet.de/ustdv_1980/__34a.html
- Official KoSIT validator specification: https://github.com/itplr-kosit/validator-configuration-xrechnung

Before production: professional review of invoice layout, mandatory particulars, tax treatment, e-invoice obligation, electronic retention, GoBD controls and actual seller identity.

Current revisions produce an ordinary PDF plus standards-based ODT/FODT files. The files themselves are not qualified EN 16931 electronic invoices. Structured XML and an independently validated PDF/A-3 profile remain explicitly outside the production-ready scope.

**Sequence activation:** Every annual invoice-number range must be explicitly confirmed through the MFA-protected billing settings, after reconciling prior external/paper invoices. SQL blocks issuance of any invoice dated in a year whose start value has not been confirmed. Reconfirmation with the exact same starting value is idempotent, but changing a confirmed value is forbidden.
