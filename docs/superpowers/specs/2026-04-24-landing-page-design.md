# Landing Page Design — Surfaced

**Date:** 2026-04-24
**Approach:** Evidence-First
**Live app URL:** https://lead-gen-agent-stp.fly.dev/

---

## Goal

A single-page marketing site that converts visitors into active users. Primary CTA: sign up and use the product immediately (link to live app). No waitlist, no demo booking — direct conversion.

---

## Approach: Evidence-First

The hero leads with a live-looking pain signal "receipt" card — the product's output — before any headline or explanation. The visitor sees what Surfaced does before reading what it is. This embodies the brand position: "Find the wound. Open with the receipt."

Rationale for choosing over alternatives:
- Narrative Scroll: proven but generic — doesn't feel like Surfaced
- Manifesto Page: distinctive but harder to convert cold traffic

---

## Page Sections (top to bottom)

### ① Hero

**Structure:**
- Nav: wordmark "surfaced·" in Plus Jakarta Sans 700, no links
- Pain signal receipt card (shown first, above headline):
  - Synthetic example — bad review from a real-looking business
  - Brand: Warm White card, Flare Orange left border, Stone metadata
  - Label: "SIGNAL FOUND · [Business Name] · 2 min ago"
  - Quote from Google review (3 stars)
- Headline: "Call with a receipt." (Plus Jakarta Sans 800)
- Subhead: "Surfaced finds a specific, public reason to call each prospect — then opens the call with that evidence verbatim. Two fields. Under three minutes."
- CTA button: "Start your first run" → https://lead-gen-agent-stp.fly.dev/
- Inline note: "$10 per answered call. No setup."
- Background: Charcoal (#1C1C1E), text Warm White

**Synthetic receipt card content:**
> "SIGNAL FOUND · Acme Scheduling Co · 2 min ago"
> "We've been losing after-hours bookings for months. No one picks up." — Google Review, 3 stars, posted 4 days ago

---

### ② How It Works

**Structure:** 3-column step cards on Sand background

- Step 01: Enter two things — who you're selling to, what you fix
- Step 02: Surfaced finds the wound — real-time signals from public reviews, booking gaps, missed calls
- Step 03: The call opens with the receipt — AI agent reads evidence verbatim, verifiable by prospect

**Headline:** "We looked before we dialed."

---

### ③ Product Screenshot

**Structure:** Synthetic dark-theme pipeline UI mockup

Metrics shown:
- Prospects Found: 12
- Signals Live: 9 (Flare Orange)
- Calls Placed: 7

Latest signal card:
> "Their Calendly hasn't been updated in 6 months — still showing old service area." — Yelp review

Status badge: "CALLING NOW" in Flare Orange

Background: Charcoal, framed as a browser window

---

### ④ Competitor Comparison

**Headline:** "Apparently 'AI-powered' now means 'we imported your CSV and added a subject line.'"

**Table:** Surfaced vs Clay vs Apollo vs 11x

| Feature | Surfaced | Clay | Apollo | 11x |
|---|---|---|---|---|
| Live pain signal detection | ✓ | — | — | — |
| Voice as primary channel | ✓ | — | — | ✓ |
| No list import needed | ✓ | — | — | — |
| Built for 1–10 person teams | ✓ | ✓ | — | — |
| Pricing | $10/call | $149+/mo | $49+/mo | $1,500+/mo |

Surfaced column highlighted in Flare Orange.

---

### ⑤ Social Proof

**Structure:** 3 synthetic testimonial cards on Sand background

1. Marcus T., Founder, AI Booking Agent startup — "First call opened with a review the prospect left six months ago. They said 'how did you know that?' We said we looked."
2. Priya K., Solo founder, voice automation — "I was spending Sundays researching prospects manually. Now I enter two fields and go for a run. The calls are already in progress when I'm back."
3. James O., Co-founder, outbound chatbot agency — "Clay requires me to build the pipeline. This is the pipeline. I had my first qualified call in under 4 minutes."

---

### ⑥ Pricing

**Headline:** "One signal. One call. One reason."
**Subhead:** "No monthly fee. No setup. You pay when a call is answered."

Single pricing tier, displayed in a Flare Orange bordered card:
- **$10** per answered call
- Research · Script · Call — included

No tiers, no toggle, no complexity.

---

### ⑦ Final CTA Footer

**Background:** Charcoal

**Headline:** "You've built an AI product that handles calls for other businesses."
**Subhead:** "Your outbound is still 'post on LinkedIn and hope.' That's the irony we fix."

CTA: "Start your first run" → https://lead-gen-agent-stp.fly.dev/
Inline note: "$10 per answered call · No setup · Runs in under 3 minutes"

---

## Design Tokens

| Role | Name | HEX |
|---|---|---|
| Primary | Charcoal | #1C1C1E |
| Background | Warm White | #FAFAF7 |
| Secondary | Sand | #E8E0D4 |
| Accent | Flare Orange | #FF5C2B |
| Neutral | Stone | #9A8E82 |

**Fonts:**
- Headlines: Plus Jakarta Sans 700/800 (Google Fonts)
- Body: Inter 400/500 (Google Fonts)

---

## Copy Rules (from Voice DNA)

- No exclamation marks
- Lead with the finding, not the feature
- Sentence case headlines only
- Banned words: leverage, seamless, AI-powered (as claim), solution, optimise, scalable
- Vocabulary: signal, before, found, evidence, reason, specific, real, looked, qualified, receipt, surface (verb), verified, live, public, already

---

## Implementation Notes

- Single HTML file with inline CSS — no build step, no framework required (hackathon speed)
- Google Fonts for Plus Jakarta Sans + Inter via `<link>`
- All data synthetic — no backend required for the page itself
- CTA links directly to https://lead-gen-agent-stp.fly.dev/
- No analytics, no form handling — direct link only
- Mobile responsive: single column below 768px, steps stack vertically
