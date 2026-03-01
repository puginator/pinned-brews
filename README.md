# Pinned Brews

Pinned Brews is a public coffee social app built with Next.js, Supabase Auth/Postgres, and Gemini-powered brew coaching.

## Local setup

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and set:
   `NEXT_PUBLIC_SUPABASE_URL`
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   `GEMINI_API_KEY`
   `APP_URL`
3. Apply the database schema in Supabase:
   `supabase/schema.sql`
4. Optionally seed demo data:
   `supabase/seed.sql`
5. Run the app:
   `npm run dev`

## Auth setup

Configure Supabase Auth with:

- Magic link email auth enabled
- Redirect URLs for:
  `http://localhost:3000/auth/callback`
  your Vercel preview URL
  your production domain

## Deploy

1. Create a Vercel project from this repo.
2. Add the same env vars from `.env.local`.
3. Run `supabase/schema.sql` in the target Supabase project.
4. Deploy and test:
   sign-in
   onboarding
   posting
   likes
   reports
   admin moderation
