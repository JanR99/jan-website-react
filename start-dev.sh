#!/usr/bin/env bash
# start-dev.sh
# start Firestore-Emulator (Datastore-Mode) and then Spring-Boot-App.

set -euo pipefail

# --- Config ---
EMULATOR_PORT="8081"
PROJECT_ID="jan-website-dev"   # any placeholder name works for the emulator
BACKEND_DIR="backend"

# --- Load .env file (if present) ---
ENV_FILE=".env"
if [ -f "$ENV_FILE" ]; then
    echo "Loading environment variables from ${ENV_FILE} ..."
    while IFS= read -r line || [ -n "$line" ]; do
        # Trim whitespace
        line="$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"

        # Skip empty lines and comments
        [ -z "$line" ] && continue
        case "$line" in \#*) continue ;; esac

        key="${line%%=*}"
        value="${line#*=}"
        key="$(echo "$key" | sed 's/[[:space:]]*$//')"
        value="$(echo "$value" | sed 's/^[[:space:]]*//')"

        export "$key=$value"
        echo "  $key set"
    done < "$ENV_FILE"
else
    echo "No .env file found (${ENV_FILE}) - skipping. See .env.example."
fi

# --- Start Firestore emulator (Datastore mode) in the background ---
echo "Starting Firestore emulator (Datastore mode) on port ${EMULATOR_PORT} ..."

gcloud emulators firestore start \
    --database-mode=datastore-mode \
    --host-port="localhost:${EMULATOR_PORT}" \
    > emulator.log 2>&1 &

EMULATOR_PID=$!

# Clean up when the script exits (also on Ctrl+C)
cleanup() {
    echo ""
    echo "Stopping emulator (PID ${EMULATOR_PID}) ..."
    kill "${EMULATOR_PID}" 2>/dev/null || true
}
trap cleanup EXIT

echo "Waiting for the emulator to start up ..."
sleep 6

# --- Env variables for the emulator connection ---
export DATASTORE_EMULATOR_HOST="localhost:${EMULATOR_PORT}"
export GOOGLE_CLOUD_PROJECT="${PROJECT_ID}"

echo "DATASTORE_EMULATOR_HOST = ${DATASTORE_EMULATOR_HOST}"
echo "GOOGLE_CLOUD_PROJECT    = ${GOOGLE_CLOUD_PROJECT}"

# --- Start the Spring Boot app ---
echo "Starting Spring Boot app in '${BACKEND_DIR}' ..."
cd "${BACKEND_DIR}"
mvn spring-boot:run