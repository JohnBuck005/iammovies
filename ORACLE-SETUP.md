# Oracle Cloud (Free) — Client Setup Checklist

This is the **zero-cost launch path** for IAmoviestory. The client creates their
OWN Oracle Cloud tenancy (never reuse the Hermes Oracle). Follow top-to-bottom.

---

## Phase A — Create the account (client does this)

1. Go to https://www.oracle.com/cloud/free/
2. Sign up with the **client's business email** (not yours — they own it).
3. Verify email + phone. Oracle requires a **credit/debit card** for identity
   verification. **Always Free is not charged** unless they explicitly scale up.
4. Choose **Home Region = an EU region** (recommend **Germany Frankfurt** or
   **Netherlands Amsterdam**) for GDPR + Belgium-first audience.
   - (US Ashburn is closer to Houston but EU fits the launch audience + DPA.)
   - Region is permanent — choose carefully.

## Phase B — Provision free resources

In the OCI Console → Compute → Instances → **Create instance**:

- **Instance 1 (primary):**
  - Shape: **VM.Standard.E2.1.Micro** (1/8 OCPU, 1 GB RAM) — Always Free
  - Image: **Ubuntu 22.04 LTS**
  - Add a **50 GB block volume** (free tier allows up to 200 GB total)
  - Assign a **public IP**
- **Instance 2 (spare/monitoring):** same shape, 50 GB volume (optional)
- **ARM Ampere A1 (bonus, if capacity available):** up to 4 OCPU + 24 GB RAM in
  **one** instance — grab this instead of an E2 micro if offered; much stronger.

> Note: the 2 micros are separate VMs. You cannot pool them into 2 GB for one app.

## Phase C — Harden (run once per instance)

```bash
# 1. Update
sudo apt update && sudo apt -y upgrade

# 2. Create a non-root user
adduser deploy && usermod -aG sudo deploy

# 3. SSH hardening — disable root + password login
sudo sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# 4. Basic firewall
sudo ufw allow OpenSSH && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw enable
```

## Phase D — Install runtime + reverse proxy

```bash
# Node (for app build) — or skip if deploying static export
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Caddy (reverse proxy + automatic HTTPS)
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudflare.com/caddy/deb/gpg' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable.gpg
echo "deb [signed-by=/usr/share/keyrings/caddy-stable.gpg] https://dl.cloudflare.com/caddy/deb/debian any-version main" | sudo tee /etc/apt/sources.list.d/caddy.list
sudo apt update && sudo apt install -y caddy
```

## Phase E — Serve the app + video

1. **App:** build a static Next.js export (`next build` + `next export`) → deploy to
   `/var/www/iamovies`. Point Caddy at it.
2. **Video (HLS, pre-packaged offline):** we run ffmpeg locally to split each MP4
   into `.m3u8` + `.ts` chunks (adaptive done once, not on the box), then upload the
   folder to `/var/www/iamovies/videos/`. Caddy serves it as static files.
3. **Caddyfile** (example):
   ```
   iamoviestory.example.com {
       root * /var/www/iamovies
       file_server
       encode zstd gzip
   }
   ```
   (Swap `example.com` for the client domain after DNS cutover.)

## Phase F — Capacity notes

- 1 GB micro serves **~100 users / ~20 concurrent streams** comfortably (720p HLS,
  ~1.5 Mbps each). RAM/CPU are not the limit.
- **10 TB egress/month** = the real ceiling (~190k active viewers at 15 eps/sub).
- If egress approaches ~5 TB, pre-emptively move video to Bunny Stream (10× cheaper
  beyond 10 TB, adds transcoding + token-auth).

## Phase G — DNS cutover (later)

- Point client domain A/AAAA at the instance public IP (or Cloudflare in front for
  DNS + caching; note: do NOT use Cloudflare's free CDN to serve the video — ToS
  bans it; Cloudflare is fine for DNS-only "grey-cloud" mode).

---

## We (Hermes) handle
- ✅ **Offline HLS packaging DONE** — all 13 episodes (`tbahd-ep1`–`ep13`) packaged to
  adaptive 360p/480p/720p HLS at `public/videos/hls/ep<N>/master.m3u8` (3.2 GB total).
  Pre-built 2026-07-22; ready to serve statically (Oracle) or upload to Bunny.
- The Caddyfile + app export build.
- Running Phase C–F once the client has provisioned Phase A–B and shared access.

## Client owns
- The Oracle account + card verification.
- The domain + DNS.
- All paid upgrades beyond free tier.
