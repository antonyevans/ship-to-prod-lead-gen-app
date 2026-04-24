import Link from 'next/link';

export default function Hero() {
  return (
    <section className="bg-charcoal pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        {/* Receipt card — shown before the headline */}
        <div className="bg-warm-white border-l-4 border-flare rounded-lg px-5 py-4 mb-10 max-w-lg">
          <div className="text-[10px] text-stone uppercase tracking-wider mb-2">
            Signal found · Acme Scheduling Co · 2 min ago
          </div>
          <p className="text-charcoal text-sm font-semibold leading-snug mb-2">
            &ldquo;We&rsquo;ve been losing after-hours bookings for months. No one picks up.&rdquo;
          </p>
          <div className="text-[11px] text-stone">
            — Google Review, 3 stars, posted 4 days ago
          </div>
        </div>

        <h1 className="font-heading text-5xl font-extrabold text-warm-white leading-tight mb-4">
          Call with a receipt.
        </h1>
        <p className="text-stone text-lg max-w-lg mb-8 leading-relaxed">
          Surfaced finds a specific, public reason to call each prospect — then opens
          the call with that evidence verbatim. Two fields. Under three minutes.
        </p>

        <div className="flex items-center gap-4 flex-wrap">
          <Link
            href="/app"
            className="bg-flare hover:bg-flare/90 transition-colors text-warm-white font-semibold px-6 py-3 rounded-lg text-sm"
          >
            Start your first run
          </Link>
          <span className="text-stone text-sm">$10 per answered call. No setup.</span>
        </div>
      </div>
    </section>
  );
}
