import { publish } from "@/lib/run-store";
import { createInsforgeServerClient } from "@/lib/insforge";
import type { CallStatus } from "@/lib/pipeline-types";

const statusMap: Record<string, CallStatus> = {
  initiated: "initiated",
  ringing: "ringing",
  "in-progress": "answered",
  answered: "answered",
  completed: "completed",
  voicemail: "voicemail",
  "no-answer": "no-answer",
  failed: "failed",
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ received: true });

  const runId = body.run_id ?? body.metadata?.run_id;
  const vapiStatus = body.status ?? body.message?.call?.status;
  const vapiCallId = body.call_id ?? body.message?.call?.id;

  if (!runId || !vapiStatus) return Response.json({ received: true });

  const status: CallStatus = statusMap[vapiStatus] ?? "initiated";

  // Publish to SSE stream
  publish(runId, { type: "call_status", index: 0, status });

  // Persist to DB (fire and forget — don't block the webhook response)
  createInsforgeServerClient().database
    .from("calls")
    .upsert({
      run_id: runId,
      prospect_idx: 0,
      status,
      ...(vapiCallId ? { vapi_call_id: vapiCallId } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("run_id", runId)
    .eq("prospect_idx", 0)
    .then(({ error }) => { if (error) console.error("DB call status:", error); });

  return Response.json({ received: true });
}
