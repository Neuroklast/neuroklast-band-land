#!/usr/bin/env bash
set -euo pipefail

# Test the production build, not next dev (the legacy app route tree conflicts
# under dev-mode routing). Keep one server for Playwright and Lighthouse.
npm run start -- --hostname 127.0.0.1 > /tmp/neuroklast-mobile-audit-server.log 2>&1 &
server_pid=$!
cleanup() {
  kill "$server_pid" 2>/dev/null || true
  wait "$server_pid" 2>/dev/null || true
}
trap cleanup EXIT

ready=0
for attempt in $(seq 1 45); do
  if curl --noproxy '*' -fsS --max-time 5 http://127.0.0.1:3000/ -o /dev/null; then
    ready=1
    break
  fi
  if ! kill -0 "$server_pid" 2>/dev/null; then break; fi
  sleep 1
done
if [ "$ready" -ne 1 ]; then
  echo "Production server failed the HTTP readiness check" >&2
  tail -100 /tmp/neuroklast-mobile-audit-server.log >&2
  exit 1
fi
echo "Local production HTTP health check passed"

# Collect both reports even if the first suite fails; fail the job afterwards.
set +e
PLAYWRIGHT_SKIP_WEBSERVER=1 npx playwright test e2e/mobile.spec.ts --project=mobile-chromium
playwright_exit=$?
lhci autorun --config=.lighthouserc.cjs
lighthouse_exit=$?
set -e

if [ "$playwright_exit" -ne 0 ] || [ "$lighthouse_exit" -ne 0 ]; then
  echo "Mobile audit failed: Playwright=$playwright_exit Lighthouse=$lighthouse_exit" >&2
  exit 1
fi
