# Deployment

The leaderboard ships two ways:

| Target | What | How it's built |
|---|---|---|
| **Hosted** | https://tta.leaderboard.cmm.works on the shared CMM droplet | Pushing to `main` runs `.github/workflows/deploy.yml`: tests, Docker image to GHCR, restart on the droplet, smoke check |
| **Offline** | A zip with one self-contained `TTA-Leaderboard.html` and a Thai/English `README.txt`, for the venue PC or a USB stick | `npm run package:offline` writes `release/*.zip`. Every CI run also attaches it as the `offline-bundle` artifact |

This follows the shared CMM droplet template (`DEPLOYMENT_GUIDE.md`) with these values:

| Placeholder | Value |
|---|---|
| `<APP_DOMAIN>` | `tta.leaderboard.cmm.works` |
| `<PROJECT>` | `tta` (folder `/opt/tta`, service `tta-web`) |
| `<ORG>` / `<IMAGE>` | `litt1estar` / `tta-leaderboard` → `ghcr.io/litt1estar/tta-leaderboard` |
| `<PORT>` | `80` (nginx inside the container) |
| `<HEALTH_PATH>` | `/healthz` (returns `ok`) |

## Files in this repo

| File | Purpose |
|---|---|
| `Dockerfile` | Node 24 build stage runs `npm run build`; nginx serves `dist/`. Has a Docker `HEALTHCHECK` |
| `nginx.conf` | `/healthz`; `/assets/*` cached for a year (hashed names); `index.html` always revalidated |
| `.dockerignore` | Keeps `node_modules`, builds, `logos/`, `reference/`, docs out of the build context |
| `.gitattributes` | Forces LF line endings for `Dockerfile`, `nginx.conf` and YAML, even on Windows checkouts |
| `infra/docker-compose.yml` | Copied to `/opt/tta/` by the workflow. It joins `cmm_default` and uses `expose` only, never `ports` |
| `.github/workflows/deploy.yml` | `verify` runs on pushes to `main` and `dev`: `npm test`, build, offline zip, size budgets, and the zip as an artifact. `deploy` runs on `main` only |
| `scripts/package-offline.mjs`, `scripts/offline-README.txt` | Build the offline zip |

There is no `.env` file and there are no runtime secrets: the image is a static site.

## Go-live checklist (one time)

Do these in order. Steps 1–4 are outside this repo.

1. **DNS.** In GoDaddy, go to My Products → cmm.works → DNS → Add an `A` record with Name `tta.leaderboard` and Value `139.59.100.44`. **Don't** add an `AAAA` record. Then check:
   ```bash
   nslookup tta.leaderboard.cmm.works 8.8.8.8   # must answer 139.59.100.44
   ```
2. **Droplet folder.** Run `ssh -i ./cmm_deploy_key deploy@139.59.100.44`, then:
   ```bash
   sudo mkdir -p /opt/tta && sudo chown deploy:deploy /opt/tta
   docker network ls | grep cmm      # confirm the network is named cmm_default
   free -h                           # the nginx container needs about 10 MB of RAM
   ```
3. **Caddy site block.** Open a PR in the CMM server repo (`CMM-Internship-Hub-Server`) that adds this to `infra/caddy/Caddyfile`:
   ```caddyfile
   tta.leaderboard.cmm.works {
   	encode zstd gzip
   	reverse_proxy tta-web:80
   }
   ```
   After it merges, the site answers `502` until step 6. That is expected.
4. **Repo secrets.** In GitHub, open Litt1eStar/TTA-Leaderboard-Simulation → Settings → Secrets and variables → Actions, and add `DROPLET_HOST` = `139.59.100.44`, `DROPLET_USER` = `deploy`, and `DROPLET_SSH_KEY` = the private deploy key (ask the droplet maintainer).
5. **First deploy.** Push `dev`, merge it into `main`, and push `main`. The first run builds and pushes the image, but **its `docker compose pull` step fails**, because new GHCR packages are private.
6. **Make the image public.** Go to github.com → your profile → Packages → `tta-leaderboard` → Package settings → Change visibility → **Public**. It contains only the public website. Then re-run the failed job (Actions → the run → Re-run failed jobs). The smoke check should pass.
7. **Check it:** open https://tta.leaderboard.cmm.works and https://tta.leaderboard.cmm.works/#/admin.

## Everyday use

- **Deploy:** merge `dev` into `main` and push. The site updates in about 2 minutes. Each image is also tagged with the commit SHA.
- **Roll back:** revert the bad commit on `main` and push. The previous version redeploys.
- **Offline release for the venue PC:** run `npm run package:offline`, or download `offline-bundle` from the latest GitHub Actions run. Copy the zip to the venue PC or USB stick, unzip it, and open `TTA-Leaderboard.html` (the README inside explains the rest).
- **Test the image locally:**
  ```bash
  docker build -t tta-leaderboard:local .
  docker run --rm -p 8088:80 tta-leaderboard:local   # then open http://localhost:8088/#/
  ```

## Troubleshooting

See "Lessons learned" in `DEPLOYMENT_GUIDE.md`. The ones most likely here:
- **Certificate errors:** DNS isn't resolving yet, or there's an `AAAA` record.
- **`unauthorized` on `docker compose pull`:** the package is still private (step 6).
- **Certificate warnings on campus Wi-Fi:** the university firewall inspects HTTPS. Check from mobile data instead.
