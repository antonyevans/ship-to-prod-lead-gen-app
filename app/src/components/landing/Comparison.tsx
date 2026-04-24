// app/src/components/landing/Comparison.tsx
const rows = [
  { feature: 'Live pain signal detection', surfaced: true, clay: false, apollo: false, eleven: false },
  { feature: 'Voice as primary channel',   surfaced: true, clay: false, apollo: false, eleven: true  },
  { feature: 'No list import needed',      surfaced: true, clay: false, apollo: false, eleven: false },
  { feature: 'Built for 1–10 person teams',surfaced: true, clay: true,  apollo: false, eleven: false },
  { feature: 'Pricing',
    surfacedLabel: '$10/call',
    clayLabel: '$149+/mo',
    apolloLabel: '$49+/mo',
    elevenLabel: '$1,500+/mo',
  },
];

function Cell({ value, label }: { value?: boolean; label?: string }) {
  if (label) return <td className="py-3 px-4 text-center text-sm text-charcoal">{label}</td>;
  return (
    <td className="py-3 px-4 text-center text-sm">
      {value ? <span className="text-flare font-bold">✓</span> : <span className="text-stone">—</span>}
    </td>
  );
}

export default function Comparison() {
  return (
    <section className="bg-warm-white py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-heading text-2xl font-bold text-charcoal mb-2">
          &ldquo;AI-powered&rdquo; now means &ldquo;we imported your CSV and added a subject line.&rdquo;
        </h2>
        <p className="text-stone text-sm mb-10">Apparently.</p>

        <div className="overflow-x-auto rounded-xl border border-sand">
          <table className="w-full">
            <thead>
              <tr className="bg-sand">
                <th className="text-left py-3 px-4 text-[11px] text-stone uppercase tracking-widest">Feature</th>
                <th className="py-3 px-4 text-[11px] text-flare uppercase tracking-widest">Surfaced</th>
                <th className="py-3 px-4 text-[11px] text-stone uppercase tracking-widest">Clay</th>
                <th className="py-3 px-4 text-[11px] text-stone uppercase tracking-widest">Apollo</th>
                <th className="py-3 px-4 text-[11px] text-stone uppercase tracking-widest">11x</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t border-sand">
                  <td className="py-3 px-4 text-sm text-charcoal">{row.feature}</td>
                  {'surfacedLabel' in row ? (
                    <>
                      <td className="py-3 px-4 text-center text-sm font-bold text-flare">{row.surfacedLabel}</td>
                      <td className="py-3 px-4 text-center text-sm text-stone">{row.clayLabel}</td>
                      <td className="py-3 px-4 text-center text-sm text-stone">{row.apolloLabel}</td>
                      <td className="py-3 px-4 text-center text-sm text-stone">{row.elevenLabel}</td>
                    </>
                  ) : (
                    <>
                      <Cell value={row.surfaced} />
                      <Cell value={row.clay} />
                      <Cell value={row.apollo} />
                      <Cell value={row.eleven} />
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
