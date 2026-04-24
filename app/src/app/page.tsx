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
    <main className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold text-white mb-2">AI Lead Gen Agent</h1>
        <p className="text-gray-400 mb-8">
          Find prospects, detect pain signals, place personalized calls — in under 3 minutes.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              What AI service do you sell?
            </label>
            <textarea
              value={service}
              onChange={(e) => setService(e.target.value)}
              maxLength={200}
              rows={3}
              required
              className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-blue-500 resize-none"
              placeholder="AI scheduling service that books client consultations..."
            />
            <p className="text-xs text-gray-500 mt-1">{service.length}/200</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Who is your target customer?
            </label>
            <input
              type="text"
              value={icp}
              onChange={(e) => setIcp(e.target.value)}
              maxLength={100}
              required
              className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
              placeholder="CPA firms in Memphis TN with 2-15 staff"
            />
            <p className="text-xs text-gray-500 mt-1">{icp.length}/100</p>
          </div>

          <button
            type="submit"
            disabled={loading || !service.trim() || !icp.trim()}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? "Starting pipeline..." : "Find leads and call them"}
          </button>
        </form>
      </div>
    </main>
  );
}
