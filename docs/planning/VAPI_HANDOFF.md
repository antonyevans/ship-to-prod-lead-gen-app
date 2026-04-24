# Vapi + Twilio Voice Integration Handoff

> **Updated:** 2026-04-24 4:35 PM CT — Phone number re-imported with proper Twilio credentials. Outbound calls confirmed working.

## 1. What Changed

- **Phone Number ID changed.** The old ID (`6be348ab...`) was deleted and re-imported with Twilio credentials attached. The new ID is below.
- **Riley assistant configured.** There is now a persistent assistant (`Riley - Surfaced Sales Agent`) in the Vapi dashboard with the full lead gen prompt, evidence-first selling approach, and objection handling. You can use `assistantId` instead of inline assistant configs.
- **Outbound calls confirmed working** via Twilio provider. Free Vapi numbers do NOT work for outbound — must use Twilio.

## 2. Environment Variables Required (Fly.io)

Update these on your Fly.io deployment:

```env
VAPI_API_KEY=<SEE_DISCORD_CHAT>
VAPI_PHONE_NUMBER_ID=e1685855-60a6-4a5b-8b0c-fad8e4453c89
VAPI_ASSISTANT_ID=8ae795f1-58a6-4eb1-9e78-8b62ea705d96
VAPI_WEBHOOK_URL=https://v3b4dapw.insforge.site/api/vapi-status
```

## 3. Two Ways to Place a Call

### Option A: Use `assistantId` (recommended — uses Riley's dashboard config)
```typescript
const res = await fetch("https://api.vapi.ai/call", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    assistantId: process.env.VAPI_ASSISTANT_ID,
    phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
    customer: { number: customerPhone }, // E.164 format
  }),
});
```

### Option B: Use inline assistant (current approach in `vapi.ts`)
Works fine — just make sure `VAPI_PHONE_NUMBER_ID` is updated to the new value above.

## 4. Important Notes

- **Twilio is a trial account** — can only call verified numbers. For the demo, the test override number must be verified in the Twilio console.
- **Free Vapi numbers DO NOT work for outbound.** They get blocked by carrier spam filters. Always use the Twilio number.
- **Riley's prompt** is configured in the Vapi dashboard. It includes: evidence-first opener, pain hook, automation pitch, objection handling, and CTA to book a follow-up demo. You can edit it at https://dashboard.vapi.ai/assistants.
- **Server URL** is set on Riley to `https://v3b4dapw.insforge.site/api/vapi-status` so transcripts are sent to the backend automatically.

## 5. Final Checklist
- [ ] Update `VAPI_PHONE_NUMBER_ID` on Fly.io to `e1685855-60a6-4a5b-8b0c-fad8e4453c89`
- [ ] Optionally add `VAPI_ASSISTANT_ID` env var and switch `vapi.ts` to use it
- [ ] Verify the test override number is verified in Twilio (for trial account)
- [ ] Run end-to-end pipeline test from the dashboard
- [ ] Confirm transcripts arrive at `/api/vapi-status` webhook

Happy hacking! 🚀
