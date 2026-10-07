#!/usr/bin/env bash
# start-dev.sh
# start Firestore-Emulator (Datastore-Mode) and the Datastore UI in Docker and then Spring-Boot-App.

set -euo pipefail

# --- Config ---
EMULATOR_PORT="8081"
DATASTORE_UI_PORT="8083"       # 8080 is the backend, 8082 the emulator of the tests
PROJECT_ID="jan-website-dev"   # any placeholder name works for the emulator
BACKEND_DIR="backend"

DOCKER_NETWORK="jan-website-dev"
EMULATOR_CONTAINER="jan-website-datastore"
DATASTORE_UI_CONTAINER="jan-website-datastore-ui"
EMULATOR_IMAGE="gcr.io/google.com/cloudsdktool/google-cloud-cli:emulators"
DATASTORE_UI_IMAGE="ghcr.io/drehelis/gcp-emulator-ui:main"

remove_dev_containers() {
    docker rm -f "${EMULATOR_CONTAINER}" "${DATASTORE_UI_CONTAINER}" > /dev/null 2>&1 || true
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

# --- Docker: both containers share a network, so the UI reaches the emulator by its container name ---
if ! docker info > /dev/null 2>&1; then
    echo "ERROR: Docker is not running." >&2
    exit 1
fi
# Remove containers left over from a previous run, otherwise their names and ports are still taken
remove_dev_containers
docker network create "${DOCKER_NETWORK}" > /dev/null 2>&1 || true

# Clean up when the script exits (also on Ctrl+C)
cleanup() {
    echo ""
    echo "Stopping emulator and Datastore UI ..."
    remove_dev_containers
}
trap cleanup EXIT

# --- Start Firestore emulator (Datastore mode) as a Docker container in the background ---
echo "Starting Firestore emulator (Datastore mode) on port ${EMULATOR_PORT} ..."

docker run -d --rm --name "${EMULATOR_CONTAINER}" --network "${DOCKER_NETWORK}" \
    -p "127.0.0.1:${EMULATOR_PORT}:8081" \
    "${EMULATOR_IMAGE}" \
    gcloud emulators firestore start --database-mode=datastore-mode --host-port=0.0.0.0:8081 --quiet \
    > /dev/null

# --- Start the Datastore UI (gcp-emulator-ui) as a Docker container in the background ---
echo "Starting Datastore UI on http://localhost:${DATASTORE_UI_PORT} ..."

docker run -d --rm --name "${DATASTORE_UI_CONTAINER}" --network "${DOCKER_NETWORK}" \
    -p "127.0.0.1:${DATASTORE_UI_PORT}:80" \
    -e "DATASTORE_EMULATOR_URL=${EMULATOR_CONTAINER}:8081" \
    "${DATASTORE_UI_IMAGE}" \
    > /dev/null

echo "Logs: docker logs -f ${EMULATOR_CONTAINER}   /   docker logs -f ${DATASTORE_UI_CONTAINER}"

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