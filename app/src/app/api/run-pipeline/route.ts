import { publish } from "@/lib/run-store";
import { createInsforgeServerClient } from "@/lib/insforge";
import { findProspects, findPainSignal } from "@/lib/tinyfish";
import { placeVapiCall } from "@/lib/vapi";
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
  console.log(`[pipeline:${runId.slice(0, 8)}] started — icp="${icp}"`);

  // Step 1: find 3 prospects via TinyFish Google search
  console.log(`[pipeline:${runId.slice(0, 8)}] calling TinyFish findProspects…`);
  const raw = await findProspects(icp);
  console.log(`[pipeline:${runId.slice(0, 8)}] findProspects returned ${raw.length} results:`, JSON.stringify(raw));

  if (raw.length === 0) {
    publish(runId, { type: "error", message: "TinyFish found no prospects for that ICP." });
    publish(runId, { type: "done" });
    return;
  }

  // Publish prospect_found for each result, save to DB
  for (let i = 0; i < raw.length; i++) {
    publish(runId, {
      type: "prospect_found",
      index: i,
      name: raw[i].name,
      phone: raw[i].phone,
      website: raw[i].website,
    });
    await saveProspect(runId, i, raw[i]);
  }

  // Step 2: parallel pain signal research — each call browses Google Maps → Yelp → website
  const painSignalTasks = raw.map((p, i) =>
    findPainSignal(p.name, p.website, service)
      .then((signal) => {
        if (signal) {
          publish(runId, { type: "pain_signal", index: i, painSignal: signal });
        }
        return { index: i, signal };
      })
      .catch((err) => {
        console.error(`Pain signal failed for ${p.name}:`, err);
        return { index: i, signal: null };
      })
  );

  const painResults = await Promise.all(painSignalTasks);

  // Save pain signals to DB
  for (const { index, signal } of painResults) {
    if (signal) {
      await saveProspect(runId, index, {
        ...raw[index],
        pain_signal: signal,
      });
    }
  }

  // Step 3: script generation (template — Claude wiring is next)
  for (let i = 0; i < raw.length; i++) {
    publish(runId, { type: "script_generating", index: i });

    const painSignal = painResults[i]?.signal ?? null;
    const script: Script = {
      opener: `Hi, this is calling about ${raw[i].name}`,
      pain_hook: painSignal
        ? `I came across something specific about your business — ${painSignal}`
        : "",
      service_pitch: service,
      objection_answer: "Takes under 10 minutes to set up, no contracts",
      cta: `Can I show you how it works for ${raw[i].name}?`,
    };

    publish(runId, { type: "script_ready", index: i, script });
    await saveProspect(runId, i, {
      ...raw[i],
      pain_signal: painSignal ?? undefined,
      script,
    });
  }

  // Step 4: place real VAPI calls for all prospects that have a phone number
  for (let i = 0; i < raw.length; i++) {
    const prospect = raw[i];
    const script = (
      await createInsforgeServerClient()
        .database.from("prospects")
        .select("script_json")
        .eq("run_id", runId)
        .eq("idx", i)
        .single()
        .then(({ data }) => data)
    )?.script_json as Script | null;

    if (!prospect.phone || !script) {
      publish(runId, { type: "call_status", index: i, status: "failed" });
      continue;
    }

    publish(runId, { type: "call_status", index: i, status: "initiated" });
    await saveCallStatus(runId, i, "initiated");

    try {
      const { callId } = await placeVapiCall(prospect.phone, prospect.name, script, runId);
      await saveCallStatus(runId, i, "initiated", callId);
      console.log(`[pipeline:${runId.slice(0, 8)}] VAPI call placed for ${prospect.name} — callId=${callId}`);
    } catch (err) {
      console.error(`[pipeline:${runId.slice(0, 8)}] VAPI call failed for ${prospect.name}:`, err);
      publish(runId, { type: "call_status", index: i, status: "failed" });
      await saveCallStatus(runId, i, "failed");
    }
  }

  publish(runId, { type: "done" });
}
