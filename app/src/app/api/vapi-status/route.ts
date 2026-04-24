import { publish } from "@/lib/run-store";
import type { CallStatus } from "@/lib/pipeline-types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const runId = body.run_id ?? body.metadata?.run_id;
  const vapiStatus = body.status ?? body.message?.call?.status;

  if (!runId || !vapiStatus) {
    return Response.json({ received: true });
  }

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

  const status: CallStatus = statusMap[vapiStatus] ?? "initiated";
  publish(runId, { type: "call_status", index: 0, status });

  return Response.json({ received: true });
}
