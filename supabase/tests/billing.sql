-- Billing contract tests for the disposable CI PostgreSQL database only.
-- No real invoices or production credentials may be used with this fixture.
DO $billing_test$
DECLARE
  actor uuid := '00000000-0000-4000-8000-000000000042';
  customer uuid;
  draft_id uuid;
  second_draft uuid;
  paid_record uuid;
  payment_key uuid := '00000000-0000-4000-8000-000000000043';
  approval_id uuid;
  reserved public.billing_invoices%ROWTYPE;
  issued public.billing_invoices%ROWTYPE;
  snapshot_seller jsonb;
  snapshot_recipient jsonb;
  hashes jsonb := jsonb_build_object('pdf',repeat('a',64),'fodt',repeat('b',64),'odt',repeat('c',64));
  first_number text;
BEGIN
  INSERT INTO auth.users(id) VALUES(actor) ON CONFLICT DO NOTHING;
  INSERT INTO public.profiles(id,role) VALUES(actor,'admin')
    ON CONFLICT (id) DO UPDATE SET role='admin';

  INSERT INTO public.billing_settings(
    id,seller_name,seller_street,seller_postal_code,seller_city,seller_country,
    seller_tax_id,seller_email,seller_iban,seller_bic,tax_mode,number_prefix,updated_by
  ) VALUES(
    1,'NEUROKLAST','Musterweg 1','40000','Düsseldorf','DE',
    'TEST-STNR','', '', '', 'small_business','RE',actor
  );
  INSERT INTO public.billing_customers(name,street,postal_code,city,country,created_by,updated_by)
  VALUES('Demo GmbH','Kundenweg 2','10000','Berlin','DE',actor,actor)
  RETURNING id INTO customer;

  snapshot_seller:=jsonb_build_object(
    'name','NEUROKLAST','street','Musterweg 1','postal_code','40000',
    'city','Düsseldorf','country','DE','tax_id','TEST-STNR',
    'email','','iban','','bic','');
  snapshot_recipient:=jsonb_build_object(
    'name','Demo GmbH','street','Kundenweg 2','postal_code','10000',
    'city','Berlin','country','DE','email','','vat_id','','contact_name','');

  INSERT INTO public.billing_invoices(
    customer_id,issue_date,service_date,due_date,seller,recipient,
    lines,tax_mode,subtotal_cents,tax_cents,total_cents,created_by,updated_by
  ) VALUES(
    customer,'2026-11-17','2026-11-14','2026-12-01',snapshot_seller,snapshot_recipient,
    '[{"description":"DJ performance","quantity_milli":1000,"unit_cents":60000,"tax_rate":0}]'::jsonb,
    'small_business',60000,0,60000,actor,actor
  ) RETURNING id INTO draft_id;

  -- A new year cannot silently start with RE-YYYY-000001.
  BEGIN
    PERFORM public.billing_prepare_issue(draft_id,actor);
    RAISE EXCEPTION 'TEST FAILED: unconfirmed number sequence allocated';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE 'Confirm the invoice number series%' THEN RAISE; END IF;
  END;

  IF public.billing_seed_sequence(2026,42,actor)<>42 THEN
    RAISE EXCEPTION 'TEST FAILED: sequence confirmation did not return expected start';
  END IF;
  IF public.billing_seed_sequence(2026,42,actor)<>42 THEN
    RAISE EXCEPTION 'TEST FAILED: idempotent sequence confirmation failed';
  END IF;
  BEGIN
    PERFORM public.billing_seed_sequence(2026,41,actor);
    RAISE EXCEPTION 'TEST FAILED: confirmed sequence was reset';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM<>'Number series already confirmed; it cannot be reset' THEN RAISE; END IF;
  END;

  reserved:=public.billing_prepare_issue(draft_id,actor);
  IF reserved.number<>'RE-2026-000042' OR reserved.status<>'preparing' THEN
    RAISE EXCEPTION 'TEST FAILED: wrong first legal invoice number: %',reserved.number;
  END IF;
  IF (public.billing_prepare_issue(draft_id,actor)).number<>reserved.number THEN
    RAISE EXCEPTION 'TEST FAILED: duplicate issue assigned another number';
  END IF;
  first_number:=reserved.number;
  BEGIN
    UPDATE public.billing_invoices SET total_cents=123 WHERE id=draft_id;
    RAISE EXCEPTION 'TEST FAILED: preparing invoice amounts are editable';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM<>'Preparing invoice content is frozen' THEN RAISE; END IF;
  END;

  BEGIN
    PERFORM public.billing_finalize_issue(
      draft_id,actor,'billing/'||draft_id||'/'||first_number||'.pdf',
      'billing/'||draft_id||'/'||first_number||'.fodt',
      jsonb_build_object('pdf',repeat('a',64))
    );
    RAISE EXCEPTION 'TEST FAILED: missing ODT checksum accepted';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM<>'PDF, FODT and ODT SHA-256 checksums are required' THEN RAISE; END IF;
  END;

  issued:=public.billing_finalize_issue(
    draft_id,actor,'billing/'||draft_id||'/'||first_number||'.pdf',
    'billing/'||draft_id||'/'||first_number||'.fodt',hashes
  );
  IF issued.status<>'issued' OR issued.document_sha256<>hashes THEN
    RAISE EXCEPTION 'TEST FAILED: invoice not finalized';
  END IF;
  IF (public.billing_finalize_issue(
    draft_id,actor,'billing/'||draft_id||'/'||first_number||'.pdf',
    'billing/'||draft_id||'/'||first_number||'.fodt',hashes
  )).id<>draft_id THEN
    RAISE EXCEPTION 'TEST FAILED: identical finalize retry rejected';
  END IF;
  IF (public.billing_prepare_issue(draft_id,actor)).number<>first_number THEN
    RAISE EXCEPTION 'TEST FAILED: already issued invoice retry changed its number';
  END IF;
  BEGIN
    UPDATE public.billing_invoices SET note='tampered' WHERE id=draft_id;
    RAISE EXCEPTION 'TEST FAILED: issued invoice was modified';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE 'An issued invoice is immutable%' THEN RAISE; END IF;
  END;
  BEGIN
    DELETE FROM public.billing_invoices WHERE id=draft_id;
    RAISE EXCEPTION 'TEST FAILED: issued invoice was deleted';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE 'Financial records are append-only%' THEN RAISE; END IF;
  END;

  INSERT INTO public.billing_invoices(
    customer_id,issue_date,service_date,due_date,seller,recipient,
    lines,tax_mode,subtotal_cents,tax_cents,total_cents,created_by,updated_by
  ) VALUES(
    customer,'2026-11-17','2026-11-14','2026-12-01',snapshot_seller,snapshot_recipient,
    '[{"description":"Production","quantity_milli":1000,"unit_cents":10000,"tax_rate":0}]'::jsonb,
    'small_business',10000,0,10000,actor,actor
  ) RETURNING id INTO second_draft;
  reserved:=public.billing_prepare_issue(second_draft,actor);
  IF reserved.number<>'RE-2026-000043' THEN
    RAISE EXCEPTION 'TEST FAILED: repeated number allocation: %',reserved.number;
  END IF;

  SELECT id INTO paid_record FROM public.billing_record_payment(
    draft_id,actor,20000,'2026-11-17','manual transfer',payment_key
  );
  IF paid_record IS NULL THEN RAISE EXCEPTION 'TEST FAILED: payment not recorded'; END IF;
  IF (public.billing_record_payment(
    draft_id,actor,20000,'2026-11-17','manual transfer',payment_key
  )).id IS DISTINCT FROM paid_record THEN
    RAISE EXCEPTION 'TEST FAILED: payment retry created a second payment record';
  END IF;

  INSERT INTO public.billing_mcp_requests(
    operation,invoice_id,payload,requested_by,client_id
  ) VALUES(
    'record_payment',draft_id,
    '{"amount_cents":10000,"paid_on":"2026-11-17","reference":"MCP payment"}',
    actor,'test-oauth-client'
  ) RETURNING id INTO approval_id;
  IF public.billing_approve_mcp_payment(approval_id,actor) IS NULL THEN
    RAISE EXCEPTION 'TEST FAILED: approved MCP payment not created';
  END IF;
  BEGIN
    PERFORM public.billing_approve_mcp_payment(approval_id,actor);
    RAISE EXCEPTION 'TEST FAILED: payment approval was replayed';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM<>'Payment review request unavailable' THEN RAISE; END IF;
  END;
  IF (SELECT COALESCE(SUM(amount_cents),0) FROM public.billing_payments WHERE invoice_id=draft_id)<>30000 THEN
    RAISE EXCEPTION 'TEST FAILED: duplicate/missing payment';
  END IF;
  IF (SELECT paid_cents FROM public.billing_invoice_balances WHERE invoice_id=draft_id)<>30000 THEN
    RAISE EXCEPTION 'TEST FAILED: payment aggregation incorrect';
  END IF;
  BEGIN
    PERFORM public.billing_record_payment(draft_id,actor,40000,'2026-11-17','overpayment',gen_random_uuid());
    RAISE EXCEPTION 'TEST FAILED: overpayment accepted';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM<>'Invalid payment amount' THEN RAISE; END IF;
  END;

  BEGIN
    UPDATE public.billing_payments SET amount_cents=1 WHERE id=paid_record;
    RAISE EXCEPTION 'TEST FAILED: payment history was edited';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE 'Financial records are append-only%' THEN RAISE; END IF;
  END;
  IF has_function_privilege('anon','public.billing_prepare_issue(uuid,uuid)','EXECUTE') OR
     has_function_privilege('authenticated','public.billing_record_payment(uuid,uuid,bigint,date,text,uuid)','EXECUTE') THEN
    RAISE EXCEPTION 'TEST FAILED: privileged finance RPC exposed to public';
  END IF;
  IF NOT has_function_privilege('service_role','public.billing_prepare_issue(uuid,uuid)','EXECUTE') THEN
    RAISE EXCEPTION 'TEST FAILED: service-role invoice issuance denied';
  END IF;
END $billing_test$;
