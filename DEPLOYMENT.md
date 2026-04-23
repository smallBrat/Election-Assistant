# Deployment

This project is designed to run as a Dockerized Node.js service on Google Cloud Run. The backend serves the built Vite frontend from `dist/` and exposes `/api/chat`, `/healthz`, and `/readyz`.

## Build the container

```powershell
cd "D:\CODE\HACKATHON\PromptWars\Week 2"
docker build -t election-assistant:local .
```

## Local Vertex run with mounted credentials

```powershell
$CredFile = "D:\keys\promptwars-vertex-sa-key.json"

docker run --rm -p 8080:8080 `
  --mount type=bind,source="$CredFile",target=/secrets/promptwars-vertex-sa.json,readonly `
  -e PORT=8080 `
  -e GOOGLE_CLOUD_PROJECT=promptwars-493915 `
  -e GOOGLE_CLOUD_LOCATION=us-central1 `
  -e GEMINI_MODEL=gemini-2.5-flash `
  -e GOOGLE_APPLICATION_CREDENTIALS=/secrets/promptwars-vertex-sa.json `
  election-assistant:local
```

## Local demo run without Vertex

```powershell
docker run --rm -p 8080:8080 `
  -e PORT=8080 `
  -e MOCK_AI=true `
  -e GOOGLE_CLOUD_PROJECT=promptwars-493915 `
  -e GOOGLE_CLOUD_LOCATION=us-central1 `
  -e GEMINI_MODEL=gemini-2.5-flash `
  election-assistant:local
```

## PowerShell checks

```powershell
Invoke-RestMethod -Uri http://localhost:8080/healthz -Method GET | ConvertTo-Json -Depth 3
Invoke-RestMethod -Uri http://localhost:8080/readyz -Method GET | ConvertTo-Json -Depth 3
Invoke-RestMethod -Uri http://localhost:8080/api/chat -Method POST -ContentType "application/json" -Body '{"message":"Explain voter registration simply","history":[]}' | ConvertTo-Json -Depth 4
```

## Cloud Run deploy

Preferred deployment path uses the built container image and Cloud Run service identity for Vertex auth.

```powershell
gcloud run deploy election-assistant `
  --image gcr.io/promptwars-493915/election-assistant:latest `
  --region us-central1 `
  --platform managed `
  --allow-unauthenticated `
  --set-env-vars GOOGLE_CLOUD_PROJECT=promptwars-493915,GOOGLE_CLOUD_LOCATION=us-central1,GEMINI_MODEL=gemini-2.5-flash,MOCK_AI=false
```

## Cloud Run identity and IAM

- Do not use `GOOGLE_APPLICATION_CREDENTIALS` in Cloud Run.
- Attach a service account to the Cloud Run revision.
- Grant that service account `roles/aiplatform.user` on the project.

## Logs and troubleshooting

- Cloud Run writes stdout/stderr to Cloud Logging automatically.
- The server logs structured JSON for `server.started`, `chat.request_received`, `chat.model_request_started`, `chat.model_request_success`, and `chat.model_request_failure`.
- Use `/readyz` to inspect whether the app sees the credential path and whether it is readable during local debugging.
- If local Docker shows missing credentials, check that the mounted host path points to a real JSON file and not a directory.