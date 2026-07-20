# Alpron Aqua Solutions Website

Production-oriented Next.js App Router website with a database-backed product catalogue, Supabase authentication/storage, protected role-based administration, private enquiry handling, technical SEO, and verified-only business facts.

## Requirements

- Node.js 22 or newer (Node.js 24 LTS/current is recommended for the locked dependencies)
- npm 10 or newer
- Docker Desktop for the local Supabase stack
- A Supabase project and Vercel account for production

## Local setup

```powershell
Copy-Item .env.example .env.local
npm install
npx supabase start
npx supabase db reset
npm run admin:create -- admin@example.com
npm run dev
```

Open `http://localhost:3000`. The local Supabase command prints the URL, publishable/anon key and service-role key; copy them into `.env.local`. Generate a random `RATE_LIMIT_HMAC_SECRET` of at least 32 bytes.

The public website renders safe category-only fallback content when Supabase is absent. Database writes, login, media upload and real enquiries deliberately remain unavailable until Supabase is configured.

## First administrator

`npm run admin:create -- admin@example.com` prompts for the display name and password. Password input is hidden and is never accepted as a command-line argument. The script creates a confirmed Supabase Auth user and an active `super_admin` profile. It deletes the Auth user if profile creation fails.

There is no public sign-up route. Additional administrators should be created by a trusted super administrator or an audited server-side provisioning workflow.

## Environment variables

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public | RLS-constrained browser/server key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Enquiry inserts, validated media and admin bootstrap |
| `NEXT_PUBLIC_SITE_URL` | Public | Canonical origin |
| `RATE_LIMIT_HMAC_SECRET` | Server only | Pseudonymizes rate-limit keys |
| `GOOGLE_SITE_VERIFICATION` | Server-rendered metadata | Optional real verification token |
| `NEXT_PUBLIC_GA_ID` | Public | Reserved; no analytics loads while blank |

Never expose the service-role key, database password or HMAC secret with a `NEXT_PUBLIC_` prefix.

## Database and storage

Migrations in `supabase/migrations` create:

- Admin roles and immutable authorization profiles
- Categories, products, ordered images/specifications and integer-paise pricing
- Pages, page versions, site settings and verified business facts
- Private enquiries, notes and audit events
- Atomic database rate-limit buckets
- A restricted `product-media` bucket
- Row-level-security policies and transactional product saving

Migration `202607200003_verified_business_catalogue.sql` also adds editable
homepage and ordering copy, product provenance and verification fields,
verified operating-location/map facts, and idempotent upserts for the six
products recorded on the Alpron IndiaMART seller page. It does not import
marketplace recommendations, unverified prices or third-party photography.

Local reset:

```powershell
npx supabase db reset
```

Linked production migration:

```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
npx supabase gen types typescript --linked | Set-Content src/lib/database.types.ts
```

Inspect generated type changes before committing them.

## Verification

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
npm audit --omit=dev
```

Database integration tests are skipped unless `RUN_SUPABASE_INTEGRATION=true` and the Supabase variables are present. Playwright starts the application with the configured environment.

## Vercel deployment

1. Create the production Supabase project and apply migrations.
2. Create the first administrator.
3. Import this repository into Vercel with the Next.js preset and Node.js 24.
4. Add every environment variable separately for Production and Preview.
5. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin.
6. Add the production origin to Supabase Auth Site URL and redirect allowlist, including `/auth/callback`.
7. Deploy, then run the route, authorization, enquiry and CRUD acceptance checks.
8. Configure the custom domain only after legal/contact facts and legal pages are approved.

No production deployment can be completed without the client’s Supabase, Vercel and domain credentials.

## Backups and operations

- Enable Supabase point-in-time recovery or scheduled backups appropriate to the plan.
- Export inquiries before destructive maintenance and restrict operational access.
- Rotate the service-role key and HMAC secret after any suspected exposure.
- Review audit events and stale admin accounts periodically.
- Update dependencies with security advisories in mind; never use `npm audit fix --force` without reviewing breaking changes.

## Client launch checklist

- Confirm legal entity, GST, proprietor/authorized contact and addresses
- Approve the direct public phone, WhatsApp and email; directory routing numbers are not used
- Confirm the published Sahibabad operating address and the separate Dilshad Garden address
- Approve every product name, model, specification, price, MOQ and availability
- Supply owned/licensed logo and product photography with alt-text context
- Confirm warranty, installation, service, delivery and certification claims
- Obtain legal review of privacy policy and terms
- Provide the production domain, analytics ID and Search Console token

See `BUSINESS_DATA_NOTES.md` for source-by-source research and conflicts.
