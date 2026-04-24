import { placeVapiCall } from "@/lib/vapi";
import type { Script } from "@/lib/pipeline-types";

export async function POST() {
  const script: Script = {
    opener: "Hi, this is Riley calling about Hill CPA Firm. I noticed your website doesn't have online booking — I wanted to show you how we can fix that in under 10 minutes.",
    pain_hook: "Your website has no scheduling link — customers have to call or fill out a form.",
    service_pitch: "AI-powered scheduling that takes under 10 minutes to set up",
    objection_answer: "No contracts, takes under 10 minutes to set up",
    cta: "Can I show you how it works for Hill CPA Firm?",
  };

  const phone = process.env.TEST_PHONE_NUMBER ?? "+14157796333";

  try {
    const { callId } = await placeVapiCall(phone, "Hill CPA Firm", script, "test-call-001");
    return Response.json({ ok: true, callId, phone });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
