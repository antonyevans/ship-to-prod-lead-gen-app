# Surfaced — AI Lead Gen Agent: Runbook

Built for the Ship to Prod Hackathon (April 24, 2026).

**What it does:** Given a service description and an ideal customer profile (ICP), the pipeline finds real local businesses, researches a specific pain signal per prospect (missed calls, no online booking, etc.), generates a personalized script, and has Riley (a VAPI AI voice agent) call the first prospect.

---

## Architecture

```
User submits ICP + service
        ↓
POST /api/run-pipeline
        ↓
TinyFish → YellowPages   (finds 3 prospects with name/phone/website)
        ↓
TinyFish → prospect website + Google Maps reviews   (parallel, pain signal per prospect)
        ↓
Script generation   (template-based, uses pain signal)
        ↓
VAPI → Riley assistant   (calls first prospect via Twilio)
        ↓
/api/vapi-status webhook   (VAPI posts call status updates back)
        ↓
SSE stream → live UI   (prospect cards update in real time)
```

All pipeline events are streamed to the browser via Server-Sent Events. Events are buffered in-memory so late-connecting clients get the full history on join.

---

## Env Vars

Create `app/.env.local` with:

```bash
# TinyFish — web research agent
TINYFISH_API_KEY=sk-tinyfish-...

# VAPI — voice calls
VAPI_API_KEY=441103c2-ad19-4081-9f20-2b8a9c77d725
VAPI_PHONE_NUMBER_ID=e1685855-60a6-4a5b-8b0c-fad8e4453c89   # Twilio number (must have credentials linked)
VAPI_ASSISTANT_ID=8ae795f1-58a6-4eb1-9e78-8b62ea705d96       # Riley assistant
VAPI_WEBHOOK_URL=https://lead-gen-agent-stp.fly.dev/api/vapi-status

# Insforge — database (prospects + calls tables)
NEXT_PUBLIC_INSFORGE_URL=https://94uc2w9u.us-east.insforge.app
INSFORGE_SERVICE_KEY=ik_...
NEXT_PUBLIC_APP_URL=https://94uc2w9u.insforge.site

# Override call destination during testing (optional — falls back to prospect's real number)
TEST_PHONE_NUMBER=+14697742043
```

**On Fly.io**, all of the above (except `NEXT_PUBLIC_*`) must be set as secrets:
```bash
fly secrets set TINYFISH_API_KEY=... VAPI_API_KEY=... VAPI_PHONE_NUMBER_ID=... \
  VAPI_ASSISTANT_ID=... VAPI_WEBHOOK_URL=... INSFORGE_SERVICE_KEY=... \
  TEST_PHONE_NUMBER=... --app lead-gen-agent-stp
```

---

## Running Locally

```bash
cd app
npm install
npm run dev
```

Open http://localhost:3000. Fill in service + ICP and hit Run. The pipeline streams results live.

---

## Deployed App

- **URL:** https://lead-gen-agent-stp.fly.dev
- **Deploy:** `cd app && fly deploy --app lead-gen-agent-stp`
- **Logs:** `fly logs --app lead-gen-agent-stp`
- **Secrets:** `fly secrets list --app lead-gen-agent-stp`

---

## API Endpoints

### `POST /api/run-pipeline`
Starts the full pipeline asynchronously. Returns immediately; stream events via `/api/status`.

```json
{
  "run_id": "unique-id",
  "service": "AI scheduling that books appointments automatically",
  "icp": "CPA firms in Memphis TN with 2-15 staff"
}
```

### `GET /api/status?run_id=<id>`
SSE stream of pipeline events. Events:
- `prospect_found` — name, phone, website
- `pain_signal` — specific evidence of a problem
- `script_generating` / `script_ready` — script fields
- `call_status` — initiated / ringing / answered / completed / failed
- `error` — pipeline-level error
- `done` — pipeline finished

### `POST /api/test-call`
Skips TinyFish entirely and places a single VAPI call to `TEST_PHONE_NUMBER` using a hardcoded test script. Use this to verify VAPI credentials without waiting ~4 minutes for the full pipeline.

```bash
curl -X POST https://lead-gen-agent-stp.fly.dev/api/test-call
# → {"ok":true,"callId":"...","phone":"+14697742043"}
```

### `POST /api/vapi-status`
Webhook called by VAPI when call status changes. Maps VAPI status strings to internal `CallStatus` types, publishes to the SSE stream, and persists to Insforge DB.

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/api/run-pipeline/route.ts` | Full pipeline orchestration (4 steps) |
| `src/app/api/test-call/route.ts` | One-shot VAPI smoke test |
| `src/app/api/vapi-status/route.ts` | VAPI webhook handler |
| `src/app/api/status/route.ts` | SSE stream endpoint |
| `src/lib/tinyfish.ts` | TinyFish web research (prospect discovery + pain signals) |
| `src/lib/vapi.ts` | VAPI outbound call placement |
| `src/lib/run-store.ts` | In-memory SSE pub/sub with replay buffer |
| `src/lib/insforge.ts` | Insforge DB client |
| `src/lib/pipeline-types.ts` | Shared TypeScript types |
| `src/app/page.tsx` | Home page (ICP + service form) |
| `src/app/pipeline/page.tsx` | Live pipeline dashboard |

---

## VAPI Setup

The voice agent uses **Riley** — a pre-configured VAPI assistant with an evidence-first sales prompt. Per-call customization (opener, pain hook) is injected via `assistantOverrides.firstMessage`.

The Twilio phone number (`+18146474894`, ID `e1685855-...`) must have Twilio credentials linked in the VAPI dashboard:

1. VAPI Dashboard → **Provider Credentials** → Add → Twilio
2. Enter Account SID + Auth Token
3. **Phone Numbers** → select `+18146474894` → link that credential

The free Vapi-native numbers do **not** work for outbound calls. Must use a Twilio number.

---

## TinyFish Notes

- TinyFish is a browser-automation-as-API service. Each call opens a headless browser, navigates to the target URL, and extracts structured data via an LLM.
- **Prospect discovery** hits YellowPages (not Google — datacenter IPs are throttled by Google). Takes ~4 min from Fly.io.
- **Pain signal research** starts directly at the prospect's website when available (faster than going via Google Maps). Looks for: no online booking, voicemail-only, slow response, after-hours gaps.
- Goals passed to TinyFish must be short (one sentence). Multi-line goals exhaust `max_steps` and timeout.
- All pain signal tasks run in parallel with a 90-second timeout each.

---

## Demo Flow

1. Open https://lead-gen-agent-stp.fly.dev
2. Enter service: `"AI scheduling that books appointments automatically"`
3. Enter ICP: `"CPA firms in Memphis TN with 2-15 staff"`
4. Hit **Run Pipeline**
5. Watch prospect cards appear and update in real time (~4 min total)
6. Riley calls the first prospect's number (or `TEST_PHONE_NUMBER` if set)

To test VAPI in isolation without waiting for TinyFish:
```bash
curl -X POST https://lead-gen-agent-stp.fly.dev/api/test-call
```

---

## Current Limitations / TODOs

- Script generation is template-based. Claude API wiring for personalized scripts is the next step.
- Only the first prospect gets called (demo mode — `Math.min(1, raw.length)`). Remove the `Math.min` cap to call all three.
- `TEST_PHONE_NUMBER` overrides the real prospect number. Remove or unset before calling real prospects.
- TinyFish latency (~4 min from server) is the main bottleneck. Caching or a faster data source would help.
- VAPI webhook (`/api/vapi-status`) currently hardcodes `prospect_idx: 0`. Needs per-call index tracking for multi-call runs.
