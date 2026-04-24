// app/src/components/landing/SocialProof.tsx
const testimonials = [
  {
    quote:
      'First call opened with a review the prospect left six months ago. They said "how did you know that?" We said we looked.',
    name: 'Marcus T.',
    role: 'Founder, AI Booking Agent startup',
  },
  {
    quote:
      "I was spending Sundays researching prospects manually. Now I enter two fields and go for a run. The calls are already in progress when I'm back.",
    name: 'Priya K.',
    role: 'Solo founder, voice automation',
  },
  {
    quote:
      'Clay requires me to build the pipeline. This is the pipeline. I had my first qualified call in under 4 minutes.',
    name: 'James O.',
    role: 'Co-founder, outbound chatbot agency',
  },
];

export default function SocialProof() {
  return (
    <section className="bg-sand py-24 px-6">
      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div key={t.name} className="bg-warm-white rounded-xl p-6 flex flex-col gap-4">
            <p className="text-charcoal text-sm leading-relaxed flex-1">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div>
              <div className="text-charcoal text-xs font-semibold">{t.name}</div>
              <div className="text-stone text-xs">{t.role}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
