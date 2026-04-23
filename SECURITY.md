# Security

## Identity and credentials

- Cloud Run uses service identity for Vertex AI access.
- `GOOGLE_APPLICATION_CREDENTIALS` is local-development only and should not be used in Cloud Run.
- Service-account JSON files must stay outside version control and never be committed.

## Gemini prompt safety

- The assistant system prompt keeps the model focused on civic education and neutral explanations.
- The assistant is instructed not to persuade, endorse candidates, or provide partisan guidance.
- The assistant reminds users that election rules vary by country, state, and region and should be verified against official sources.

## Output handling

- Assistant failures fall back to a local educational response instead of exposing stack traces to users.
- Server errors are logged to Cloud Logging for operator review.
