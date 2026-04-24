import type { PipelineEvent } from "./pipeline-types";

// In-memory store for SSE streams, keyed by run_id.
// Lives in the persistent Next.js server process — not in edge functions.
const subscribers = new Map<string, Set<(event: PipelineEvent) => void>>();

export function subscribe(runId: string, callback: (event: PipelineEvent) => void) {
  if (!subscribers.has(runId)) {
    subscribers.set(runId, new Set());
  }
  subscribers.get(runId)!.add(callback);
  return () => {
    subscribers.get(runId)?.delete(callback);
    if (subscribers.get(runId)?.size === 0) {
      subscribers.delete(runId);
    }
  };
}

export function publish(runId: string, event: PipelineEvent) {
  subscribers.get(runId)?.forEach((cb) => cb(event));
}
