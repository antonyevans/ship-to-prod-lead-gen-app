const ENDPOINT = "https://agent.tinyfish.ai/v1/automation/run-sse";

async function runTask(url: string, goal: string, maxSteps = 30): Promise<unknown> {
  const key = process.env.TINYFISH_API_KEY;
  if (!key) throw new Error("TINYFISH_API_KEY not set");

  console.log(`[tinyfish] POST ${url.slice(0, 80)} (maxSteps=${maxSteps})`);
  const resp = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "X-API-Key": key,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      url,
      goal,
      browser_profile: "stealth",
      agent_config: { max_steps: maxSteps },
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error(`[tinyfish] error ${resp.status}: ${text}`);
    throw new Error(`TinyFish ${resp.status}: ${text}`);
  }
  console.log(`[tinyfish] stream open, reading SSE…`);

  const reader = resp.body!.getReader();
  const dec = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });

    const lines = buf.split("\n");
    buf = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (payload === "[DONE]") return null;
      try {
        const ev = JSON.parse(payload);
        if (ev.type === "COMPLETE") {
          if (ev.status !== "COMPLETED") throw new Error(`TinyFish: ${ev.error ?? "failed"}`);
          console.log(`[tinyfish] COMPLETE — result:`, JSON.stringify(ev.result).slice(0, 200));
          return ev.result;
        }
        if (ev.type === "HEARTBEAT") console.log(`[tinyfish] heartbeat`);
      } catch (e) {
        if (e instanceof Error && e.message.startsWith("TinyFish:")) throw e;
      }
    }
  }

  return null;
}

function extractJson<T>(raw: unknown): T | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "object") return raw as T;
  if (typeof raw === "string") {
    // Try JSON array first, then object
    for (const re of [/\[[\s\S]*\]/, /\{[\s\S]*\}/]) {
      const m = raw.match(re);
      if (m) {
        try { return JSON.parse(m[0]) as T; } catch { /* continue */ }
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Prospect discovery
// ---------------------------------------------------------------------------

export interface RawProspect {
  name: string;
  phone: string;
  website: string;
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits[0] === "1") return `+${digits}`;
  return raw; // return as-is if we can't normalize
}

export async function findProspects(icp: string): Promise<RawProspect[]> {
  const url = `https://www.google.com/search?q=${encodeURIComponent(icp)}`;

  const goal = `Find 3 businesses matching: "${icp}". For each extract name, phone number, and website. Return only a JSON array: [{"name":"...","phone":"...","website":"..."},{"name":"...","phone":"...","website":"..."},{"name":"...","phone":"...","website":"..."}]`;

  const raw = await runTask(url, goal, 20);

  // TinyFish may return {entries:[...]} or a flat array
  type ResultShape = RawProspect[] | { entries: RawProspect[] } | { results: RawProspect[] };
  const parsed = extractJson<ResultShape>(raw);
  const arr: RawProspect[] = Array.isArray(parsed)
    ? parsed
    : (parsed as { entries?: RawProspect[]; results?: RawProspect[] })?.entries ??
      (parsed as { results?: RawProspect[] })?.results ??
      [];

  return arr.slice(0, 3).map((p) => ({
    name: String(p.name ?? ""),
    phone: normalizePhone(String(p.phone ?? "")),
    website: String(p.website ?? ""),
  }));
}

// ---------------------------------------------------------------------------
// Pain signal research — multi-source per prospect
// ---------------------------------------------------------------------------

interface PainResult {
  painSignal: string | null;
  source: string;
}

export async function findPainSignal(
  name: string,
  website: string,
  service: string
): Promise<string | null> {
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(name)}`;

  const goal = `Search Google Maps for "${name}". Read their customer reviews. Find a specific complaint about: missed calls, voicemail, slow response, booking difficulty, or after-hours problems. If found, return JSON: {"painSignal":"exact review quote","source":"Google Maps"}. If not found, return {"painSignal":null,"source":"none"}`;

  const raw = await runTask(mapsUrl, goal, 25);
  const parsed = extractJson<PainResult>(raw);
  return parsed?.painSignal ?? null;
}
