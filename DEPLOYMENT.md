# Deployment

This app is designed to run on Google Cloud Run with a production container that serves the built Vite app and exposes a Gemini-backed assistant endpoint.

## Build and deploy

```bash
gcloud builds submit --config cloudbuild.yaml
```

For a manual build and deploy flow:

```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/election-assistant
gcloud run deploy election-assistant \
  --image gcr.io/YOUR_PROJECT_ID/election-assistant \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars GEMINI_MODEL=gemini-2.0-flash \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

## Environment variables

- `PORT` is injected by Cloud Run and defaults to `8080` locally in the container.
- `GEMINI_API_KEY` is required for live Gemini responses.
- `GEMINI_MODEL` is optional and defaults to `gemini-2.0-flash`.

Use Secret Manager for `GEMINI_API_KEY` in production. Do not hardcode the key in the frontend or Docker image.

## Logs and monitoring

- Cloud Run writes container stdout/stderr to Cloud Logging automatically.
- The server emits structured JSON logs for assistant requests, fallbacks, and startup events.
- In Google Cloud Console, open Cloud Run > your service > Logs to inspect request and Gemini errors.

## Redeploying updates

1. Push the code change.
2. Re-run the Cloud Build trigger or `gcloud builds submit --config cloudbuild.yaml`.
3. Verify the new revision in Cloud Run and check logs if Gemini responses change unexpectedly.