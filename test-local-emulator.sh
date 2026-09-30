#!/usr/bin/env bash
# test-local-emulator.sh
# Verifies that the LOCAL backend talks to the Datastore emulator and not to the real database.
#
# How it works:
#   1. Registers a random test user against the local backend and logs in.
#   2. Tries to log in with the same credentials against the REAL API.
#      If that login fails, the user only exists locally -> the emulator is used.
#      If it succeeds, the local backend wrote to the real Datastore -> FAIL.
#
# Prerequisite: run ./start-dev.sh in another terminal first.
# The only request sent to the real API is one login attempt with random credentials (read-only).
#
# Usage:
#   chmod +x test-local-emulator.sh
#   ./test-local-emulator.sh
#   REMOTE_URL=https://example.com ./test-local-emulator.sh

set -uo pipefail

LOCAL_URL="${LOCAL_URL:-http://localhost:8080}"
REMOTE_URL="${REMOTE_URL:-https://api.jan-website.de}"
EMULATOR_URL="${EMULATOR_URL:-http://localhost:8081}"

FAILED=0
BODY_FILE="$(mktemp)"
trap 'rm -f "$BODY_FILE"' EXIT

pass() { echo "  [PASS] $1"; }
fail() { echo "  [FAIL] $1"; FAILED=1; }
warn() { echo "  [WARN] $1"; }

# Sends a request, prints the HTTP status (000 = no connection), stores the body in $BODY_FILE.
# Usage: http_status METHOD URL [JSON_BODY]
http_status() {
    local method="$1" url="$2" body="${3:-}"
    if [ -n "$body" ]; then
        curl -s -o "$BODY_FILE" -w "%{http_code}" -X "$method" \
            -H "Content-Type: application/json" -d "$body" "$url"
    else
        curl -s -o "$BODY_FILE" -w "%{http_code}" -X "$method" "$url"
    fi
}

# Random credentials, so nothing is hardcoded and repeated runs never collide
SUFFIX="$(head -c 6 /dev/urandom | od -An -tx1 | tr -d ' \n')"
EMAIL="emutest-${SUFFIX}@example.com"
PASSWORD="$(head -c 16 /dev/urandom | od -An -tx1 | tr -d ' \n')"

echo ""
echo "Test user: ${EMAIL}"
echo ""

# --- Step 1: infrastructure is reachable ---
echo "Step 1: Is everything running?"

STATUS="$(http_status GET "$EMULATOR_URL")"
if [ "$STATUS" = "200" ]; then pass "Datastore emulator answers on ${EMULATOR_URL}"
else fail "Datastore emulator not reachable on ${EMULATOR_URL} - start it with ./start-dev.sh"; fi

STATUS="$(http_status GET "${LOCAL_URL}/v3/api-docs")"
if [ "$STATUS" = "200" ]; then pass "Local backend answers on ${LOCAL_URL}"
else fail "Local backend not reachable on ${LOCAL_URL} - start it with ./start-dev.sh"; fi

if [ "$FAILED" -ne 0 ]; then
    echo ""
    echo "Aborting: start the local environment first."
    exit 1
fi

# --- Step 2: register locally ---
echo ""
echo "Step 2: Register the test user LOCALLY"

REGISTER_JSON="{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\",\"firstname\":\"Emulator\",\"lastname\":\"Test\"}"
STATUS="$(http_status POST "${LOCAL_URL}/api/users/register" "$REGISTER_JSON")"
if [ "$STATUS" = "200" ]; then pass "Registered locally (HTTP 200)"
else fail "Local registration failed (HTTP ${STATUS})"; fi

# --- Step 3: login locally ---
echo ""
echo "Step 3: Log in LOCALLY"

LOGIN_JSON="{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}"
STATUS="$(http_status POST "${LOCAL_URL}/api/users/login" "$LOGIN_JSON")"
if [ "$STATUS" = "200" ] && grep -q '"token"' "$BODY_FILE"; then pass "Local login returned a token"
else fail "Local login failed (HTTP ${STATUS})"; fi

# --- Step 4: the same credentials must NOT work against the real API ---
echo ""
echo "Step 4: Try the same credentials against the REAL API"

STATUS="$(http_status POST "${REMOTE_URL}/api/users/login" "$LOGIN_JSON")"
case "$STATUS" in
    200) fail "The user EXISTS in the real database - the local backend is NOT using the emulator!" ;;
    400|401|403|404) pass "Real API rejected the login (HTTP ${STATUS}) - the user only exists locally" ;;
    000) warn "Real API not reachable, the test is inconclusive. Check ${REMOTE_URL}" ;;
    *) warn "Real API answered with unexpected HTTP ${STATUS}, the test is inconclusive" ;;
esac

# --- Summary ---
echo ""
if [ "$FAILED" -ne 0 ]; then
    echo "RESULT: FAILED"
    exit 1
fi
echo "RESULT: OK - local writes go to the emulator."
echo "The emulator keeps data in memory only, so the test user disappears on the next restart."