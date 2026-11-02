#!/usr/bin/env bash
# start-dev.sh
# start Firestore-Emulator (Datastore-Mode) and the Datastore UI in Docker and then Spring-Boot-App.

set -euo pipefail

# --- Config ---
# ports and containers as in compose.yaml
EMULATOR_PORT="8081"
DATASTORE_UI_PORT="8083"
EMULATOR_CONTAINER="jan-website-datastore"
PROJECT_ID="jan-website-dev"   # any placeholder name works for the emulator
BACKEND_DIR="backend"

remove_dev_containers() {
    docker compose down > /dev/null 2>&1 || true
}

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

# --- Docker: the emulator and the Datastore UI from compose.yaml, shown as one group in Docker Desktop ---
if ! docker info > /dev/null 2>&1; then
    echo "ERROR: Docker is not running." >&2
    exit 1
fi
# Remove containers left over from a previous run, otherwise their names and ports are still taken
remove_dev_containers

# Clean up when the script exits (also on Ctrl+C)
cleanup() {
    echo ""
    echo "Stopping emulator and Datastore UI ..."
    remove_dev_containers
}
trap cleanup EXIT

# (the first start downloads the Docker images, which takes a while)
echo "Starting Firestore emulator (Datastore mode) on port ${EMULATOR_PORT} and Datastore UI on http://localhost:${DATASTORE_UI_PORT} ..."
docker compose up -d

echo "Logs: docker compose logs -f"

# Wait until the emulator answers instead of a fixed time
echo "Waiting for the emulator to start up ..."
emulator_ready=false
for _ in $(seq 1 120); do
    if curl -s -o /dev/null "http://127.0.0.1:${EMULATOR_PORT}"; then
        emulator_ready=true
        break
    fi
    sleep 1
done
if [ "${emulator_ready}" != true ]; then
    echo "ERROR: The emulator did not start. Its log:" >&2
    docker logs "${EMULATOR_CONTAINER}" >&2 || true
    exit 1
fi

# --- Env variables for the emulator connection ---
export DATASTORE_EMULATOR_HOST="localhost:${EMULATOR_PORT}"
export GOOGLE_CLOUD_PROJECT="${PROJECT_ID}"

echo "DATASTORE_EMULATOR_HOST = ${DATASTORE_EMULATOR_HOST}"
echo "GOOGLE_CLOUD_PROJECT    = ${GOOGLE_CLOUD_PROJECT}"

java_home="${JAVA_HOME:-}"
java_version=""
if [ -n "${java_home}" ] && [ -x "${java_home}/bin/java" ] && [ -f "${java_home}/release" ]; then
    java_version="$(sed -n 's/^JAVA_VERSION="\([^"]*\)".*/\1/p' "${java_home}/release" | head -n 1)"
fi

if [ "${java_version%%.*}" != "25" ]; then
    if [ -z "${java_home}" ]; then
        problem="JAVA_HOME is not set"
    elif [ -n "${java_version}" ]; then
        problem="JAVA_HOME points to Java ${java_version} ('${java_home}')"
    else
        problem="JAVA_HOME ('${java_home}') does not point to a JDK"
    fi
    echo "ERROR: ${problem}. Set JAVA_HOME to a JDK 25 (in your shell or in .env)." >&2
    exit 1
fi

echo "JAVA_HOME = ${java_home}"
"${java_home}/bin/java" -version

# --- Start the Spring Boot app ---
echo "Starting Spring Boot app in '${BACKEND_DIR}' ..."
cd "${BACKEND_DIR}"
mvn spring-boot:run