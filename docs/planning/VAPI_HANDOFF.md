# Vapi + Twilio Voice Integration Handoff

This document outlines the final state of the Vapi Voice Agent integration so the rest of the team can seamlessly wire it into the production Next.js backend.

## 1. Environment Variables Required
Daniel has successfully provisioned a Twilio phone number and linked it to the Vapi project. For the Next.js production backend to initiate outbound calls via the Vapi API, you **must add the following keys to your Vercel (or Insforge) Environment Variables**:

```env
# Daniel's Vapi API Key (required to authorize calls)
VAPI_API_KEY=<SEE_DISCORD_CHAT>

# The UUID of the Twilio Phone Number imported into Vapi (required for outbound)
VAPI_PHONE_NUMBER_ID=<SEE_DISCORD_CHAT>
```

## 2. Webhook Configuration
The Vapi assistant is currently configured to send live call events (transcripts, status updates, completion payloads) to our production webhook:
`https://v3b4dapw.insforge.site/api/vapi-status`

Ensure your `route.ts` at that endpoint is ready to accept `POST` requests and parse the `body.transcript` and `body.status` fields.

## 3. Triggering Outbound Calls
To initiate a call from the Next.js backend (e.g., inside `run-pipeline/route.ts`), you can use the exact JSON schema we validated in Python. Here is the TypeScript equivalent using `fetch`:

```typescript
const triggerCall = async (customerName: string, customerPhone: string) => {
  const response = await fetch("https://api.vapi.ai/call", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
      customer: {
        number: customerPhone // Must be E.164 format (e.g., +14697742043)
      },
      assistant: {
        model: {
          provider: "openai",
          model: "gpt-4-turbo",
          messages: [
            {
              role: "system",
              content: `You are an energetic sales agent representing our Lead Gen team. The prospect you are speaking to is ${customerName}. Your core objective is to pitch the product and extract budget requirements.`
            }
          ]
        },
        serverUrl: "https://v3b4dapw.insforge.site/api/vapi-status",
        voice: {
          provider: "11labs",
          voiceId: "pMsXgVXv3BLzUgSXRplE"
        }
      }
    })
  });

  const data = await response.json();
  return data;
};
```

## 4. Final Checklist for Team
- [ ] Add the two ENV variables to production.
- [ ] Ensure `run-pipeline` executes the outbound call fetch request above.
- [ ] Verify `vapi-status` webhook correctly persists transcripts to the Insforge database.

Happy hacking! 🚀
