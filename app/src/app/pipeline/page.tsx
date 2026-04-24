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
    case "initiated": return "Call initiated...";
    case "ringing": return "Ringing...";
    case "answered": return "Answered";
    case "completed": return "Completed";
    case "voicemail": return "Left voicemail — campaign continues";
    case "no-answer": return "No answer — will retry";
    case "failed": return "Failed";
  }
}

function callStatusColor(status: CallStatus) {
  switch (status) {
    case "answered":
    case "completed": return "text-green-400";
    case "ringing":
    case "initiated": return "text-yellow-400";
    case "voicemail": return "text-blue-400";
    case "no-answer": return "text-orange-400";
    case "failed": return "text-red-400";
    default: return "text-gray-500";
  }
}

function ProspectCard({ prospect }: { prospect: Prospect }) {
  const hasName = prospect.name !== "";
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      {hasName ? (
        <>
          <p className="font-semibold text-white text-sm">{prospect.name}</p>
          {prospect.phone && (
            <p className="text-xs text-gray-400 mt-0.5">{prospect.phone}</p>
          )}
          {prospect.pain_signal && (
            <div className="mt-2 bg-amber-950/50 border border-amber-800/50 rounded p-2">
              <p className="text-xs text-amber-300 font-medium">Pain signal found</p>
              <p className="text-xs text-amber-200 mt-0.5">{prospect.pain_signal}</p>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <p className="text-sm text-gray-400">Searching...</p>
        </div>
      )}
    </div>
  );
}

function ScriptCard({ prospect }: { prospect: Prospect }) {
  switch (prospect.scriptStatus) {
    case "waiting":
      return (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-sm text-gray-500">Waiting...</p>
        </div>
      );
    case "generating":
      return (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <p className="text-sm text-gray-300">Generating script...</p>
          </div>
          {prospect.name && <p className="text-xs text-gray-500 mt-1">{prospect.name}</p>}
        </div>
      );
    case "ready":
      return (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-2">
          <p className="text-xs font-medium text-purple-400">{prospect.name}</p>
          <p className="text-xs text-gray-300">
            <span className="text-gray-500">Opener: </span>
            {prospect.script?.opener}
          </p>
          {prospect.script?.pain_hook && (
            <p className="text-xs text-amber-300">
              <span className="text-gray-500">Hook: </span>
              {prospect.script.pain_hook}
            </p>
          )}
          <p className="text-xs text-gray-400">
            <span className="text-gray-500">Pitch: </span>
            {prospect.script?.service_pitch}
          </p>
        </div>
      );
    case "failed":
      return (
        <div className="bg-gray-800 rounded-lg p-4 border border-red-800/50">
          <p className="text-sm text-red-400">Script generation failed — using template</p>
        </div>
      );
  }
}

function CallCard({ prospect }: { prospect: Prospect }) {
  const isActive = prospect.callStatus !== "waiting";
  return (
    <div
      className={`bg-gray-800 rounded-lg p-4 border ${
        isActive ? "border-green-700/50" : "border-gray-700"
      }`}
    >
      {prospect.name ? (
        <>
          <p className="text-xs text-gray-400 mb-1">{prospect.name}</p>
          <p className={`text-sm font-medium ${callStatusColor(prospect.callStatus)}`}>
            {callStatusLabel(prospect.callStatus)}
          </p>
          {(prospect.callStatus === "ringing" || prospect.callStatus === "answered") && (
            <div className="mt-2 flex gap-1">
              {["initiated", "ringing", "answered"].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full ${
                    ["initiated", "ringing", "answered"].indexOf(s) <=
                    ["initiated", "ringing", "answered"].indexOf(prospect.callStatus)
                      ? "bg-green-500"
                      : "bg-gray-600"
                  }`}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-500">Waiting</p>
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
    <main className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Pipeline running</h1>
            <p className="text-gray-400 text-sm mt-1">
              Finding CPA firms in Memphis · Detecting pain signals · Placing calls
            </p>
          </div>
          {done && (
            <span className="bg-green-900/50 border border-green-700 text-green-300 text-sm px-3 py-1.5 rounded-full">
              Pipeline complete
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Researching column */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Researching
            </h2>
            <div className="space-y-3">
              {prospects.map((p) => (
                <ProspectCard key={p.index} prospect={p} />
              ))}
            </div>
          </div>

          {/* Writing Script column */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Writing Script
            </h2>
            <div className="space-y-3">
              {prospects.map((p) => (
                <ScriptCard key={p.index} prospect={p} />
              ))}
            </div>
          </div>

          {/* Calling column */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Calling
            </h2>
            <div className="space-y-3">
              {prospects.map((p) => (
                <CallCard key={p.index} prospect={p} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            ← Run another pipeline
          </a>
        </div>
      </div>
    </main>
  );
}

export default function PipelinePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950" />}>
      <PipelineInner />
    </Suspense>
  );
}
