# CoachConnect by Thinking Barbershop

## Overview
A Next.js 14 platform for connecting Australian ensemble groups with qualified vocal/music coaches. Users can browse coach profiles, filter by skills/location/ensemble type, and contact coaches directly.

## Tech Stack
- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon-backed) via Prisma ORM 7 with @prisma/adapter-pg
- **Auth**: NextAuth.js with credentials provider (JWT strategy)
- **Styling**: Tailwind CSS
- **UI**: Lucide React icons, class-variance-authority

## Project Structure
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - Shared React components (Navbar, Footer, UI)
- `src/lib/` - Utilities (auth config, prisma client, types)
- `src/generated/prisma/` - Generated Prisma client (gitignored)
- `prisma/` - Schema and migrations
- `prisma.config.ts` - Prisma configuration (datasource URL)

## Running
- Dev: `npm run dev` (port 5000, bound to 0.0.0.0)
- Build: `npm run build`
- Start: `npm run start` (port 5000)

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-set by Replit)
- `NEXTAUTH_SECRET` - JWT signing secret
- `NEXTAUTH_URL` - Base URL for NextAuth
- `ADMIN_SECRET` - Secret code required to register admin accounts (default: CoachConnect2026!)

## Design
- **Color scheme**: Warm coral/salmon palette (custom `coral` Tailwind colors), matching thinkingbarbershop.com style
- **Primary color**: coral-500 (#e8837c)

## Account Structure
- Users register with just name, email, and password (no role selection)
- Any user can create both a **coach profile** and an **ensemble profile** from their dashboard
- The session includes `coachProfileId` and `ensembleProfileId` fields (null if not created)
- Session is refreshed via `update()` trigger when a new profile is created
- Admin accounts are created separately at `/admin/register` with a secret code
- The `userType` field in the database is kept for admin identification only; non-admin users are `"user"`
- Legacy users with `userType: "coach"` or `"ensemble"` still work — API routes check profile existence, not userType

## Coach Skills System
Coaches select skills from 7 categories (50+ options total) stored as JSON array in the `specialties` DB field:
- Style & Contest (8), Vocal Technique (10), Tuning & Harmony (10), Performance & Interpretation (8), Visual & Choreography (6), Learning & Process (5), Leadership & Culture (3)
- Data defined in `src/lib/utils.ts` as `COACH_SKILLS` with helper functions `groupSkillsByCategory()` and `getSkillCategory()`

## Admin Panel
- Admin registration at `/admin/register` requires a secret admin code (ADMIN_SECRET env var)
- Admin accounts can also create coach and ensemble profiles from the regular dashboard
- Admin dashboard at `/admin` shows platform stats, coach management (approve/reject/verify/delete), user list with delete, and activity log
- Users table shows profile badges (Coach, Ensemble) instead of a single role type
- Deleting a coach profile removes related bookings and reviews in a transaction
- Deleting a user account removes their profile, bookings, reviews, and messages in a transaction
- Admin accounts are protected from deletion (both UI and API)
- All admin API routes under `/api/admin/` are protected with session-based auth checks
- **Audit Log**: All admin actions are logged to `AdminAuditLog` table with admin name, action type, target, and timestamp
  - Actions tracked: coach approve/reject/verify/unverify/delete, user delete, admin registration
  - Viewable in the "Activity Log" tab of the admin panel (most recent 100 entries)
  - Helper function in `src/lib/audit.ts` used by all admin API routes

## Dashboard & Navigation
- Unified dashboard at `/dashboard` shows both coach and ensemble profile cards
- Each card shows profile status and links to view/edit, or a button to create if not yet set up
- Navbar shows "Dashboard" for all logged-in users; admins also see "Admin Panel" link
- Coach profile pages show "Book This Coach" / "Message" buttons when viewer has an ensemble profile
- `/dashboard/coach` redirects to public profile or profile creation form
- `/dashboard/ensemble` shows ensemble-specific dashboard with bookings
- API endpoints: `/api/coaches/me` and `/api/ensembles/me` return the logged-in user's profile info

## Recent Changes
- 2026-02-08: Restructured accounts to allow dual profiles — any user can have both coach and ensemble profiles
- 2026-02-08: Removed coach/ensemble role selection from registration; users now register as generic accounts
- 2026-02-08: Created unified dashboard showing both profile types with create/manage options
- 2026-02-08: Updated all API routes to check profile existence instead of userType for authorization
- 2026-02-08: Added session refresh (JWT update trigger) when new profiles are created
- 2026-02-08: Admin panel users table now shows profile badges instead of single role type
- 2026-02-08: Added `/api/ensembles/me` endpoint for looking up logged-in user's ensemble profile
- 2026-02-08: Fixed "rates on enquiry" validation error; rates/travel now sent as null when toggled on
- 2026-02-08: Renamed profile sections: "Coaches" → "Ensemble Types", "Teaches" → "Experience Levels"
- 2026-02-08: YouTube videos now embed directly on coach profiles; non-YouTube URLs fall back to external link
- 2026-02-08: Unapproved/unverified coaches see a status banner on their own profile explaining visibility
- 2026-02-08: Made preferred contact method a required field with client + server validation; contact method buttons no longer toggle off
- 2026-02-08: Rate placeholders now dynamically show currency symbols ($, £, €) based on selected currency
- 2026-02-08: Added "Edit Profile" button on public coach profile page visible only to the owning coach
- 2026-02-08: Added full admin panel with registration, dashboard, coach management, and user management
- 2026-02-08: Renamed site from "Ensemble Coach" to "CoachConnect" with "by Thinking Barbershop" branding throughout
- 2026-02-08: Rephrased home page text to remove references to reviews, pricing, availability, and booking (not yet implemented); renamed "Book" step to "Connect"
- 2026-02-08: Added multi-select skill filtering on browse page with match-count ranking
- 2026-02-08: Added ensemble types selector to coach profiles
- 2026-02-08: Replaced flat specialties with categorized skills system (50+ skills across 7 categories) with accordion UI on profile edit and grouped display on profile view
- 2026-02-08: Restyled entire app from indigo/purple to coral/salmon color scheme to match thinkingbarbershop.com
- 2026-02-08: Migrated database from SQLite to PostgreSQL (Neon-backed) for production compatibility
- 2026-02-08: Updated Prisma client to use @prisma/adapter-pg, removed SQLite dependencies
- 2026-02-08: Set production environment variables (NEXTAUTH_SECRET, NEXTAUTH_URL) and configured deployment
- 2026-02-08: Initial Replit setup - configured port 5000, ran Prisma migrations, set environment variables
