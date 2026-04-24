import { publish } from "@/lib/run-store";
import { createInsforgeServerClient } from "@/lib/insforge";
import type { PipelineConfig, Script } from "@/lib/pipeline-types";

export async function POST(request: Request) {
  const body: PipelineConfig = await request.json();
  const { run_id, service, icp } = body;

  if (!run_id || !service || !icp) {
    return Response.json({ error: "Missing run_id, service, or icp" }, { status: 400 });
  }

  runPipeline(run_id, service, icp).catch((err) => {
    console.error("Pipeline error:", err);
    publish(run_id, { type: "error", message: String(err) });
  });

  return Response.json({ run_id, status: "started" });
}

async function saveProspect(
  runId: string,
  idx: number,
  data: { name: string; phone: string; website: string; pain_signal?: string; script?: Script }
) {
  try {
    const db = createInsforgeServerClient();
    await db.database
      .from("prospects")
      .upsert({
        run_id: runId,
        idx,
        name: data.name,
        phone: data.phone,
        website: data.website,
        pain_signal: data.pain_signal ?? null,
        script_json: data.script ?? null,
      })
      .eq("run_id", runId)
      .eq("idx", idx);
  } catch (err) {
    console.error("DB save prospect failed:", err);
  }
}

async function saveCallStatus(runId: string, prospectIdx: number, status: string, vapiCallId?: string) {
  try {
    const db = createInsforgeServerClient();
    await db.database
      .from("calls")
      .upsert({
        run_id: runId,
        prospect_idx: prospectIdx,
        status,
        ...(vapiCallId ? { vapi_call_id: vapiCallId } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("run_id", runId)
      .eq("prospect_idx", prospectIdx);
  } catch (err) {
    console.error("DB save call status failed:", err);
  }
}

async function runPipeline(runId: string, service: string, icp: string) {
  // TODO Hour 4: replace with real TinyFish search + fetch
  await simulatePipeline(runId);
}

async function simulatePipeline(runId: string) {
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const prospects = [
    { name: "Memphis CPA Group", phone: "+19015550101", website: "https://memphiscpagroup.com" },
    { name: "Shelby Tax Advisors", phone: "+19015550142", website: "https://shelbytax.com" },
    { name: "River City Accounting", phone: "+19015550187", website: "https://rivercityacct.com" },
  ];

  const painSignals = [
    "Yelp review: 'Called 3 times after 5pm — always goes to voicemail'",
    "Google review: 'Took 2 days to get a call back during tax season'",
    null,
  ];

  // Prospect discovery
  for (let i = 0; i < prospects.length; i++) {
    await delay(800);
    publish(runId, {
      type: "prospect_found",
      index: i,
      name: prospects[i].name,
      phone: prospects[i].phone,
      website: prospects[i].website,
    });
    await saveProspect(runId, i, prospects[i]);

    if (painSignals[i]) {
      await delay(600);
      publish(runId, { type: "pain_signal", index: i, painSignal: painSignals[i]! });
    }
  }

  // Script generation
  for (let i = 0; i < prospects.length; i++) {
    await delay(400);
    publish(runId, { type: "script_generating", index: i });
    await delay(1200);

    const script: Script = {
      opener: `Hi, this is Alex calling from AI Scheduling`,
      pain_hook: i < 2 ? `I saw a review mentioning calls go to voicemail after hours` : "",
      service_pitch: `We book client consultations automatically — 24/7, no missed calls`,
      objection_answer: `Takes under 10 minutes to set up, no contracts`,
      cta: `Can I show you how it works for ${prospects[i].name}?`,
    };

    publish(runId, { type: "script_ready", index: i, script });
    await saveProspect(runId, i, {
      ...prospects[i],
      pain_signal: painSignals[i] ?? undefined,
      script,
    });
  }

  // VAPI call for prospect #1
  const callStatuses = ["initiated", "ringing", "answered", "completed"] as const;
  const delays = [500, 1500, 2000, 3000];

  for (let s = 0; s < callStatuses.length; s++) {
    await delay(delays[s]);
    const status = callStatuses[s];
    publish(runId, { type: "call_status", index: 0, status });
    await saveCallStatus(runId, 0, status);
  }

  publish(runId, { type: "done" });
}
