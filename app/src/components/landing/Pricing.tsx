import Link from 'next/link';

export default function Pricing() {
  return (
    <section className="bg-warm-white py-24 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-heading text-3xl font-bold text-charcoal mb-3">
          One signal. One call. One reason.
        </h2>
        <p className="text-stone mb-10">
          No monthly fee. No setup. You pay when a call is answered.
        </p>

        <div className="inline-block border-2 border-flare rounded-2xl px-12 py-10">
          <div className="font-heading text-6xl font-extrabold text-charcoal">$10</div>
          <div className="text-stone text-sm mt-1 mb-6">per answered call</div>
          <div className="text-charcoal text-sm">Research · Script · Call — included.</div>
          <Link
            href="/app"
            className="mt-8 inline-block bg-flare hover:bg-flare/90 transition-colors text-warm-white font-semibold px-8 py-3 rounded-lg text-sm"
          >
            Start your first run
          </Link>
        </div>
      </div>
    </section>
  );
}
