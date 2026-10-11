# CareBridge AI

Appointment preparation companion. Entry foundation for **DSH Hacks V2**.

## Run

Python 3.10+; no dependencies. From this directory:

```sh
python3 app.py
```

Open http://127.0.0.1:8000. Set PORT to run multiple projects.

## Current implementation

Working web form and JSON API with validation. All logic is deterministic. No credentials, AI inference, real payments or persisted personal data. This is an initial prototype, not a completed qualifying submission.

## Build next

Real AI integration; healthcare-focused evaluation; consent and privacy; interactive demo; one-page PDF; organizer deadline clarification.

## Submission checklist

- Verify current official rules and project originality window.
- Complete required sponsor integration and end-to-end tests.
- Provide deployment, demo video and judge instructions.
- Document baseline versus new work and all third-party licenses.

## License

MIT.

## Vercel AI Gateway integration

Optional AI drafts use the server-only Chat Completions endpoint. Set `AI_GATEWAY_MODEL` to a model from the live catalog and use `AI_GATEWAY_API_KEY` locally or `VERCEL_OIDC_TOKEN` on Vercel. `.env.example` documents configuration; the Python server reads exported environment variables and does not automatically load .env files.

Text is sent only after explicit consent. Use fictional examples; saved reports are never sent automatically. Output is validated and labeled AI-generated. No live generation has been verified without project credentials. Add authenticated access and rate limiting before exposing this endpoint publicly.
