# NEUROKORE beta diagnostics

Beta opt-in is stored in the native shared UiSettings file and defaults to false.
The editor reports session start, script errors and unhandled promise rejections to
POST https://neuroklast.net/api/neurokore/telemetry. The sending call is made by
the WebView, never the audio thread. Reporting stops when consent is switched off.

Allowed: plugin version, OS/DAW family, VST3/AU/Standalone, bounded CPU/RAM bucket,
sample rate, buffer size, known event code, JavaScript chunk basename and line.
Never include raw exception messages, stack traces, names, usernames, absolute paths,
license info, session/machine identifiers, project contents, presets or audio.

Server: Zod strict validation, 16 KiB streamed body cap, 4 KiB header guard,
hash-based per-IP throttle (transient pseudonymous rate-limit storage),
server-only service_role DB access, no public SELECT/INSERT, RLS, daily 90-day cleanup.
IP addresses are visible to networking infrastructure as part of HTTP transport
and could appear in platform logs. Do not describe the entire system as
unconditionally anonymous. This is minimised, identifier-free reporting.

Deployment: apply the new table statements in supabase/schema.sql to the real
NEUROKLAST Supabase project, ensure RATE_LIMIT_SALT, CRON_SECRET,
NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the Vercel project.
Confirm daily /api/cron/privacy-retention runs and the 90-day cutoff.
Then deploy both repositories and test a native consent -> manual test -> admin
record -> revoke consent -> no new network event flow. Do not enable collection
before a retention job is operational.

Known limitation: no native crash dump, process-level handler, DSP fault upload,
or editor-closed monitoring. This version is a controlled WebView error pilot.
