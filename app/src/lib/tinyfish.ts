const ENDPOINT = "https://agent.tinyfish.ai/v1/automation/run-sse";

async function runTask(url: string, goal: string, maxSteps = 30): Promise<unknown> {
  const key = process.env.TINYFISH_API_KEY;
  if (!key) throw new Error("TINYFISH_API_KEY not set");

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
    throw new Error(`TinyFish ${resp.status}: ${await resp.text()}`);
  }

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
          return ev.result;
        }
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

export async function findProspects(icp: string): Promise<RawProspect[]> {
  const url = `https://www.google.com/search?q=${encodeURIComponent(icp)}`;

  const goal = `
Find exactly 3 real businesses matching: "${icp}".

For each extract:
- name: the business name
- phone: their phone number formatted as +1XXXXXXXXXX
- website: their website URL (empty string if not found)

Only include businesses with a real, extractable phone number. Skip any without one and find a replacement.

Return ONLY a JSON array of exactly 3 objects with no other text:
[{"name":"...","phone":"...","website":"..."},{"name":"...","phone":"...","website":"..."},{"name":"...","phone":"...","website":"..."}]
`.trim();

  const raw = await runTask(url, goal, 30);
  const results = extractJson<RawProspect[]>(raw);
  return (Array.isArray(results) ? results : []).slice(0, 3);
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

  const websiteStep = website
    ? `3. Visit ${website} — look for: missing booking page, no online scheduling link, after-hours contact form absent, old "call us" instructions without any digital alternative.`
    : "";

  const goal = `
You are researching "${name}" to find specific evidence that they need: "${service}".

Work through each source in order:

1. On Google Maps, find "${name}". Read their customer reviews carefully. Look for complaints about:
   - Calls going to voicemail or not being answered
   - Long wait times to get a callback or appointment
   - Difficulty booking, no online booking option
   - Problems reaching them outside business hours
   - Any frustration with their responsiveness or scheduling
   Copy the most compelling quote verbatim if you find one.

2. Search Yelp for "${name}". Read their reviews for the same patterns.
   Also check for: low star ratings specifically mentioning communication or booking, recent negative reviews about availability.
${websiteStep}

After checking all sources, pick the single most specific, verifiable piece of evidence.
Prefer exact review quotes over observations. Prefer recent evidence over old.

Return ONLY this JSON, no other text:
{"painSignal":"the exact quote or specific observation","source":"Google Maps/Yelp/website"}

If you found NO relevant evidence after checking all sources:
{"painSignal":null,"source":"none"}
`.trim();

  const raw = await runTask(mapsUrl, goal, 60);
  const parsed = extractJson<PainResult>(raw);
  return parsed?.painSignal ?? null;
}
