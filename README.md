# Election Assistant

Election Assistant is a non-partisan election process education app. It combines a React frontend and an Express backend with Vertex AI Gemini to explain registration, required documents, timelines, and voting-day basics in plain language.

## Features

- React + TypeScript user experience focused on first-time voters
- Express API endpoint at /api/chat with structured responses
- Vertex AI Gemini integration via @google/genai
- Mock mode for demos and offline testing
- Dockerized runtime for local and Cloud Run deployment
- Health endpoint at /healthz and readiness endpoint at /readyz

## Tech Stack

- Frontend: React, Vite, TypeScript
- Backend: Node.js, Express
- AI: Vertex AI Gemini via @google/genai
- Container: Docker
- Deployment target: Google Cloud Run

## Local Prerequisites

- Node.js 20 or later
- npm
- Docker Desktop
- gcloud CLI for deployment steps

## Local Development

Install dependencies and run the Vite development server:

```powershell
cd "D:\CODE\HACKATHON\PromptWars\Week 2"
npm install
npm run dev
```

Build production assets:

```powershell
npm run build
```

## Runtime Environment Variables

The backend uses these runtime variables:

- PORT (default: 8080)
- GOOGLE_CLOUD_PROJECT
- GOOGLE_CLOUD_LOCATION (default: us-central1)
- GEMINI_MODEL (default: gemini-2.5-flash)
- MOCK_AI (default: false)
- GOOGLE_APPLICATION_CREDENTIALS (local Docker only)

Important: GOOGLE_APPLICATION_CREDENTIALS is for local Docker development only. Cloud Run should use service identity.

### Local Vertex backend setup (npm run start)

For local backend runs, copy `.env.example` to `.env` and set at least:

- `GOOGLE_CLOUD_PROJECT`
- Optional: `GOOGLE_APPLICATION_CREDENTIALS` (path to a readable service-account JSON file)

If `GOOGLE_APPLICATION_CREDENTIALS` is missing or unreadable, the backend will attempt Application Default Credentials (ADC).
Use `gcloud auth application-default login` to configure ADC locally.

## Optional Firebase (Auth + Firestore)

This app can run without Firebase configured. When Firebase client variables are present, the UI enables:

- Google sign-in / sign-out (non-blocking, guest mode still works)
- Firestore-backed progress sync for signed-in users
- Firestore-backed quiz result history for signed-in users

Copy `.env.example` to `.env.local` and set:

- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID
- VITE_FIREBASE_MEASUREMENT_ID (optional, required to send Firebase Analytics events)

These are Firebase client configuration values and are safe for frontend usage. Do not store admin/service-account keys in frontend env files.

### Firestore data model used by this app

Collections and documents:

- users/{uid}
  - displayName
  - email
  - createdAt
  - updatedAt
  - lastActiveAt
- users/{uid}/progress/overview
  - completedSections: string[]
  - currentSection: string | null
  - progressPercent: number
  - lastVisitedScreen: string | null
  - latestScore: number | null
  - bestScore: number | null
  - lastQuizAttemptAt
  - updatedAt
- users/{uid}/quizAttempts/{attemptId}
  - quizId
  - score
  - totalQuestions
  - answersSummary
  - completedAt
  - createdAt
- users/{uid}/preferences/settings
  - theme
  - learningMode
  - updatedAt

Why this shape:

- progress overview is a single document for fast reads at app startup
- quiz attempts are append-only so history is preserved
- preferences are isolated so updates do not overwrite progress

### Enable Firestore in Firebase Console

1. Open Firebase Console and select your project.
2. Go to Build > Firestore Database.
3. Click Create database.
4. Start in production mode.
5. Choose the closest region to your users.

### Apply Firestore security rules

1. Open Firestore Database > Rules.
2. Copy the contents of firestore.rules from this repo.
3. Publish rules.

Rules guarantee users can only read and write their own documents under users/{uid}.

### Firestore indexes

No custom composite index is required for current queries. The app uses a single-field orderBy on createdAt in quizAttempts.

### Firestore integration behavior

- Signed-in users:
  - user profile document is ensured on sign-in
  - progress and preferences are loaded on startup
  - last visited section can be restored automatically
  - quiz attempts are saved and recent attempts are loaded
- Guest users:
  - app keeps working with local state
  - Firestore reads and writes are skipped

### Test locally and on deployed app

Local test:

1. Set VITE_FIREBASE_* in .env.local.
2. Run npm run dev.
3. Sign in with Google.
4. Complete a few sections and one quiz.
5. Refresh page and verify progress and quiz history are restored.

Deployed test:

1. Build with Cloud Build substitutions for VITE_FIREBASE_*.
2. Deploy Cloud Run as usual.
3. Sign in on deployed UI and repeat progress + quiz checks.

Important: Firebase Auth and Firestore must belong to the same Firebase project.

### Build-time vs runtime environment separation

- Frontend Vite variables (`VITE_FIREBASE_*`) are injected at Docker image build time.
- Backend server variables (`GOOGLE_CLOUD_*`, `GEMINI_MODEL`, `MOCK_AI`) are read at runtime by Cloud Run.

Important: Setting `VITE_FIREBASE_*` only in Cloud Run runtime env vars is not enough. The values must be present during `npm run build` in the Docker builder stage.

## Local Docker Build

```powershell
cd "D:\CODE\HACKATHON\PromptWars\Week 2"
docker build -t election-assistant:local .
```

## Local Docker Run with Mounted JSON Key

Use a downloaded service-account JSON file only on your local machine. Do not commit it.

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

## Local Docker Run with Mock Mode

This keeps local behavior available for demos even when Vertex is not configured.

```powershell
docker run --rm -p 8080:8080 `
  -e PORT=8080 `
  -e MOCK_AI=true `
  -e GOOGLE_CLOUD_PROJECT=promptwars-493915 `
  -e GOOGLE_CLOUD_LOCATION=us-central1 `
  -e GEMINI_MODEL=gemini-2.5-flash `
  election-assistant:local
```

## PowerShell API Tests

Health check:

```powershell
Invoke-RestMethod -Uri http://localhost:8080/healthz -Method GET | ConvertTo-Json -Depth 3
```

Chat check:

```powershell
Invoke-RestMethod `
  -Uri http://localhost:8080/api/chat `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"message":"Explain voter registration simply","history":[]}' | ConvertTo-Json -Depth 4
```

## Troubleshooting

- Missing credentials file:
  - Verify the host path points to a real JSON file.
  - Verify the container target path matches GOOGLE_APPLICATION_CREDENTIALS.
- Docker mount issues:
  - If the mounted target appears as a directory, your source path is likely wrong.
  - Confirm read access to the host file.
- Vertex permission issues:
  - Ensure the identity used by the app has Vertex AI User role.
  - Confirm project, region, and model values are valid.
- 500 fallback response from /api/chat:
  - Check container logs for chat.model_request_failure.
  - Verify GOOGLE_CLOUD_PROJECT and GOOGLE_CLOUD_LOCATION are set correctly.

## Safe GitHub Push Workflow

Before pushing, confirm no secret files are staged. Never commit JSON keys.

1. Create a new empty repository on GitHub.
1. Initialize git if needed:

```powershell
git init
```

1. Check status:

```powershell
git status
```

1. Stage files:

```powershell
git add .
```

1. Double-check staged files for safety:

```powershell
git status
git diff --cached --name-only
```

1. Commit:

```powershell
git commit -m "Initial commit"
```

1. Set main branch:

```powershell
git branch -M main
```

1. Add remote:

```powershell
git remote add origin <repo-url>
```

1. Push:

```powershell
git push -u origin main
```

## Cloud Run Deployment

### Required APIs

```powershell
gcloud config set project promptwars-493915

gcloud services enable run.googleapis.com `
  artifactregistry.googleapis.com `
  cloudbuild.googleapis.com `
  aiplatform.googleapis.com
```

### Runtime Identity Model

- Cloud Run uses a runtime service account identity.
- Do not mount JSON key files in Cloud Run.
- Example runtime service account:
  `promptwars-cloudrun-sa@promptwars-493915.iam.gserviceaccount.com`

### Build and Push Image (Cloud Build)

```powershell
gcloud builds submit --config cloudbuild.yaml `
  --substitutions _SERVICE_NAME=election-assistant,_REGION=us-central1,_VITE_FIREBASE_API_KEY=YOUR_API_KEY,_VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com,_VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID,_VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.firebasestorage.app,_VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID,_VITE_FIREBASE_APP_ID=YOUR_APP_ID,_VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

If your Cloud Run service already has a stale `GOOGLE_APPLICATION_CREDENTIALS` environment variable, remove it once:

```powershell
gcloud run services update election-assistant `
  --region us-central1 `
  --remove-env-vars GOOGLE_APPLICATION_CREDENTIALS
```

### Deploy to Cloud Run

```powershell
gcloud run deploy election-assistant `
  --image gcr.io/promptwars-493915/election-assistant:latest `
  --region us-central1 `
  --platform managed `
  --allow-unauthenticated `
  --service-account promptwars-cloudrun-sa@promptwars-493915.iam.gserviceaccount.com `
  --set-env-vars GOOGLE_CLOUD_PROJECT=promptwars-493915,GOOGLE_CLOUD_LOCATION=us-central1,GEMINI_MODEL=gemini-2.5-flash,MOCK_AI=false
```

### IAM Guidance (Minimal)

- Runtime service account needs Vertex AI User role:
  - roles/aiplatform.user
- Deployer needs Cloud Run deployment permission:
  - roles/run.developer (or equivalent)
- Deployer needs permission to act as runtime service account:
  - roles/iam.serviceAccountUser on promptwars-cloudrun-sa
- If using Artifact Registry repositories, ensure image push/pull permissions:
  - roles/artifactregistry.writer for push
  - roles/artifactregistry.reader for pull where required

## Optional: GitHub Actions Without Keys

For CI/CD later, prefer GitHub Actions with Workload Identity Federation so no service-account key JSON is stored in GitHub secrets. This is safer than key-based auth and aligns with production best practices.

## Security Rules

- Never commit service-account JSON files.
- Keep key files under local folders such as keys or docker-secrets.
- Use GOOGLE_APPLICATION_CREDENTIALS only for local Docker testing.
- Use Cloud Run service identity in deployed environments.
