# Portfolio Builder – Secure, Supabase‑powered React App

A modern portfolio builder with authentication, sections/projects editing, sharing, and lightweight analytics. Built with React + Vite + TypeScript, shadcn-ui, Tailwind CSS, and Supabase.


## Quick Start

1) Install dependencies
- Node.js 18+
- npm i

2) Run locally
- npm run dev
- App runs on http://localhost:8080

3) Build
- npm run build
- Preview: npm run preview


## Tech Stack
- React 18, TypeScript, Vite
- Tailwind CSS + shadcn-ui components
- TanStack Query
- Supabase (Auth, DB, Edge Functions)


## App Structure (Key Paths)
- src/pages: Auth, Index (dashboard), Settings, Analytics, SharedPortfolio
- src/components: UI + portfolio editor widgets
- src/hooks: data fetching and state (profile, sections, projects)
- src/contexts: AuthContext, ThemeContext
- src/integrations/supabase: client and generated types


## Authentication
- Supabase Auth drives session state (src/contexts/AuthContext.tsx)
- Protected routes: /dashboard, /settings, /analytics
- Public routes: /auth, /shared/:shareId, 404
- Set Authentication → URL Configuration in Supabase:
  - Site URL: your app URL (local or deployed)
  - Redirect URLs: include your local and deployed URLs


## Supabase Configuration

**Database Credentials:**

**Current Supabase Project:**
- Project ID: `lvkrxwuhzqxykeksyurl`
- URL: `https://lvkrxwuhzqxykeksyurl.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2a3J4d3VoenF4eWtla3N5dXJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MzU0NTEsImV4cCI6MjA3NTAxMTQ1MX0.kNHNmjLNCFBFsWVA6pCrNOD9i07ln5Mp0ZexeoQz5PI`

**Configuration Files:**
- All Supabase connection configuration is centralized in two files:
  1. **`src/lib/constants.ts`** - Used by the React app at runtime (contains PROJECT_ID, URL, and ANON_KEY)
  2. **`supabase/config.toml`** - Used by Supabase CLI for migrations (contains project_id only)

**Important Notes:**
- Do NOT create `.env` files - they are not used in this project
- The Supabase client is initialized in `src/integrations/supabase/client.ts` and imports credentials from `src/lib/constants.ts`
- Both configuration files must be kept in sync manually when changing environments
- SQL changes are managed via migrations in `supabase/migrations`

Useful dashboard links:
- SQL Editor: https://supabase.com/dashboard/project/shluolqufopjgtapugnx/sql/new
- Auth Providers: https://supabase.com/dashboard/project/shluolqufopjgtapugnx/auth/providers
- Users: https://supabase.com/dashboard/project/shluolqufopjgtapugnx/auth/users
- Edge Functions: https://supabase.com/dashboard/project/shluolqufopjgtapugnx/functions
- Storage: https://supabase.com/dashboard/project/shluolqufopjgtapugnx/storage/buckets


## Security: Link Validation and Sanitization
We validate and normalize URLs in the frontend and enforce in the DB.

Frontend (src/utils/securityUtils.ts)
- validateAndFormatUrl(url):
  - Allows protocols: http, https, mailto, tel
  - Normalizes protocol‑relative URLs ("//example.com" → "https://example.com")
  - Adds https:// if protocol missing
  - Returns "" if invalid or unparsable
- sanitizeText(text): escapes HTML special chars

Database
- Trigger function public.validate_links_url() rejects links without allowed protocols


## Exact Test Plan + Paste‑Ready URL Examples
Use these to manually verify behavior in the UI and during code review.

A) Valid URLs (expected: accepted and normalized if needed)
1. https://example.com
2. http://example.com
3. https://Sub.Domain.Example.com/Path?Q=1#hash → hostname lowercased in output
4. mailto:user@example.com
5. tel:+123456789
6. example.com → becomes https://example.com
7. www.example.com/path → becomes https://www.example.com/path
8. //cdn.example.com/lib.js → becomes https://cdn.example.com/lib.js

B) Invalid/Malformed (expected: rejected → empty string in UI; DB trigger would error)
1. javascript:alert(1)
2. data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==
3. ftp://example.com
4. file:///etc/passwd
5. chrome-extension://abcdef
6. blob:https://example.com/uuid
7. about:blank
8. <script>alert(1)</script> (use sanitizeText for text fields)
9. http:/broken.com (bad scheme)
10. ://missing.scheme

C) Edge Cases (expected behavior in parentheses)
1. "" (empty) → ""
2. "   " (whitespace) → ""
3. EXAMPLE.COM → https://example.com
4. HTTPS://EXAMPLE.COM → https://example.com
5. mailto:USER@EXAMPLE.COM → mailto:user@example.com (no host normalization guarantee for local part; function parses URL object when applicable)
6. tel:001-234-5678 → tel:001-234-5678 (allowed)

Acceptance checklist
- All in (A) are persisted and open correctly in new tabs
- All in (B) are blocked by UI (empty result) and DB trigger
- (C) behave as indicated


## How to Manually Test in the UI
- Go to Dashboard → edit a project → add/edit a Link
- Paste examples from sections A, B, C
- Save and verify behavior (valid saved, invalid blocked)


## Scripts
- dev: vite dev server
- build: production build
- preview: preview local build


## Deployment
- Publish via Lovable UI (Share → Publish)
- Custom domain: Project → Settings → Domains


## Troubleshooting
- Auth redirect issues: set Site URL and Redirect URLs in Supabase
- If stuck in a loop or seeing errors, check browser console and Supabase logs

Helpful docs
- Lovable Quickstart: https://docs.lovable.dev/user-guides/quickstart
- Troubleshooting: https://docs.lovable.dev/tips-tricks/troubleshooting
