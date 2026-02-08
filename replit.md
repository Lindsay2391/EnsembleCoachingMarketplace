# CoachConnect by Thinking Barbershop

## Overview
A Next.js 14 platform for connecting Australian ensemble groups with qualified vocal/music coaches. Users can browse coach profiles, filter by skills/location/ensemble type, and contact coaches directly.

## Tech Stack
- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript
- **Database**: SQLite via Prisma ORM with better-sqlite3 adapter
- **Auth**: NextAuth.js with credentials provider (JWT strategy)
- **Styling**: Tailwind CSS
- **UI**: Lucide React icons, class-variance-authority

## Project Structure
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - Shared React components (Navbar, Footer, UI)
- `src/lib/` - Utilities (auth config, prisma client, types)
- `src/generated/prisma/` - Generated Prisma client (gitignored)
- `prisma/` - Schema and migrations
- `dev.db` - SQLite database file

## Running
- Dev: `npm run dev` (port 5000, bound to 0.0.0.0)
- Build: `npm run build`
- Start: `npm run start` (port 5000)

## Environment Variables
- `SQLITE_URL` - SQLite connection string (default: file:./dev.db)
- `NEXTAUTH_SECRET` - JWT signing secret
- `NEXTAUTH_URL` - Base URL for NextAuth
- `ADMIN_SECRET` - Secret code required to register admin accounts (default: CoachConnect2026!)

## Design
- **Color scheme**: Warm coral/salmon palette (custom `coral` Tailwind colors), matching thinkingbarbershop.com style
- **Primary color**: coral-500 (#e8837c)

## Coach Skills System
Coaches select skills from 7 categories (50+ options total) stored as JSON array in the `specialties` DB field:
- Style & Contest (8), Vocal Technique (10), Tuning & Harmony (10), Performance & Interpretation (8), Visual & Choreography (6), Learning & Process (5), Leadership & Culture (3)
- Data defined in `src/lib/utils.ts` as `COACH_SKILLS` with helper functions `groupSkillsByCategory()` and `getSkillCategory()`

## Admin Panel
- Admin registration at `/admin/register` requires a secret admin code (ADMIN_SECRET env var)
- Admin dashboard at `/admin` shows platform stats, coach management (approve/reject/verify), and user list
- All admin API routes under `/api/admin/` are protected with session-based auth checks
- Admin users see "Admin Panel" link in navbar instead of "Dashboard"

## Coach Navigation Flow
- Coach users clicking "My Profile" in navbar go to `/dashboard/coach` which redirects:
  - If they have a profile: redirects to `/coaches/{id}` (their public profile)
  - If no profile exists: redirects to `/dashboard/coach/profile` (profile creation form)
- Edit Profile button appears on public coach profile page when the coach is logged in
- Profile edit form cancel button links back to public profile view
- API endpoint `/api/coaches/me` returns the logged-in coach's profile ID

## Recent Changes
- 2026-02-08: Made preferred contact method a required field with client + server validation; contact method buttons no longer toggle off
- 2026-02-08: Rate placeholders now dynamically show currency symbols ($, £, €) based on selected currency
- 2026-02-08: Replaced coach dashboard with redirect to public profile (or profile creation); navbar shows "My Profile" instead of "Dashboard"
- 2026-02-08: Added "Edit Profile" button on public coach profile page visible only to the owning coach
- 2026-02-08: Added `/api/coaches/me` endpoint for looking up logged-in coach's profile ID
- 2026-02-08: Added full admin panel with registration, dashboard, coach management, and user management
- 2026-02-08: Renamed site from "Ensemble Coach" to "CoachConnect" with "by Thinking Barbershop" branding throughout
- 2026-02-08: Rephrased home page text to remove references to reviews, pricing, availability, and booking (not yet implemented); renamed "Book" step to "Connect"
- 2026-02-08: Added multi-select skill filtering on browse page with match-count ranking
- 2026-02-08: Added ensemble types selector to coach profiles
- 2026-02-08: Replaced flat specialties with categorized skills system (50+ skills across 7 categories) with accordion UI on profile edit and grouped display on profile view
- 2026-02-08: Restyled entire app from indigo/purple to coral/salmon color scheme to match thinkingbarbershop.com
- 2026-02-08: Initial Replit setup - configured port 5000, ran Prisma migrations, set environment variables
