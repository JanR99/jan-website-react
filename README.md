# Jan Website

[![Frontend coverage](https://raw.githubusercontent.com/JanR99/jan-website-react/badges/frontend-coverage.svg)](https://github.com/JanR99/jan-website-react/blob/badges/COVERAGE.md)
[![Backend coverage](https://raw.githubusercontent.com/JanR99/jan-website-react/badges/backend-coverage.svg)](https://github.com/JanR99/jan-website-react/blob/badges/COVERAGE.md)

A personal website with a cooking recipe collection, built with [React](https://react.dev/) + [Vite](https://vitejs.dev/) on the frontend and a [Spring Boot](https://spring.io/projects/spring-boot) backend using [Google Cloud Datastore](https://cloud.google.com/datastore).

## Project Structure

- `src/` – React frontend
- `backend/` – Spring Boot backend (Java 25, Maven)

## Games

The Japanese crossword (`/spiele`) uses `public/games/japanese-words.json`. It is built with `npm run words`
(`scripts/build-japanese-words.ts`) from the word lists in `data/japanese-practice/` (originally from
[Language-Learning-decks](https://github.com/vbvss199/Language-Learning-decks), see the README there for the licenses): only the hiragana and katakana words marked `useful_for_flashcard`, with 2–6 characters,
without unsuitable words and without second spellings of the same word (ウィンナー/ウインナー), as
`{ w: word, en: English meanings, l: CEFR level }`.

## Getting Started (local development)

The backend needs Java 25 (`JAVA_HOME` has to point to it) and [Docker](https://www.docker.com/products/docker-desktop/) (the start script runs the local Datastore emulator and its admin UI as containers). The backend tests (`mvn test`) start their own emulator with the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install).

1. Copy `.env.example` to `.env` in the project root and fill in your own values.
2. Start the backend + Datastore emulator + Datastore UI (Docker must be running):
   ```bash
   ./start-dev.sh      # Linux/Mac
   .\start-dev.ps1     # Windows
   ```
   The Datastore UI ([gcp-emulator-ui](https://github.com/drehelis/gcp-emulator-ui)) runs on http://localhost:8083 and shows what is in the local emulator. Emulator and UI run in the background (logs: Docker Desktop or `docker logs -f jan-website-datastore`) and are removed again when the script ends, so the local data only lives as long as the script runs.
3. In a second terminal, start the frontend:
   ```bash
   npm install
   npm run dev
   ```

The frontend automatically talks to the backend on port 8080 of whichever host it's opened from (`localhost`, or your machine's IP when testing from a phone on the same network).

### Tests and coverage

- Frontend: `npm test`; `npm run coverage` also measures the coverage (report in `coverage/index.html`).
- Backend: `mvn test`; `mvn verify` also writes the coverage report of JaCoCo (`backend/target/site/jacoco/index.html`).

The checks on GitHub do the same. For pushes to `master`, the workflow `Coverage badges` then draws the two badges
above (`scripts/coverage-badge.mjs`, share of covered lines) and an overview of the lines no test runs, per folder
and file with links into the code ([COVERAGE.md](https://github.com/JanR99/jan-website-react/blob/badges/COVERAGE.md),
`scripts/coverage-report.mjs`), and keeps them on the branch `badges`. Every run of the checks also shows the
overview in its summary.

### API documentation (Swagger UI)

While the backend runs locally, the Swagger UI is on http://localhost:8080/swagger-ui/index.html. It lists all endpoints and lets you try them out. Endpoints that need a login answer with 401 there, because the page has no way to send a login token.

On Cloud Run the Swagger UI is switched off (the backend checks `K_SERVICE`, which Cloud Run always sets). The API description on `/v3/api-docs` stays reachable there too, because the frontend builds its API client from it.

## Deployment

- Nothing deploys on a push to `master`. The workflow `deploy.yml` runs when a GitHub release is published, or when started by hand in the Actions tab ("Run workflow"), where frontend, backend or both can be chosen. It runs the checks once and then deploys both parts side by side.
- **Frontend** deploys to GitHub Pages.
- **Backend** deploys to [Cloud Run](https://cloud.google.com/run), building the Docker image from the repo root `Dockerfile`.

### Required GitHub secrets

| Secret | Where it comes from |
|---|---|
| `GCP_PROJECT_ID` | Your Google Cloud project ID, e.g. `gcloud config get-value project` |
| `GCP_SA_KEY` | JSON key of a service account with deploy rights, created once via `gcloud iam service-accounts keys create key.json --iam-account=<sa-email>` |
| `JWT_SECRET` | Any long random string, e.g. `openssl rand -base64 48` |
| `BOOTSTRAP_ADMIN_EMAIL` / `BOOTSTRAP_ADMIN_PASSWORD` | Chosen by you — the backend creates (or promotes) this account to admin on every startup |
| `BREVO_API_KEY` | API key from [Brevo](https://app.brevo.com/settings/keys/api) (free plan) used to email `BOOTSTRAP_ADMIN_EMAIL` about new registrations. That address must be a verified sender in Brevo. Optional — without it no email is sent. Mails are only sent on Cloud Run; started locally or in tests, the backend writes them to its log instead |
| `VITE_API_BASE_URL` | The deployed backend's URL (Cloud Run service URL, or a custom domain mapped to it) |

The same `JWT_SECRET`, `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` also go into your local `.env` file.