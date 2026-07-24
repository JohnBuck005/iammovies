# IAmoviestory — Legal Templates (starter set)

> ⚠️ **These are TEMPLATES.** The client owns final legal responsibility. Every file
> contains `[bracketed]` placeholders and must be reviewed by a qualified EU/GDPR legal
> professional before launch. Do not publish as-is.

## Files
| File | Purpose |
|---|---|
| `PRIVACY-POLICY.md` | GDPR Art. 6 lawful basis, EU storage (Supabase Frankfurt), user rights, DPA contact |
| `TERMS-OF-SERVICE.md` | Subscription terms, EU withdrawal waiver on stream start, liability cap, Belgian law |
| `COOKIE-POLICY.md` | Cookie categories, consent banner logic, Microsoft Clarity analytics note |
| `AGE-RATING-POLICY.md` | [16+] content rating, sign-up age gate, enforcement |

## Client action required
1. Replace every `[bracketed]` value (entity name, address, emails, ages, retention periods).
2. Confirm the **age rating** with a content advisor (currently placeholder `[16+]`).
3. Confirm **payment processor** named (Paddle / Lemon Squeeze / Stripe) matches the live one.
4. Have a Belgian/EU lawyer review all four before publishing.
5. Wire links in the app footer: `/privacy` · `/terms` · `/cookies` · `/age-rating`.

## Design notes (already aligned with our stack)
- Supabase is **EU/Frankfurt** → supports the "EU data stays in EU" claim.
- Bunny Stream is **EU/Slovenia** → clean GDPR story for Belgium audience.
- Payment is **MoR** (Paddle/Lemon Squeezy) → they are the billing controller; we only
  receive subscription-status confirmation. ToS §6 reflects this.
- Cookie banner must gate **non-essential** cookies behind consent (Clarity is non-essential).
