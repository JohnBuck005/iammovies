# IAmoviestory — Accounts to Create (Client Action List)

You (the client) need to create the accounts below. We (Hermes) build and wire
everything once they exist. **You own the accounts, the money, and the legal
liability** — we never touch your funds.

---

## 1. Domain (registrar)
- One domain for the live site (e.g. `iamoviestory.com` or your brand).
- **Who:** Client. **We do:** point DNS when ready.

## 2. Hosting (pick one)
- **Vercel** (~$20–40/mo) — easiest, auto-deploy from git. Serves the *app only*.
- **Self-host / Oracle Free** ($0) — we provide the setup checklist.
- **Who:** Client. **We do:** deploy + maintain.

## 3. Supabase (database + auth) — **EU region (Frankfurt)**
- Covers user accounts, subscriptions, watchlist, rewards.
- EU region keeps Belgian/EU user data in the EU (GDPR).
- **Who:** Client. **We do:** schema + auth wiring.

## 4. Payments (pick ONE)
This is a digital subscription sold into the **EU**, so VAT must be collected in
the customer's country. Whoever is the Merchant of Record (MoR) handles that VAT.

| Option | Fee | Handles EU VAT? | Notes |
|---|---|---|---|
| **Paddle** ⭐ default | 5% + $0.50 | ✅ Yes (MoR) | EU-facing, robust SaaS MoR. Zero VAT admin for you. |
| **Lemon Squeezy** | 5% + $0.50 | ✅ Yes (MoR) | Simpler onboarding, same MoR model. |
| **Stripe Billing** | 2.9% + $0.30 | ❌ You do | Lowest fee, but YOU calculate + file EU VAT (OSS). Needs an accountant or Stripe Tax + filing. |
| ~~Gumroad~~ | 10%+ | ✅ Yes | ❌ Marketplace model — product sits on Gumroad, not your branded app. Not compatible with our in-app paywall. |

**Recommendation:** start with **Paddle** (or Lemon Squeezy) to avoid EU VAT
headaches. Switch to Stripe only if you want the lowest fee and will handle VAT.

- **Who:** Client. **We do:** API keys + webhook → paywall gate.
- Money flows to **your** account.

## 5. Bunny Stream (video delivery)
- Hosts + streams the 13 episodes (adaptive bitrate, token-protected).
- EU company → clean GDPR story. ~$0.008/GB (far cheaper than app-host egress).
- **Who:** Client. **We do:** upload + player wiring.

## 6. Legal (templates provided, you finalise)
- Privacy policy, GDPR cookie consent, Terms of Service, content age-rating.
- **Who:** Client (final responsibility). **We do:** starter templates/guidance.

---

## Quick summary — create these 6
1. Domain registrar account
2. Hosting (Vercel **or** Oracle Free)
3. Supabase (EU/Frankfurt)
4. Payments — **Paddle** (default) / Lemon Squeezy / Stripe
5. Bunny Stream
6. Legal docs (we give templates)

**Once you've created them, share the account access (or invite us) and we proceed
with the build phases (backend → payments → video → i18n → launch).**

---
*Open questions we still need from you:*
- Hosting choice (Vercel vs self-host)?
- Subscription price ($3 / $5 / $9)?
- Subscription-only, or a la carte episode unlocks?
- Confirm French (FR) + English needed for Belgium?
- Timeline / budget?
