# iamoviestory.com — Setup Sequence

Domain registered: 2026-07-23 (under OUR Cloudflare; push to client account later via Registrar → Transfer to another account).

## ORDER MATTERS — do not skip steps
1. [x] Register iamoviestory.com on Cloudflare (registrar cost ~$10/yr, free privacy).
2. [ ] Cloudflare → Email Routing → route `info@iamoviestory.com` → your real inbox.
       Verify MX/TXT (auto if DNS on Cloudflare). UNTIL THIS IS DONE, do NOT sign up services with info@ (verification bounces).
3. [ ] Create service accounts, ALL under `info@iamoviestory.com` (unique password each — never reuse):
       - Vercel        (host — decided tonight: Vercel Pro + Cloudflare-in-front)
       - Bunny.net     (video streaming — Library ID + API key)
       - Supabase      (DB + auth — already has project; move to info@ if needed)
       - Stripe        (payments — Tax + EU OSS enabled client-side)
4. [ ] Deploy app to Vercel (connect GitHub repo, set env: NEXT_PUBLIC_BASE_URL, Supabase keys, Stripe keys, STRIPE_WEBHOOK_SECRET).
5. [ ] Cloudflare DNS → add CNAME `iamoviestory.com` (and `www`) → Vercel (cname.vercel-dns.com).
       Enable Always Use HTTPS + Full SSL.
6. [ ] Swap env to prod: NEXT_PUBLIC_BASE_URL=https://iamoviestory.com, webhook URL prod, cookie secure=true.
7. [ ] (Later) Push domain to client's Cloudflare account: Registrar → iamoviestory.com → Transfer to another account → client email.
       Update registrant to client details. Zero downtime.

## Why info@iamoviestory.com for everything
One consistent client identity → clean handoff. Your email stays as recovery/forward destination until push.

## Reminder
- Do NOT deploy on Cloudflare Workers (Next.js 16 shim = rework risk). Cloudflare = DNS/SSL/WAF/email only.
- Bunny password MUST be unique (separate service, reuse email not password).
