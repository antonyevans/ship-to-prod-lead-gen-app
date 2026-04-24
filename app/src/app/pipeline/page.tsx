"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Prospect, PipelineEvent, CallStatus } from "@/lib/pipeline-types";

const EMPTY_PROSPECT = (index: number): Prospect => ({
  index,
  name: "",
  phone: null,
  website: null,
  pain_signal: null,
  prospectStatus: "searching",
  scriptStatus: "waiting",
  callStatus: "waiting",
  script: null,
});

function callStatusLabel(status: CallStatus) {
  switch (status) {
    case "waiting": return "Waiting";
    case "initiated": return "Call initiated";
    case "ringing": return "Ringing";
    case "answered": return "Answered";
    case "completed": return "Completed";
    case "voicemail": return "Left voicemail";
    case "no-answer": return "No answer";
    case "failed": return "Failed";
  }
}

function callStatusColor(status: CallStatus) {
  switch (status) {
    case "answered":
    case "initiated":
    case "ringing": return "text-flare";
    case "completed": return "text-charcoal font-medium";
    case "voicemail":
    case "no-answer": return "text-stone";
    case "failed": return "text-red-500";
    default: return "text-stone";
  }
}

function ProspectCard({ prospect }: { prospect: Prospect }) {
  const hasName = prospect.name !== "";
  return (
    <div className="bg-white rounded-lg p-4 border border-sand">
      {hasName ? (
        <>
          <p className="font-medium text-charcoal text-sm">{prospect.name}</p>
          {prospect.phone && (
            <p className="text-xs text-stone mt-0.5">{prospect.phone}</p>
          )}
          {prospect.pain_signal && (
            <div className="mt-2.5 bg-flare/5 border border-flare/20 rounded p-2.5">
              <p className="text-xs text-flare font-medium">Signal found</p>
              <p className="text-xs text-charcoal mt-0.5 leading-relaxed">{prospect.pain_signal}</p>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-flare animate-pulse" />
          <p className="text-sm text-stone">Searching</p>
        </div>
      )}
    </div>
  );
}

function ScriptCard({ prospect }: { prospect: Prospect }) {
  switch (prospect.scriptStatus) {
    case "waiting":
      return (
        <div className="bg-white rounded-lg p-4 border border-sand">
          <p className="text-sm text-stone">Waiting</p>
        </div>
      );
    case "generating":
      return (
        <div className="bg-white rounded-lg p-4 border border-sand">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-charcoal animate-pulse" />
            <p className="text-sm text-charcoal">Writing script</p>
          </div>
          {prospect.name && <p className="text-xs text-stone mt-1">{prospect.name}</p>}
        </div>
      );
    case "ready":
      return (
        <div className="bg-white rounded-lg p-4 border border-sand space-y-2">
          <p className="text-xs text-stone">{prospect.name}</p>
          <p className="text-xs text-charcoal">
            <span className="text-stone">Opener: </span>
            {prospect.script?.opener}
          </p>
          {prospect.script?.pain_hook && (
            <p className="text-xs text-flare">
              <span className="text-stone">Hook: </span>
              {prospect.script.pain_hook}
            </p>
          )}
          <p className="text-xs text-charcoal">
            <span className="text-stone">Pitch: </span>
            {prospect.script?.service_pitch}
          </p>
        </div>
      );
    case "failed":
      return (
        <div className="bg-white rounded-lg p-4 border border-red-200">
          <p className="text-sm text-red-500">Script failed — using template</p>
        </div>
      );
  }
}

function CallCard({ prospect }: { prospect: Prospect }) {
  const isActive = prospect.callStatus !== "waiting" && prospect.callStatus !== "completed";
  const CALL_STAGES: CallStatus[] = ["initiated", "ringing", "answered"];
  const stageIdx = CALL_STAGES.indexOf(prospect.callStatus);

  return (
    <div
      className={`bg-white rounded-lg p-4 border ${
        isActive ? "border-flare/30" : "border-sand"
      }`}
    >
      {prospect.name ? (
        <>
          <p className="text-xs text-stone mb-1">{prospect.name}</p>
          <p className={`text-sm ${callStatusColor(prospect.callStatus)}`}>
            {callStatusLabel(prospect.callStatus)}
          </p>
          {stageIdx >= 0 && (
            <div className="mt-2.5 flex gap-1">
              {CALL_STAGES.map((s, i) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full ${
                    i <= stageIdx ? "bg-flare" : "bg-sand"
                  }`}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-stone">Waiting</p>
      )}
    </div>
  );
}

function PipelineInner() {
  const searchParams = useSearchParams();
  const runId = searchParams.get("run_id");
  const [prospects, setProspects] = useState<Prospect[]>([
    EMPTY_PROSPECT(0),
    EMPTY_PROSPECT(1),
    EMPTY_PROSPECT(2),
  ]);
  const [done, setDone] = useState(false);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!runId) return;

    const es = new EventSource(`/api/status?run_id=${runId}`);
    eventSourceRef.current = es;

    es.onmessage = (e) => {
      const event: PipelineEvent = JSON.parse(e.data);
      setProspects((prev) => {
        const next = prev.map((p) => ({ ...p }));

        switch (event.type) {
          case "prospect_found":
            next[event.index] = {
              ...next[event.index],
              name: event.name,
              phone: event.phone,
              website: event.website,
              prospectStatus: "found",
            };
            break;
          case "pain_signal":
            next[event.index] = {
              ...next[event.index],
              pain_signal: event.painSignal,
            };
            break;
          case "script_generating":
            next[event.index] = {
              ...next[event.index],
              scriptStatus: "generating",
            };
            break;
          case "script_ready":
            next[event.index] = {
              ...next[event.index],
              scriptStatus: "ready",
              script: event.script,
            };
            break;
          case "script_failed":
            next[event.index] = {
              ...next[event.index],
              scriptStatus: "failed",
            };
            break;
          case "call_status":
            next[event.index] = {
              ...next[event.index],
              callStatus: event.status,
            };
            break;
          case "error":
            setPipelineError(event.message);
            break;
          case "done":
            setDone(true);
            es.close();
            break;
        }
        return next;
      });
    };

    return () => es.close();
  }, [runId]);

  return (
    <main className="min-h-screen bg-warm-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <a href="/" className="font-heading text-xl font-bold text-charcoal tracking-tight">
              surfaced<span className="text-flare">·</span>
            </a>
            <p className="text-stone text-sm mt-1">
              Pipeline running
            </p>
          </div>
          {done && (
            <span className="bg-flare/10 border border-flare/30 text-flare text-sm px-3 py-1.5 rounded-full">
              Pipeline complete
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-flare" />
              Researching
            </h2>
            <div className="space-y-3">
              {prospects.map((p) => (
                <ProspectCard key={p.index} prospect={p} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-charcoal" />
              Writing script
            </h2>
            <div className="space-y-3">
              {prospects.map((p) => (
                <ScriptCard key={p.index} prospect={p} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-charcoal" />
              Calling
            </h2>
            <div className="space-y-3">
              {prospects.map((p) => (
                <CallCard key={p.index} prospect={p} />
              ))}
            </div>
          </div>
        </div>

        {pipelineError && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600 font-medium">Pipeline error</p>
            <p className="text-xs text-red-500 mt-0.5">{pipelineError}</p>
          </div>
        )}

        <div className="mt-10 text-center">
          <a href="/" className="text-sm text-stone hover:text-charcoal transition-colors">
            ← Run another pipeline
          </a>
        </div>
      </div>
    </main>
  );
}

export default function PipelinePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-warm-white" />}>
      <PipelineInner />
    </Suspense>
  );
}
