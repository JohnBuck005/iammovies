# IAmoviestory — Production Plan

> Evaluation draft. Covers: systems needed, account checklist (who owns what),
> recommended stack, video economics, phased build order, cost estimates, open
> decisions. The current `cloudflared` tunnel + localStorage demo is the
> front-end skeleton and is NOT the production deployment.

---

## 0. Status of what we have today (demo)

| Capability | Demo state | Production needs |
|---|---|---|
| UI / branding | ✅ Done (IAmoviestory logo, hero, cover header) | Reuse as-is |
| 13 real episodes + player | ✅ Raw MP4 in `/public` (598 MB) | Move to video CDN |
| Series / episode pages | ✅ Done | Reuse |
| Watchlist / Rewards / Search / Tabs | ✅ Built but **localStorage mock** | Swap to real backend |
| Auth / sign-up | ❌ Dead "Sign In" button | Build on Supabase Auth |
| Payments | ❌ Visual mock | Paddle/Lemon Squeezy (MoR) or Stripe |
| Database | ❌ None (browser only) | Postgres (Supabase) |
| Video delivery | ⚠️ Local files | Video CDN (Bunny/Mux) |

**Key point:** the front-end is ~80% built. Production = swap storage/auth/payments
from mock → real services, and move video off the app server. Minimal rewrite.

---

## 1. The four systems a real streaming product needs

1. **Auth / sign-up** — user accounts, login, sessions
2. **Database** — users, subscriptions, watchlist, rewards, watch-progress
3. **Payments** — recurring subscription, refunds, SCA (EU legally requires 3D-Secure)
4. **Video delivery** — global adaptive streaming + basic content protection

---

## 2. Recommended stack

### 2.1 Backend + Auth + DB → **Supabase** (Postgres + Auth + Edge Functions)
- One product covers auth (email + Google/Apple social), DB, and **payment** webhooks (Stripe/Paddle/Lemon Squeezy).
- **EU region (Frankfurt)** → keeps Belgian/EU user data in the EU (GDPR).
- Open-source → portable if the client later self-hosts. Avoids Google/Firebase lock-in.
- *Alternative:* Firebase — faster scaffold, weaker EU residency, heavier lock-in.

### 2.2 Payments → **MoR (Merchant of Record) is the default for EU-facing**

> **Updated 2026-07-22:** Because this product sells **digital subscriptions into
> the EU**, VAT must be collected in the customer's country (Belgium 21%; others
> via OSS). Whoever is the Merchant of Record owns that VAT liability.

**Recommended default — Merchant of Record (Paddle or Lemon Squeezy):**
- They are the legal seller, collect the correct VAT per country, and remit it.
  You receive a clean payout — **zero VAT admin**.
- Both expose an API/webhook model that gates episodes in our Next.js paywall.
- Fees ~**5% + $0.50**/tx. The premium over Stripe is usually cheaper than an
  accountant once you price in OSS filing.
- **Paddle** — more "enterprise/SaaS", EU company (Slovenia-ish), robust MoR.
- **Lemon Squeezy** — simpler onboarding, same MoR model. (Stripe acquired it in
  2024 but it still operates as its own Merchant of Record.)

**Alternative — Stripe Billing (lowest fee, more admin):**
- Fee **2.9% + $0.30**; you are the Merchant of Record and must calculate,
  collect, and remit EU VAT yourself (Stripe Tax assists calculation; you still
  file OSS returns). Use only if the client has/wants an accountant.
- Stripe Customer Portal lets users self-manage cancels (we don't build that UI).
- Money flows to **the client's own Stripe account**. We never touch funds.

**Not recommended — Gumroad:**
- 10%+ marketplace model; product sits *on Gumroad*, not the branded IAmoviestory
  app. Contradicts the in-app paywall we built. Only if the client scraps the app
  and sells direct via Gumroad (not our plan).

**Decision for client:** pick ONE — Paddle (default) / Lemon Squeezy / Stripe.

### 2.3 Video → **Bunny Stream** (recommended)
- EU company (Slovenia) → clean GDPR story for Belgium audience.
- Cheapest at volume (~$0.008/GB; ~80% under CloudFront, ~40× under Mux).
- Built-in adaptive bitrate + player + **token-auth (signed URLs)** to stop content piracy.
- Handles transcoding — no more manual FFmpeg.
- *Alternatives:* Cloudflare Stream (if staying on Cloudflare), Mux (premium analytics, costly).

### 2.4 App hosting → client domain (self-host or Vercel)
- **Vercel Pro** (~$20–40/mo) — easiest, auto-deploy from git, but only serves the
  app shell; video MUST be offloaded or the bill explodes.
- **Self-host on client VPS** (Hetzner/DigitalOcean, both EU regions) — $0 hosting,
  we manage deploys. Kills the Vercel bill entirely.
- Recommendation: **self-host the app + Bunny for video** for cost control at scale.

---

## 3. Video economics (the thing that actually scales)

Per completed view of a 3-min episode ≈ **35 MB** delivered (adaptive 720p).
Encoding is one-time (13-ep library ≈ $0.78 total, negligible).

| Monthly episode views | Video delivered | Bunny Stream | Mux (all-in) | Vercel (video via app) |
|---|---|---|---|---|
| 10,000 | 350 GB | ~$3 | ~$1,200 | $0 (under 1 TB free) |
| 100,000 | 3.5 TB | ~$28 | ~$12,000 | ~$450 overage |
| 1,000,000 | 35 TB | ~$280 | ~$120,000 | ~$6,300 overage |

**Rule:** app host (Vercel/self) serves only the app shell (tiny, cached).
**Bunny serves the clips.** Do NOT stream video through Vercel.

### Unit economics (assuming $5/mo subscription)
- A sub watches ~15 eps/mo → 525 MB → Bunny = **$0.004**
- Stripe fees (2.9% + $0.30) = **$0.45**
- Supabase + hosting = **~$0.02**
- **Total variable cost / sub ≈ $0.47 → ~91% gross margin**

**Conclusion:** infra is <1% of revenue. The real constraints are subscriber
acquisition and churn — not bandwidth. Don't over-optimise the CDN.

---

## 4. Account checklist — what the CLIENT must own

These accounts must be **theirs** (money + legal liability are theirs). We assist setup.

| # | Account | Owner | We do |
|---|---|---|---|
| 1 | Domain (registrar) | Client | Point DNS |
| 2 | Hosting (Vercel OR VPS) | Client | Deploy + maintain |
| 3 | Supabase project (EU) | Client | Schema + Auth wiring |
| 4 | **Payments (pick ONE):** Paddle *or* Lemon Squeezy *or* Stripe | Client | Keys + webhooks |
| 5 | Bunny Stream account | Client | Upload + player wiring |
| 6 | Legal: privacy policy, GDPR cookie consent, ToS, content age-rating | Client | Templates/guidance |

### Decisions the client must make
- **Subscription price** — USD? EUR? both? (recommend modeling $3/$5/$9)
- **Subscription-only, or a la carte** (rewards "unlock 1 episode for 200 pts" hints at a la carte — bigger build)
- **Hosting choice** — Vercel vs self-host

---

## 5. Phased build order

**Phase 0 — Accounts & legal (client + us together)**
- Client creates **payment provider (Paddle default / Lemon Squeezy / Stripe)**, Supabase (Frankfurt), Bunny, domain, hosting.
- ✅ **Legal templates DONE (draft)** — `legal/` has privacy, ToS, cookie, age-rating
  starters. Client must fill `[brackets]` + obtain EU legal review before launch.

**Phase 1 — Backend foundation**
- Supabase schema: `users`, `subscriptions`, `watchlist`, `rewards`, `watch_progress`.
- Supabase Auth: email/password + Google/Apple social.
- Migrate watchlist/rewards/points logic from localStorage → Supabase.

**Phase 2 — Payments**
- Create the subscription product in the chosen provider (Paddle/Lemon Squeezy/Stripe) + Checkout/Customer Portal.
- Webhook → update `subscriptions` table.
- Paywall gate checks "active subscription" instead of hardcoded flag.

**Phase 3 — Video pipeline**
- Upload 13 episodes to Bunny Stream, enable adaptive bitrate + token-auth.
- Swap VideoPlayer from local MP4 → Bunny manifest (HLS) with signed token.
- Move thumbnails/posters to Bunny Storage or CDN.

**Phase 4 — i18n + polish**
- French (FR) translation layer (Belgium audience).
- Mobile QA, performance pass.

**Phase 5 — Launch**
- DNS cutover to client domain. Monitoring + analytics.

---

## 6. Rough monthly cost estimate (at scale)

| Component | Small (1k subs) | Medium (50k subs) | Large (200k subs) |
|---|---|---|---|
| Bunny Stream (video) | ~$3 | ~$14 | ~$56 |
| Supabase | $0 (free→$25) | $25 | $25 |
| Payment fees (on revenue) | 2.9%+$0.30/sub (Stripe) or 5%+$0.50 (MoR) | same | same |
| Hosting (self/Vercel) | $0–40 | $40 | $40 |
| **Total infra** | **~$3–68** | **~$79** | **~$121** |
| Revenue @ $5/sub | $5,000 | $250,000 | $1,000,000 |

Infra stays a rounding error against revenue at every tier.

---

## 7. Open questions for evaluation

1. Hosting: Vercel (easy) vs self-host (cheapest)?
2. Pricing: $3 / $5 / $9 — need to model break-even vs acquisition cost.
3. Subscription-only vs a la carte unlocks?
4. **Payments provider: Paddle (default) / Lemon Squeezy / Stripe?** (see §2.2)
5. Timeline / budget for Phase 1–5?
6. French (FR) — confirm Belgium needs FR + EN, or more?

---

## 9. Client Oracle (Free) Launch Path

Best zero-cost launch for a pre-revenue client. **Client creates their OWN Oracle
tenancy** — never reuse the Hermes Oracle.

Free resources available (per tenancy, permanent):
- **2× AMD E2 micro** — 1/8 OCPU + 1 GB RAM each (always provisionable)
- **ARM Ampere A1** — up to 4 OCPU + 24 GB RAM *if* capacity is available at signup
- **200 GB block storage**
- **10 TB/month egress** (shared across the whole tenancy)

Recommended layout:
- **Instance A (AMD micro):** Caddy reverse proxy + static Next.js export.
- **Video:** pre-package HLS **offline** (one-time ffmpeg step), then serve
  `.ts`/`.m3u8` as static files from block storage. No on-box transcoding
  (1/8 OCPU can't transcode).
- **Instance B (AMD micro):** spare / future API or monitoring.

**Region:** pick an **EU region** (Frankfurt/Amsterdam) for GDPR + proximity to the
Belgium-first audience. Oracle provides a DPA. (A US region is closer to Houston but
EU is the better fit for the launch audience.)

## 10. Concurrency / capacity verdict (1 GB AMD micro)

Serving static HLS is "ship bytes" work — extremely cheap per request.
- 1 viewer ≈ 1.5 Mbps (720p adaptive, ~35 MB over 3 min)
- 20 concurrent ≈ 30 Mbps — **trivially** within the micro's NIC
- 100 concurrent ≈ 150 Mbps — feasible, but approaching the micro's CPU/NIC envelope;
  at this point move to the ARM 4/24 (free if available) or a paid shape
- **Egress cap is the real ceiling:** 10 TB/mo ≈ ~190k active viewers at 15 eps/sub/mo
  (or ~290k single-episode views/mo). Far beyond early-stage needs.

**Verdict:** a single 1 GB AMD micro comfortably serves **100 users / ~20 concurrent
video streams** at launch. RAM/CPU are not the bottleneck — bandwidth and the 10 TB
monthly egress cap are.

## 11. Scale-up path (when free runs out)

**Triggers:** >10 TB egress/mo, or sustained >100 concurrent, or need transcoding/DRM.

**Option A — stay on Oracle, go paid:**
- ARM A1 paid: ~$0.01/OCPU-hr → 4 OCPU 24/7 ≈ **$29/mo** (much stronger than micro)
- x86 E2 paid shapes available if ARM is unavailable

**Option B — offload video to Bunny Stream (recommended at scale):**
- Beyond 10 TB, Oracle egress ≈ **$0.085/GB**; Bunny ≈ **$0.008/GB** (~10× cheaper)
- Bunny also adds managed transcoding + token-auth (anti-piracy) + SLA
- Keep app on Oracle (free/cheap); video on Bunny. Natural split.

**Decision point:** if monthly egress approaches ~5 TB, pre-emptively wire Bunny
before the 10 TB cap bites.

## 12. Migration note

The demo's `UserProvider` (localStorage) and hardcoded free/premium flags are the
only mock pieces. Everything else (UI, player shell, series data, branding) is
production-shaped and reused directly. Estimated real build effort is in Phase 1–3,
not a rewrite.
