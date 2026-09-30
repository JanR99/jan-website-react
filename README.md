# Jan Website

A personal website with a cooking recipe collection, built with [React](https://react.dev/) + [Vite](https://vitejs.dev/) on the frontend and a [Spring Boot](https://spring.io/projects/spring-boot) backend using [Google Cloud Datastore](https://cloud.google.com/datastore).

## Project Structure

- `src/` – React frontend
- `backend/` – Spring Boot backend (Java 21, Maven)

## Getting Started (local development)

The backend needs Java 21 and the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) (for the local Datastore emulator).

1. Copy `.env.example` to `.env` in the project root and fill in your own values.
2. Start the backend + Datastore emulator:
   ```bash
   ./start-dev.sh      # Linux/Mac
   .\start-dev.ps1     # Windows
   ```
3. In a second terminal, start the frontend:
   ```bash
   npm install
   npm run dev
   ```

The frontend automatically talks to the backend on port 8080 of whichever host it's opened from (`localhost`, or your machine's IP when testing from a phone on the same network).

## Deployment

- **Frontend** deploys to GitHub Pages via GitHub Actions on every push to `master` (`.github/workflows/`).
- **Backend** deploys to [Cloud Run](https://cloud.google.com/run) the same way, building the Docker image from the repo root `Dockerfile`.

### Required GitHub secrets

| Secret | Where it comes from |
|---|---|
| `GCP_PROJECT_ID` | Your Google Cloud project ID, e.g. `gcloud config get-value project` |
| `GCP_SA_KEY` | JSON key of a service account with deploy rights, created once via `gcloud iam service-accounts keys create key.json --iam-account=<sa-email>` |
| `JWT_SECRET` | Any long random string, e.g. `openssl rand -base64 48` |
| `BOOTSTRAP_ADMIN_EMAIL` / `BOOTSTRAP_ADMIN_PASSWORD` | Chosen by you — the backend creates (or promotes) this account to admin on every startup |
| `BREVO_API_KEY` | API key from [Brevo](https://app.brevo.com/settings/keys/api) (free plan) used to email `BOOTSTRAP_ADMIN_EMAIL` about new registrations. That address must be a verified sender in Brevo. Optional — without it no email is sent |
| `VITE_API_BASE_URL` | The deployed backend's URL (Cloud Run service URL, or a custom domain mapped to it) |

The same `JWT_SECRET`, `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` also go into your local `.env` file.