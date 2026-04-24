import Link from 'next/link';

export default function FooterCTA() {
  return (
    <section className="bg-charcoal py-24 px-6 text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-heading text-4xl font-bold text-warm-white mb-4 leading-tight">
          You&rsquo;ve built an AI product that handles calls for other businesses.
        </h2>
        <p className="text-stone mb-10 text-lg">
          Your outbound is still &ldquo;post on LinkedIn and hope.&rdquo; That&rsquo;s the irony we fix.
        </p>
        <Link
          href="/app"
          className="inline-block bg-flare hover:bg-flare/90 transition-colors text-warm-white font-semibold px-8 py-4 rounded-lg text-base"
        >
          Start your first run
        </Link>
        <p className="text-stone text-xs mt-4">
          $10 per answered call · No setup · Runs in under 3 minutes
        </p>
      </div>
    </section>
  );
}
