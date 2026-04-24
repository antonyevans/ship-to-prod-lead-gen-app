import type { Script } from "@/lib/pipeline-types";

const VAPI_API_KEY = process.env.VAPI_API_KEY!;
const VAPI_PHONE_NUMBER_ID = process.env.VAPI_PHONE_NUMBER_ID!;
const VAPI_ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID!;
const VAPI_WEBHOOK_URL = process.env.VAPI_WEBHOOK_URL ?? "";

export interface VapiCallResult {
  callId: string;
}

export async function placeVapiCall(
  phone: string,
  prospectName: string,
  script: Script,
  runId: string
): Promise<VapiCallResult> {
  const payload = {
    phoneNumberId: VAPI_PHONE_NUMBER_ID,
    assistantId: VAPI_ASSISTANT_ID,
    assistantOverrides: {
      firstMessage: script.opener,
    },
    customer: { number: phone, name: prospectName },
    metadata: { run_id: runId },
  };

  const res = await fetch("https://api.vapi.ai/call/phone", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`VAPI call failed ${res.status}: ${text}`);
  }

  const data = await res.json();
  return { callId: data.id };
}
