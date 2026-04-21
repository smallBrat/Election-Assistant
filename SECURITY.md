# Security

## API keys

- `GEMINI_API_KEY` is handled as a runtime secret on Cloud Run.
- The key is never committed to the repository or embedded in client code.
- Local development should use a local environment variable or secret file outside version control.

## Gemini prompt safety

- The assistant system prompt keeps the model focused on civic education and neutral explanations.
- The assistant is instructed not to persuade, endorse candidates, or provide partisan guidance.
- The assistant reminds users that election rules vary by country, state, and region and should be verified against official sources.

## Output handling

- Assistant failures fall back to a local educational response instead of exposing stack traces to users.
- Server errors are logged to Cloud Logging for operator review.