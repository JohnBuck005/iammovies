# Google Play Data Safety Form
# Fill these answers into the Google Play Console data safety section
# VERIFIED against the shipped build: 2026-09-25 (commit 0868b99)
# Checked: no analytics SDK, no crash reporting, no push SDK, no configured payment provider.

## Data Collection

### Does your app collect or share any of the required user data types?
**Yes**

### Data types collected:

**Personal Info**
- Email address — Collected, **Not shared**, Required for app functionality
  - Purpose: App functionality, Account management (sign-in via email magic link)
  - Held by: Supabase (auth provider) — service provider, not "shared" under Play's definition

**App Activity**
- Other user-generated content (My List / watchlist, viewing progress) — Collected, **Not shared**
  - Purpose: App functionality (syncs the viewer's list and resume point across sign-in;
    guests keep it on-device only until they sign in)
  - Is it required? No — usable signed-out (stored on device)

- User account & subscription status — Collected, **Not shared**
  - Purpose: App functionality (gates episodes by plan, shows plan status)
  - Is it required? Only for account/subscription features

### Data NOT collected:
- Search history — searches are filtered on-device only, never transmitted
- Page views / taps / usage analytics — **no analytics SDK in the build**
- Crash logs — **no crash reporting SDK in the build**
- Device push tokens / push notification data — **no push SDK in the build**
- Device or other IDs
- Physical address, phone number, photos/videos, audio, files, calendar, contacts,
  health & fitness, precise location, browsing history
- Financial info (credit/debit cards) — **no payment provider is configured in this build**;
  card details never reach the app
- Ad data / advertising IDs — the app has **no ads**

---

## Security Practices

### Is data encrypted in transit?
**Yes** — all data transmitted over HTTPS

### Can users request data deletion?
**Yes** — users can request deletion via the contact email on the in-app Privacy Policy
(`/privacy` → https://iamoviestory.com/privacy)

### Is the app committed to following the Families Policy?
**No** — app is rated Teen (13+), not directed to children

---

## Data Sharing

### Is user data shared with third parties?
**No** — no data is shared for advertising or other third-party purposes.

### Processors that handle data on our behalf (service providers, not "sharing"):
- **Supabase** — auth (email) + database (watchlist, progress, subscriptions)
- **Vercel** — hosting / transport
- **Bunny CDN** — video delivery (streams media; no account data)

---

## ⚠️ If payments are enabled later
Re-declare: email shared with the payment processor, and (if PayPal/Stripe in-app checkout
ships) consider financial data handling. Prefer **Google Play Billing** for in-app digital
goods. This form must always match the shipped build — see `CONTENT_RATING.md`.
