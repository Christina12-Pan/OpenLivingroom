# Open Livingroom

A web app for **Stanford GSB MBA** students to coordinate **summer housing**: on-site interns list spare rooms (**Anchors**); remote interns browse and request stays (**Roamers**). Browsing is public; auth is required to list or request.

**Full product, code, and design rules** live in [`.cursorrules`](./.cursorrules). Read that file before contributing.

---

## Tech stack

| Area | Choice |
|------|--------|
| Framework | Next.js (App Router), TypeScript (strict) |
| Styling | Tailwind CSS only |
| Data | Supabase (Postgres + Realtime) |
| Auth | Supabase Auth — Google OAuth, `@stanford.edu` only |
| Map | `react-simple-maps` |
| Dates | `react-day-picker` |
| Forms (per project rules) | `react-hook-form` + `zod` |
| Email | Resend via Supabase Edge Function |
| Deploy | Vercel |

Do **not** add libraries beyond what the rules allow without asking.

---

## Features (in scope)

1. Home — world map + city list  
2. City page — Anchor cards + live calendar strip  
3. Stay request modal  
4. Become an Anchor — multi-step form  
5. My Anchor — requests, accept/decline, edit availability  

**Out of scope:** in-app chat, payments, reviews, push notifications, admin panel, social features. See `.cursorrules` for the exact list.

---

## Getting started

### Prerequisites

- Node.js 18+  
- A [Supabase](https://supabase.com) project  
- (Optional) Resend for email from Edge Functions  

### Install

```bash
npm install
```

### Environment

Copy or create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Never expose the **service role** key to the browser.

### Database

Apply migrations in `supabase/migrations/` via the Supabase SQL Editor or CLI. **Canonical table definitions, constraints, and RLS notes are in [`.cursorrules`](./.cursorrules)** — if a migration file disagrees (for example `roamer_email`, `NOT NULL` columns, or `status` check), align the database with `.cursorrules`. Enable Realtime on `stay_requests` and `availability` as described there.

**Order:** run `20240407000000_initial_schema.sql` first, then `20240407000001_row_level_security.sql` on a **new** project (or adjust if tables already exist). Migrations also add tables to the `supabase_realtime` publication.

### Supabase dashboard (you need to do this)

1. **SQL:** Paste and run each migration file in **SQL Editor** → *Run* (see order above).  
2. **Authentication → Providers:** Enable **Google**; add your Google OAuth client ID/secret from Google Cloud Console.  
3. **Authentication → URL configuration:** Add **Redirect URLs** for local and production, e.g. `http://localhost:3000/auth/callback` and `https://your-domain.vercel.app/auth/callback`.  
4. **Realtime:** Under **Database → Publications**, confirm `supabase_realtime` includes `anchors`, `availability`, and `stay_requests` (the first migration attempts to add them).  
5. **`@stanford.edu` only:** Not enforced in code yet — use a Supabase **Auth Hook** or **sign-in callback** in the app (see TODO / `.cursorrules`).  

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Script | Command |
|--------|---------|
| Development | `npm run dev` |
| Production build | `npm run build` |
| Start production server | `npm start` |
| Lint | `npm run lint` |

---

## Project layout

```
app/                 # App Router pages (home, city, become-anchor, my-anchor)
components/          # UI components (Map, AnchorCard, CalendarStrip, etc.)
lib/                 # Supabase client, utilities
supabase/
  migrations/        # SQL migrations
  functions/         # Edge functions (e.g. notify-anchor + Resend)
```

**Naming:** components `PascalCase.tsx`; utilities/hooks `camelCase.ts`; routes kebab-case folders.

---

## Design system (summary)

- **Headings:** Playfair Display (italic accents on key words)  
- **Body/UI:** DM Sans  
- **Colors:** Accent gold `#B47B2E`, status green/amber/red, off-white backgrounds — **exact tokens** in `.cursorrules`  
- **UI:** No harsh shadows; thin borders; `rounded-xl` / `rounded-lg` per rules; max width `max-w-5xl mx-auto px-6`  

All user-facing copy is **English**, warm and direct. Exact marketing strings are listed in `.cursorrules`.

---

## Security & auth

- Protect `/become-anchor` and `/my-anchor` via middleware (per rules).  
- Reject non-`@stanford.edu` OAuth with the copy specified in `.cursorrules`.  
- Use Supabase session handling; do not store auth tokens in `localStorage`.

---

## Calendar strip

Per-day status: **booked** (confirmed request) → **pending** → **available** (inside availability). Subscribe to Realtime on `stay_requests` (filtered by `anchor_id`) for live updates. See `.cursorrules` for the full algorithm.

---

## License

ISC (see `package.json`).
# OpenLivingroom
