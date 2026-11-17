# Billing MCP integration

Path: `https://neuroklast.net/api/mcp`, existing admin-only OAuth, Supabase-authenticated administrator profile and MFA grant. Financial data is privileged customer/financial information; do not put customer text into system prompts.

## Tools

Read: `billing_customers_list`, `billing_customer_get`, `billing_invoices_list`, `billing_invoice_get`, `billing_invoice_document`, `billing_review_requests`.
Write (draft/data only): `billing_customer_create`, `billing_customer_update`, `billing_invoice_create_draft`, `billing_invoice_update_draft`.
Human approval required: `billing_invoice_request_issue`, `billing_invoice_request_payment`.

All money is entered as integer EUR cents in MCP requests. Invoice lines use `quantity_milli` (1000 = one unit), `unit_cents`, and `tax_rate` 0/7/19 depending on seller mode.

## Approval flow

MCP queues request in `billing_mcp_requests`. Human reviews the target invoice and amount at `/admin/billing/review` while authenticated with MFA. Issuance reserves a number once. A payment approval runs atomically in Postgres, preventing two separate recordings of a single approved request.

No tool deletes invoices, changes issued snapshots or manages arbitrary database tables. PDF, ODT and Flat-ODF signed document URLs expire after 90 seconds and require server-side authorization to mint.

## Example input

```json
{
  "customer_id": "<existing UUID>",
  "issue_date": "2026-11-17",
  "service_date": "2026-11-14",
  "due_date": "2026-12-01",
  "lines": [{
    "description": "DJ performance",
    "quantity_milli": 1000,
    "unit_cents": 60000,
    "tax_rate": 0
  }],
  "note": ""
}
```

This is a schematic example; tax rate 0 is allowed only if the verified seller is in the `small_business` mode. No live financial actions were performed in this branch.

The invoice listing tool accepts optional `year`, `number`, `status`, `limit` and `offset` inputs. Customer search accepts `q`, `limit` and `offset`. The invoice list includes aggregated paid cents for administrative reconciliation.
