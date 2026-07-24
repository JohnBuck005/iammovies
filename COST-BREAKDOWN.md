# IAmoviestory — Running Cost Breakdown

Verified 2026-07-23. All prices USD. Client owns every account (separate email).

## Fixed (recurring)
| Service | Cost | Covers |
|---|---|---|
| Vercel Pro | $20/mo | Hosting, CI/CD, CDN, SSL, WAF |
| Domain (Cloudflare Registrar) | ~$9–11/yr (~$1/mo) | .com at-cost; DNS/SSL/WAF on Cloudflare free = $0 |
| Supabase | $0/mo | Free tier (Nano) — auth + subscriptions + comments |
| Stripe | % only | 2.9% + 30¢/txn (test free); no monthly fee |
| Cloudflare | $0/mo | Free tier (DNS/SSL/WAF/CDN proxy) |
| Bunny Stream | usage (below) | video storage + delivery |

## Variable — Bunny Stream (only usage-based line)
- Storage: $0.01/GB/mo. Build = 13 eps, ~3.2 GB HLS → ~$0.03/mo.
- Delivery: ~$0.005/GB (EU/US). Transcoding + player free.
  - 100 views/mo ≈ $0.15–0.25
  - 1,000 views/mo ≈ $1.50–2.50
  - 10,000 views/mo ≈ $15–25
- Verify exact bandwidth rate on first Bunny invoice.

## Totals by scale
| Scale | Hosting+Domain | Bunny | Total/mo |
|---|---|---|---|
| Launch (low traffic) | ~$21 | ~$0.30 | ~$21–22 |
| Growing (1k views) | ~$21 | ~$2 | ~$23 |
| Popular (10k views) | ~$21 | ~$20 | ~$41 |

Plus Stripe: 2.9% + 30¢ per sale (e.g. $9.99 sub → ~$0.59 to Stripe).

## Other costs to watch
1. Stripe FX fees if non-USD bank (US co + US bank = none).
2. EU OSS filing: Stripe Tax collects VAT, does NOT remit — client files quarterly (accountant time, not platform fee).
3. Transactional email (Resend/Postmark) ~$0–20/mo if added later — not required at launch.
4. Supabase paid tier only if free limits exceeded (500MB DB, 2GB/mo egress, 50k MAU) — far off.
5. Domain renewal (~$10/yr) is the only annual line.

## Infra stack
Client domain → Cloudflare (DNS/SSL/WAF, free) → Vercel Pro ($20/mo) [or Oracle Free] → Bunny (video) + Supabase (data) + Stripe (payments).
Video MUST go through Bunny, not Cloudflare proxy or app host (ToS / broken delivery).
