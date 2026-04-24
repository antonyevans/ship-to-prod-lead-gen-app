"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ConfigPage() {
  const router = useRouter();
  const [service, setService] = useState(
    "AI scheduling service that books client consultations for accounting firms"
  );
  const [icp, setIcp] = useState("CPA firms in Memphis TN with 2-15 staff");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const runId = crypto.randomUUID();
    const res = await fetch("/api/run-pipeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ run_id: runId, service, icp }),
    });

    if (!res.ok) {
      setLoading(false);
      return;
    }

    router.push(`/pipeline?run_id=${runId}`);
  }

  return (
    <main className="min-h-screen bg-warm-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="mb-10">
          <p className="font-heading text-4xl font-bold text-charcoal tracking-tight">
            surfaced<span className="text-flare">·</span>
          </p>
          <p className="text-stone mt-2 text-[15px]">
            Find the wound. Open with the receipt.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              What AI service do you sell?
            </label>
            <textarea
              value={service}
              onChange={(e) => setService(e.target.value)}
              maxLength={200}
              rows={3}
              required
              className="w-full rounded-lg bg-white border border-sand text-charcoal px-4 py-3 text-sm focus:outline-none focus:border-flare resize-none placeholder:text-stone"
              placeholder="AI scheduling service that books client consultations..."
            />
            <p className="text-xs text-stone mt-1">{service.length}/200</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              Who is your target customer?
            </label>
            <input
              type="text"
              value={icp}
              onChange={(e) => setIcp(e.target.value)}
              maxLength={100}
              required
              className="w-full rounded-lg bg-white border border-sand text-charcoal px-4 py-3 text-sm focus:outline-none focus:border-flare placeholder:text-stone"
              placeholder="CPA firms in Memphis TN with 2-15 staff"
            />
            <p className="text-xs text-stone mt-1">{icp.length}/100</p>
          </div>

          <button
            type="submit"
            disabled={loading || !service.trim() || !icp.trim()}
            className="w-full bg-flare hover:bg-flare/90 disabled:opacity-40 disabled:cursor-not-allowed text-warm-white font-semibold py-3 rounded-lg transition-colors text-sm"
          >
            {loading ? "Finding signals..." : "Find leads and call them"}
          </button>
        </form>

        <p className="mt-8 text-xs text-stone text-center">
          Config to completed call in under 3 minutes.
        </p>
      </div>
    </main>
  );
}
