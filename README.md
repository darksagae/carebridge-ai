# CareBridge AI

**Walk into your appointment ready.** CareBridge turns your worries and symptoms into a clear one-page visit brief and the right questions, so nothing important gets forgotten in a short appointment.

Built for DSH Hacks V2.

## Before, during and after the visit

1. **Guided intake in five steps:**
   - visit type, date and who you're seeing;
   - your main concern, plus symptoms with when they started, how often and a 0–10 severity slider;
   - medicines and allergies;
   - goals for the visit;
   - questions you already have.
2. **A visit brief** containing:
   - a first-person summary;
   - the key facts to tell the clinician;
   - a medicines and allergies table;
   - a prioritised question list (your own questions first and starred);
   - what to bring.

   Everything is editable: rewrite the summary, and add, edit, reorder, star or delete questions.

3. **Visit mode:** a large, distraction-free checklist for the room. Tick questions as you ask them and type the answers.
4. **Keep it:** print or save as PDF (with a print stylesheet), copy as text, or download with your answers included.

## Two ways to write the brief

|               | Built-in template | Write it with AI                                                                 |
| ------------- | ----------------- | -------------------------------------------------------------------------------- |
| Where it runs | In the browser    | Server → Vercel AI Gateway                                                       |
| Data sent     | Nothing           | Your notes, after explicit consent                                               |
| Availability  | Always            | When `AI_GATEWAY_MODEL` plus `AI_GATEWAY_API_KEY` or `VERCEL_OIDC_TOKEN` are set |

**Template:** builds the brief from transparent rules and neutral question banks for each visit type and goal ([`lib/template.ts`](lib/template.ts)).

**AI:** the system prompt forbids diagnosis, treatment advice, urgency judgements and invented facts, and treats the patient's text as data, not instructions. The model must return JSON, which is validated with zod. The server then puts your own questions back at the top and adds the "when to seek help sooner" question ([`lib/gateway.ts`](lib/gateway.ts)). If the AI fails, the template is one click away.

## Safety

- [`lib/safety.ts`](lib/safety.ts) watches the concern and symptoms for words that can describe an emergency: chest pain, trouble breathing, stroke signs, self-harm, heavy bleeding, fainting or seizures, or a severe allergic reaction. When it finds one, it shows clear advice to call the local emergency number now rather than wait for the appointment. A 9–10/10 rating triggers a gentler "contact a clinician sooner" note. This is a cautious safety net, not triage.
- Every page footer states that CareBridge is not for emergencies and does not diagnose or give medical advice.

## Privacy

- No accounts, analytics or third-party scripts. Fonts are self-hosted.
- Notes live in the browser only. By default they are kept in `sessionStorage` and disappear when the tab closes. "Keep on this device" moves them to `localStorage`, and "Clear everything" / "Start over" removes them.
- The server stores nothing. The AI route is same-origin only, size-limited, rate-limited and never logs request bodies.
- Strict per-request nonce CSP (`proxy.ts`), `no-referrer`, `frame-ancestors 'none'`.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · zod · Vitest · Playwright. The type is Atkinson Hyperlegible (designed for low-vision readers) with Source Serif 4 headings, at a 17 px base size.

```
app/                 landing, /prepare, /api/brief (GET availability, POST draft), /api/health
components/prepare/  intake steps, generator, brief view, visit mode, storage hook
lib/                 intake schema, brief schema, template, gateway adapter, safety check, text export
tests/unit/          template, validation, safety words, gateway adapter and API route (mocked)
tests/e2e/           full journey incl. visit mode, download, reload and clear; emergency banner; CSP
```

## Run it

Requires Node.js 22.13 or newer.

```sh
npm install
npm run dev                      # http://localhost:3000
```

To enable AI drafting, copy `.env.example`, pick a model from the [AI Gateway catalogue](https://vercel.com/ai-gateway/models) and export `AI_GATEWAY_API_KEY`. On Vercel, the OIDC token is provided automatically. Next.js loads `.env.local`.

## Test

```sh
npm test                          # 14 unit tests
npm run lint                      # formatting and type check
npm run build && npm run test:e2e # browser journeys on desktop and mobile
```

Set `CHROMIUM_PATH` to use an existing Chromium. Live AI output has not been evaluated in this rebuild, because the gateway is mocked in tests. Review drafts with clinicians before any real use.

## License

MIT
