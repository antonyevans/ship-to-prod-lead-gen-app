import { publish } from "@/lib/run-store";
import type { PipelineConfig } from "@/lib/pipeline-types";

export async function POST(request: Request) {
  const body: PipelineConfig = await request.json();
  const { run_id, service, icp } = body;

  if (!run_id || !service || !icp) {
    return Response.json({ error: "Missing run_id, service, or icp" }, { status: 400 });
  }

  // Kick off pipeline async — respond immediately so frontend can open SSE
  runPipeline(run_id, service, icp).catch((err) => {
    console.error("Pipeline error:", err);
    publish(run_id, { type: "error", message: String(err) });
  });

  return Response.json({ run_id, status: "started" });
}

async function runPipeline(runId: string, service: string, icp: string) {
  // TODO Hour 4: replace with real TinyFish search + fetch
  // For now: simulate the pipeline with fake data so the UI is demoable
  await simulatePipeline(runId);
}

async function simulatePipeline(runId: string) {
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const prospects = [
    { name: "Memphis CPA Group", phone: "+19015550101", website: "https://memphiscpagroup.com" },
    { name: "Shelby Tax Advisors", phone: "+19015550142", website: "https://shelbytax.com" },
    { name: "River City Accounting", phone: "+19015550187", website: "https://rivercityacct.com" },
  ];

  // Simulate prospect discovery
  for (let i = 0; i < prospects.length; i++) {
    await delay(800);
    publish(runId, {
      type: "prospect_found",
      index: i,
      name: prospects[i].name,
      phone: prospects[i].phone,
      website: prospects[i].website,
    });
    await delay(600);
    const painSignals = [
      "Yelp review: 'Called 3 times after 5pm — always goes to voicemail'",
      "Google review: 'Took 2 days to get a call back during tax season'",
      null,
    ];
    if (painSignals[i]) {
      publish(runId, { type: "pain_signal", index: i, painSignal: painSignals[i]! });
    }
  }

  // Simulate script generation
  for (let i = 0; i < prospects.length; i++) {
    await delay(400);
    publish(runId, { type: "script_generating", index: i });
    await delay(1200);
    publish(runId, {
      type: "script_ready",
      index: i,
      script: {
        opener: `Hi, this is Alex calling from AI Scheduling`,
        pain_hook: i < 2 ? `I saw a review mentioning calls go to voicemail after hours` : "",
        service_pitch: `We book client consultations automatically — 24/7, no missed calls`,
        objection_answer: `Takes under 10 minutes to set up, no contracts`,
        cta: `Can I show you how it works for ${prospects[i].name}?`,
      },
    });
  }

  // Simulate VAPI call for prospect #1
  await delay(500);
  publish(runId, { type: "call_status", index: 0, status: "initiated" });
  await delay(1500);
  publish(runId, { type: "call_status", index: 0, status: "ringing" });
  await delay(2000);
  publish(runId, { type: "call_status", index: 0, status: "answered" });
  await delay(3000);
  publish(runId, { type: "call_status", index: 0, status: "completed" });
  publish(runId, { type: "done" });
}
