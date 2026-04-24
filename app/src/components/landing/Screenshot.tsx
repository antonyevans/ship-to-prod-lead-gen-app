export default function Screenshot() {
  return (
    <section className="bg-charcoal py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-xl overflow-hidden border border-white/10">
          {/* Browser chrome */}
          <div className="bg-black/60 px-4 py-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-flare opacity-60" />
            <span className="w-3 h-3 rounded-full bg-stone opacity-40" />
            <span className="w-3 h-3 rounded-full bg-stone opacity-40" />
            <span className="text-stone text-xs ml-3">Surfaced — Pipeline</span>
          </div>

          {/* Pipeline UI */}
          <div className="bg-charcoal p-5 grid grid-cols-3 gap-3">
            <div className="bg-black/40 rounded-lg p-4">
              <div className="text-[10px] text-stone uppercase tracking-widest mb-2">
                Prospects found
              </div>
              <div className="font-heading text-2xl font-bold text-warm-white">12</div>
            </div>
            <div className="bg-black/40 rounded-lg p-4">
              <div className="text-[10px] text-stone uppercase tracking-widest mb-2">
                Signals live
              </div>
              <div className="font-heading text-2xl font-bold text-flare">9</div>
            </div>
            <div className="bg-black/40 rounded-lg p-4">
              <div className="text-[10px] text-stone uppercase tracking-widest mb-2">
                Calls placed
              </div>
              <div className="font-heading text-2xl font-bold text-warm-white">7</div>
            </div>
            <div className="bg-black/40 rounded-lg p-5 col-span-3">
              <div className="text-[10px] text-stone uppercase tracking-widest mb-3">
                Latest signal
              </div>
              <p className="text-warm-white text-sm leading-snug mb-3">
                &ldquo;Their Calendly hasn&rsquo;t been updated in 6 months — still showing
                old service area.&rdquo; — Yelp review
              </p>
              <span className="inline-block bg-flare text-warm-white text-[10px] font-semibold px-3 py-1 rounded">
                Calling now
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
