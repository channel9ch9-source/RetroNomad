# Cloudflare Scaffold Deployment

Last updated: 23 September 2026

This deployment exists to make RetroNomad's account/database backend testable before a marketplace provider or notification provider is connected.

## What the scaffold deploys

One Cloudflare Worker application serves both:

- RetroNomad static HTML/JS assets
- RetroNomad account/API routes

The same Worker is also bound to D1.

This keeps browser account requests same-origin, so the passwordless session can remain in a Secure + HttpOnly cookie rather than JavaScript storage.

Deployment components:

- Worker name: `retronomad-app` by default
- D1 database: `retronomad-prod` by default
- D1 location hint: Western Europe (`weur`)
- static build output: `dist/public`
- Worker entry point: `backend/alerts-worker.js`
- D1 binding: `DB`
- migration directory: `backend/migrations`
- cron: hourly (`0 * * * *`)
- `APP_ORIGIN=self`
- `MARKETPLACE_PROVIDER=disabled`
- `NOTIFICATION_PROVIDER=disabled`

The deployment uses the temporary `workers.dev` hostname until a custom domain is chosen.

## GitHub Actions deployment

Workflow:

`.github/workflows/deploy-cloudflare.yml`

It is manual-only (`workflow_dispatch`).

On each run it:

1. installs Wrangler
2. builds the browser/static assets
3. lists the account's D1 databases
4. creates `retronomad-prod` if it does not already exist
5. generates `.wrangler.deploy.jsonc` with the actual D1 database ID
6. applies D1 migrations
7. optionally configures the email-webhook secret
8. deploys the Worker + static site

## Required GitHub repository secrets

Add these in:

GitHub repository -> Settings -> Secrets and variables -> Actions -> New repository secret

Required:

### CLOUDFLARE_API_TOKEN

Create this in Cloudflare.

For the first deployment the token needs enough account-level access to:
- create/deploy the Worker
- list/create/write the D1 database

Use the narrowest permissions available for those actions.

Because the workflow creates the Worker if it does not exist, the token needs Worker-creation permission for the initial deployment. After the Worker and D1 database exist, the token can be narrowed if desired.

### CLOUDFLARE_ACCOUNT_ID

Your Cloudflare account ID.

Do not put either value into repository files.

## Authentication-email configuration

Passwordless sign-in now supports Resend directly.

### RESEND_API_KEY

Create a Resend API key with sending-only permission and store it as a GitHub Actions repository secret named exactly:

`RESEND_API_KEY`

The deployment workflow copies that value into the Cloudflare Worker secret store using Wrangler. It is never written to the repository or exposed to browser JavaScript.

Optional repository variable:

### AUTH_EMAIL_FROM

Custom sender identity, for example:
`RetroNomad <signin@example.com>`

Leave this unset during initial Resend development-sender testing. Before general-user launch, set it to an address on a verified sending domain.

Legacy/fallback webhook support remains available through:
- `AUTH_EMAIL_WEBHOOK_URL`
- `AUTH_EMAIL_WEBHOOK_SECRET`

If neither Resend nor the webhook is configured:
- the app/backend/database still deploy
- `/health` reports auth email delivery as not configured
- sign-in requests fail safely without exposing the one-time token

## First deployment

After the required Cloudflare secrets are added:

1. Open the repository's **Actions** tab.
2. Choose **Deploy RetroNomad Cloudflare scaffold**.
3. Choose **Run workflow**.
4. Wait for:
   - Build same-origin static assets
   - Resolve/create D1 and render Wrangler config
   - Apply D1 migrations
   - Deploy Worker + static app
5. Open the `workers.dev` URL Wrangler reports.

## What should work after scaffold deployment

Without email configured:
- homepage/search/wishlist/account pages load from the Worker
- account sync runtime is enabled on this deployment
- `GET /health` works
- D1 is bound
- schema migrations are applied
- hourly scheduled handler exists
- marketplace monitor remains dormant

After `RESEND_API_KEY` is configured and the Worker is redeployed:
- `/health` reports `authEmailConfigured=true` and `authEmailProvider="resend"`
- request passwordless sign-in link
- consume the 15-minute one-time link
- establish Secure + HttpOnly session
- create/sync Saved Hunts under authenticated account
- reopen synced hunts across browsers/devices after sign-in

## What intentionally does NOT work yet

- live marketplace discovery
- autonomous listing matches
- marketplace alerts
- notification delivery

Those stay disabled until legitimate providers are configured.

The Worker must not be modified to scrape eBay or another marketplace merely to make monitoring appear live.

## Runtime configuration split

GitHub Pages:
- `runtime-config.js`
- account sync remains disabled
- browser-local Saved Hunts remain available

Cloudflare build:
- `scripts/build-cloudflare.mjs` generates a deployment runtime config
- `accountSyncEnabled=true`
- API base is same-origin

Therefore deploying the Cloudflare scaffold does not silently change the existing GitHub Pages prototype.

## Local files generated during deployment

Never commit:

- `node_modules/`
- `dist/`
- `.wrangler.deploy.jsonc`
- `.dev.vars`
- environment files

They are covered by `.gitignore`.
