const steps = [
  {
    number: '01',
    title: 'Enter two things',
    body: 'Who you\'re selling to. What you fix. That\'s the full config.',
  },
  {
    number: '02',
    title: 'Surfaced finds the wound',
    body: 'Real-time signals from public reviews, booking gaps, and missed calls.',
  },
  {
    number: '03',
    title: 'The call opens with the receipt',
    body: 'Your AI agent reads the evidence back to the prospect. Verbatim. Verifiable.',
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-warm-white py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-heading text-3xl font-bold text-charcoal mb-12">
          We looked before we dialed.
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div key={step.number} className="bg-sand rounded-xl p-6">
              <div className="text-[11px] text-stone uppercase tracking-widest mb-3">
                Step {step.number}
              </div>
              <h3 className="font-heading text-base font-bold text-charcoal mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-stone leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
