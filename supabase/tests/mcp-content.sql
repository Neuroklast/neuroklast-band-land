-- Disposable PostgreSQL contract for MCP approval transactions.
-- Run AFTER supabase/schema.sql with auth.users and role fixtures.
DO $mcp_test$
DECLARE
  reviewer uuid := '00000000-0000-4000-8000-000000000001';
  original uuid;
  proposal uuid;
  result text;
  existing_content jsonb;
BEGIN
  INSERT INTO auth.users(id) VALUES (reviewer) ON CONFLICT DO NOTHING;
  INSERT INTO public.profiles(id, role) VALUES (reviewer, 'admin')
    ON CONFLICT(id) DO UPDATE SET role='admin';

  INSERT INTO public.news_posts(title, slug, body, active)
    VALUES ('Original', 'mcp-test-original', 'Before', true)
    RETURNING id INTO original;

  -- Update: atomic live content + audit.
  existing_content := jsonb_build_object('id', original, 'title', 'Original');
  INSERT INTO public.mcp_content_requests (
    collection, operation, target_id, changes, previous_hash,
    previous_snapshot, requested_by, client_id
  ) VALUES (
    'news_posts', 'update', original, '{"title":"Approved"}',
    'test-hash', existing_content, reviewer, 'test-client'
  ) RETURNING id INTO proposal;
  result := public.mcp_apply_content_request(proposal, reviewer);
  IF result <> 'approved' OR
     (SELECT title FROM public.news_posts WHERE id=original) <> 'Approved' OR
     (SELECT status FROM public.mcp_content_requests WHERE id=proposal) <> 'approved'
  THEN RAISE EXCEPTION 'MCP update was not applied atomically'; END IF;
  IF public.mcp_apply_content_request(proposal, reviewer) <> 'not_pending' THEN
    RAISE EXCEPTION 'MCP approval replay succeeded';
  END IF;

  -- Create: attempted active=true must still be an unpublished draft.
  INSERT INTO public.mcp_content_requests (
    collection, operation, changes, requested_by, client_id
  ) VALUES (
    'news_posts', 'create',
    '{"title":"New draft","slug":"mcp-test-draft","body":"Draft","active":true}',
    reviewer, 'test-client'
  ) RETURNING id INTO proposal;
  result := public.mcp_apply_content_request(proposal, reviewer);
  IF result <> 'approved' OR
     (SELECT active FROM public.news_posts WHERE slug='mcp-test-draft') IS DISTINCT FROM false
  THEN RAISE EXCEPTION 'MCP created a published article'; END IF;

  -- Stale changes must be marked conflicted; original must stay untouched.
  INSERT INTO public.mcp_content_requests (
    collection, operation, target_id, changes, previous_hash,
    previous_snapshot, requested_by, client_id
  ) VALUES (
    'news_posts', 'update', original, '{"title":"Should not land"}',
    'old-hash', '{"title":"Original"}', reviewer, 'test-client'
  ) RETURNING id INTO proposal;
  result := public.mcp_apply_content_request(proposal, reviewer);
  IF result <> 'conflict' OR
     (SELECT title FROM public.news_posts WHERE id=original) <> 'Approved'
  THEN RAISE EXCEPTION 'MCP stale overwrite succeeded'; END IF;

  -- Site text edits must merge into prior config and be audited.
  INSERT INTO public.site_config(key,value)
    VALUES ('hero','{"headline":"Original","tagline":"Remain"}')
    ON CONFLICT (key) DO UPDATE SET value=excluded.value;
  INSERT INTO public.mcp_content_requests (
    collection, operation, target_key, changes, previous_hash,
    previous_snapshot, requested_by, client_id
  ) VALUES (
    'site_config', 'config', 'hero',
    '{"headline":"Approved"}', 'test-hash',
    '{"value":{"headline":"Original","tagline":"Remain"}}',
    reviewer, 'test-client'
  ) RETURNING id INTO proposal;
  result := public.mcp_apply_content_request(proposal, reviewer);
  IF result <> 'approved' OR
     (SELECT value->>'headline' FROM public.site_config WHERE key='hero') <> 'Approved' OR
     (SELECT value->>'tagline' FROM public.site_config WHERE key='hero') <> 'Remain'
  THEN RAISE EXCEPTION 'MCP site text patch lost content'; END IF;

  -- Server-side allowlists must independently reject sensitive writes.
  INSERT INTO public.mcp_content_requests (
    collection, operation, target_id, changes, previous_hash,
    previous_snapshot, requested_by, client_id
  ) VALUES (
    'news_posts', 'update', original, '{"password":"do not apply"}',
    'test-hash', '{"title":"Approved"}', reviewer, 'test-client'
  ) RETURNING id INTO proposal;
  BEGIN
    PERFORM public.mcp_apply_content_request(proposal, reviewer);
    RAISE EXCEPTION 'MCP sensitive field accepted';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM <> 'Forbidden editorial field' THEN RAISE; END IF;
  END;
  IF (SELECT status FROM public.mcp_content_requests WHERE id=proposal) <> 'pending' THEN
    RAISE EXCEPTION 'Failed MCP transaction did not roll back';
  END IF;

  -- AI OAuth registry must never be reachable by browser roles.
  INSERT INTO public.mcp_oauth_clients (client_id, provider, display_name, enabled, created_by, updated_by)
    VALUES ('mcp-test-client', 'claude', 'Test provider', true, reviewer, reviewer);
  IF NOT EXISTS (SELECT 1 FROM public.mcp_oauth_clients WHERE client_id='mcp-test-client' AND enabled)
  THEN RAISE EXCEPTION 'MCP OAuth registry insert failed'; END IF;
  UPDATE public.mcp_oauth_clients SET enabled=false WHERE client_id='mcp-test-client';
  IF EXISTS (SELECT 1 FROM public.mcp_oauth_clients WHERE client_id='mcp-test-client' AND enabled)
  THEN RAISE EXCEPTION 'MCP OAuth client revocation failed'; END IF;
  DELETE FROM public.mcp_oauth_clients WHERE client_id='mcp-test-client';
  IF EXISTS (SELECT 1 FROM public.mcp_oauth_clients WHERE client_id='mcp-test-client')
  THEN RAISE EXCEPTION 'MCP OAuth client permanent removal failed'; END IF;
  IF NOT has_table_privilege('service_role', 'public.mcp_oauth_clients', 'DELETE')
  THEN RAISE EXCEPTION 'Service role cannot remove MCP OAuth client'; END IF;
  IF has_table_privilege('anon', 'public.mcp_oauth_clients', 'SELECT')
     OR has_table_privilege('authenticated', 'public.mcp_oauth_clients', 'SELECT')
     OR has_table_privilege('authenticated', 'public.mcp_oauth_clients', 'INSERT')
     OR has_table_privilege('authenticated', 'public.mcp_oauth_clients', 'UPDATE')
     OR has_table_privilege('authenticated', 'public.mcp_oauth_clients', 'DELETE')
     OR has_table_privilege('anon', 'public.mcp_oauth_clients', 'DELETE')
  THEN RAISE EXCEPTION 'Public OAuth client management privileges detected'; END IF;

  -- No role other than service_role (or the table owner) can call the RPC.
  IF has_function_privilege('authenticated','public.mcp_apply_content_request(uuid,uuid)','EXECUTE')
     OR has_function_privilege('anon','public.mcp_apply_content_request(uuid,uuid)','EXECUTE')
  THEN RAISE EXCEPTION 'MCP approval RPC publicly callable'; END IF;
END;
$mcp_test$;
