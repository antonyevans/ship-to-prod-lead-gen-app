import type { PipelineEvent } from "./pipeline-types";

// In-memory store for SSE streams, keyed by run_id.
// Lives in the persistent Next.js server process — not in edge functions.
const subscribers = new Map<string, Set<(event: PipelineEvent) => void>>();
// Replay buffer: events published before a subscriber connects are replayed on subscribe.
const eventBuffers = new Map<string, PipelineEvent[]>();

export function subscribe(runId: string, callback: (event: PipelineEvent) => void) {
  if (!subscribers.has(runId)) {
    subscribers.set(runId, new Set());
  }

  // Replay any events that arrived before this subscriber connected.
  const buffered = eventBuffers.get(runId);
  if (buffered) {
    for (const event of buffered) {
      callback(event);
    }
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
  if (!eventBuffers.has(runId)) {
    eventBuffers.set(runId, []);
  }
  eventBuffers.get(runId)!.push(event);

  // Clean up buffer 2 minutes after pipeline completes.
  if (event.type === "done" || event.type === "error") {
    setTimeout(() => eventBuffers.delete(runId), 120_000);
  }

  subscribers.get(runId)?.forEach((cb) => cb(event));
}
