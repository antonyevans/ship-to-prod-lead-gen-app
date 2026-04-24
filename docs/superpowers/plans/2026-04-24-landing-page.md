# Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 7-section Evidence-First landing page at `/` and move the current config/app UI to `/app`.

**Architecture:** Server Components only — no client state required on the landing page. Each section is an isolated component assembled in `app/src/app/page.tsx`. The current `page.tsx` (config form) moves to `app/src/app/app/page.tsx` so the root route becomes the landing page.

**Tech Stack:** Next.js 14 App Router, Tailwind CSS, brand tokens already in `tailwind.config.ts` (`charcoal`, `warm-white`, `sand`, `flare`, `stone`), fonts already wired (`font-heading` = Plus Jakarta Sans, `font-body` = Inter).

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Move | `app/src/app/page.tsx` → `app/src/app/app/page.tsx` | Config form (existing, unchanged) |
| Create | `app/src/app/page.tsx` | Assembles all landing sections |
| Create | `app/src/components/landing/Nav.tsx` | Wordmark nav bar |
| Create | `app/src/components/landing/Hero.tsx` | Receipt card + headline + CTA |
| Create | `app/src/components/landing/HowItWorks.tsx` | 3-step cards |
| Create | `app/src/components/landing/Screenshot.tsx` | Synthetic pipeline UI mockup |
| Create | `app/src/components/landing/Comparison.tsx` | Competitor table |
| Create | `app/src/components/landing/SocialProof.tsx` | 3 testimonials |
| Create | `app/src/components/landing/Pricing.tsx` | $10/call pricing card |
| Create | `app/src/components/landing/FooterCTA.tsx` | Closing headline + CTA |

---

## Task 1: Move config page to `/app` route

**Files:**
- Create: `app/src/app/app/page.tsx` (copy of current `app/src/app/page.tsx`)
- Delete contents of: `app/src/app/page.tsx` (will be replaced in Task 3)

- [ ] **Step 1: Create the `/app` directory and copy the config page**

```bash
mkdir -p /home/antony/claude/ship-to-prod-lead-gen-app/app/src/app/app
cp /home/antony/claude/ship-to-prod-lead-gen-app/app/src/app/page.tsx \
   /home/antony/claude/ship-to-prod-lead-gen-app/app/src/app/app/page.tsx
```

- [ ] **Step 2: Verify the dev server still starts**

```bash
cd /home/antony/claude/ship-to-prod-lead-gen-app/app && npm run dev &
sleep 5 && curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/app
```

Expected: `200`

- [ ] **Step 3: Commit**

```bash
git add app/src/app/app/page.tsx
git commit -m "feat: move config page to /app route"
```

---

## Task 2: Create landing section components (Nav + Hero)

**Files:**
- Create: `app/src/components/landing/Nav.tsx`
- Create: `app/src/components/landing/Hero.tsx`

- [ ] **Step 1: Create `Nav.tsx`**

```tsx
// app/src/components/landing/Nav.tsx
export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-10 px-6 py-4 bg-charcoal/95 backdrop-blur-sm">
      <span className="font-heading text-xl font-bold text-warm-white">
        surfaced<span className="text-flare">·</span>
      </span>
    </nav>
  );
}
```

- [ ] **Step 2: Create `Hero.tsx`**

```tsx
// app/src/components/landing/Hero.tsx
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="bg-charcoal min-h-screen flex items-center pt-16">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-xs text-stone tracking-widest uppercase mb-6">
          Surfaced·
        </div>

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
```

- [ ] **Step 3: Commit**

```bash
git add app/src/components/landing/Nav.tsx app/src/components/landing/Hero.tsx
git commit -m "feat: add landing Nav and Hero components"
```

---

## Task 3: HowItWorks + Screenshot components

**Files:**
- Create: `app/src/components/landing/HowItWorks.tsx`
- Create: `app/src/components/landing/Screenshot.tsx`

- [ ] **Step 1: Create `HowItWorks.tsx`**

```tsx
// app/src/components/landing/HowItWorks.tsx
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
```

- [ ] **Step 2: Create `Screenshot.tsx`**

```tsx
// app/src/components/landing/Screenshot.tsx
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
```

- [ ] **Step 3: Commit**

```bash
git add app/src/components/landing/HowItWorks.tsx app/src/components/landing/Screenshot.tsx
git commit -m "feat: add HowItWorks and Screenshot landing sections"
```

---

## Task 4: Comparison + SocialProof components

**Files:**
- Create: `app/src/components/landing/Comparison.tsx`
- Create: `app/src/components/landing/SocialProof.tsx`

- [ ] **Step 1: Create `Comparison.tsx`**

```tsx
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
```

- [ ] **Step 2: Create `SocialProof.tsx`**

```tsx
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
```

- [ ] **Step 3: Commit**

```bash
git add app/src/components/landing/Comparison.tsx app/src/components/landing/SocialProof.tsx
git commit -m "feat: add Comparison and SocialProof landing sections"
```

---

## Task 5: Pricing + FooterCTA components

**Files:**
- Create: `app/src/components/landing/Pricing.tsx`
- Create: `app/src/components/landing/FooterCTA.tsx`

- [ ] **Step 1: Create `Pricing.tsx`**

```tsx
// app/src/components/landing/Pricing.tsx
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
```

- [ ] **Step 2: Create `FooterCTA.tsx`**

```tsx
// app/src/components/landing/FooterCTA.tsx
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
```

- [ ] **Step 3: Commit**

```bash
git add app/src/components/landing/Pricing.tsx app/src/components/landing/FooterCTA.tsx
git commit -m "feat: add Pricing and FooterCTA landing sections"
```

---

## Task 6: Assemble landing page at root route

**Files:**
- Modify: `app/src/app/page.tsx` (replace entirely with landing page assembly)

- [ ] **Step 1: Replace `app/src/app/page.tsx`**

```tsx
// app/src/app/page.tsx
import Nav from '@/components/landing/Nav';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import Screenshot from '@/components/landing/Screenshot';
import Comparison from '@/components/landing/Comparison';
import SocialProof from '@/components/landing/SocialProof';
import Pricing from '@/components/landing/Pricing';
import FooterCTA from '@/components/landing/FooterCTA';

export default function LandingPage() {
  return (
    <>
      <Nav />
      <Hero />
      <HowItWorks />
      <Screenshot />
      <Comparison />
      <SocialProof />
      <Pricing />
      <FooterCTA />
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/antony/claude/ship-to-prod-lead-gen-app/app && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Verify dev server serves both routes**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 && echo "" && \
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/app
```

Expected: `200` on both lines

- [ ] **Step 4: Commit**

```bash
git add app/src/app/page.tsx
git commit -m "feat: assemble evidence-first landing page at root route"
```

---

## Task 7: Visual verification

- [ ] **Step 1: Open http://localhost:3000 in browser and check each section**

Walk through the page top to bottom and verify:
- Nav: wordmark + orange dot, fixed, no links
- Hero: receipt card appears above headline, Charcoal background, CTA links to `/app`
- How it works: 3 Sand cards on Warm White
- Screenshot: dark mockup with Flare Orange accent on "Signals live" and "Calling now"
- Comparison: Surfaced column highlighted in Flare Orange, table readable on mobile
- Social proof: 3 testimonials on Sand background
- Pricing: $10 card with Flare Orange border, CTA links to `/app`
- Footer: Charcoal background, closing headline, CTA

- [ ] **Step 2: Check mobile layout (resize to 375px width)**

Verify steps stack to single column, table scrolls horizontally, no text overflow.

- [ ] **Step 3: Verify `/app` route still works end-to-end**

Open http://localhost:3000/app — config form should appear and function identically to before.

- [ ] **Step 4: Final commit if any fixes applied**

```bash
git add -p && git commit -m "fix: landing page visual adjustments"
```
