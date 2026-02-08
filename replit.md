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
- Any user can create both a **coach profile** and **multiple ensemble profiles** from their dashboard
- The session includes `coachProfileId` (string | null) and `ensembleProfileIds` (string[]) fields
- Session is refreshed via `update()` trigger when a new profile is created
- Ensemble names must be unique within each state (`@@unique([ensembleName, state])`)
- Admin accounts are created separately at `/admin/register` with a secret code
- The `userType` field in the database is kept for admin identification only; non-admin users are `"user"`
- Legacy users with `userType: "coach"` or `"ensemble"` still work — API routes check profile existence, not userType

## Coach Skills System (Database-Driven, Feb 2026)
Skills are now stored in a relational `Skill` table with a `CoachSkill` junction table, replacing the old JSON-only approach:
- **4 categories** (26 skills): Musicality (5), Singing (7), Performance (7), Learning & Process (7)
- **Skill table**: id, name, category, isCustom, showInFilter — supports custom user-created skills
- **CoachSkill table**: coachProfileId, skillId, displayOrder, endorsementCount — tracks which skills each coach has, their display order, and how many endorsements from reviews
- **Filter logic**: Predefined skills always show in browse filter (unless admin hides). Custom skills auto-appear in filter when 5+ coaches have them. `showInFilter` flag allows admin override.
- **API**: `GET /api/skills` returns filter-eligible and all skills; `GET /api/skills?mode=search&search=X` for autocomplete; `POST /api/skills` creates custom skills
- **Admin API**: `GET/PATCH/DELETE /api/admin/skills` — list skills with coach counts, toggle showInFilter, delete custom skills (predefined protected server-side)
- **Browse page**: Skill search autocomplete above category accordions; searches all skills including those below threshold
- **Backward compat**: The `specialties` JSON column on CoachProfile is still written to but coachSkills relation is preferred
- **Review validation**: When ensembles validate coach skills in reviews, `endorsementCount` on CoachSkill is incremented
- **Seed scripts**: `prisma/seed-skills.ts` migrates existing coaches; `prisma/seed.ts` creates test data with CoachSkill records
- Helper functions in `src/lib/utils.ts`: `COACH_SKILLS`, `ALL_SKILLS`, `getSkillCategory()`, `groupSkillsByCategory()`

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
  - Actions tracked: coach approve/reject/verify/unverify/delete, user delete, admin registration, skill hide/show/delete
  - Viewable in the "Activity Log" tab of the admin panel (most recent 100 entries)
  - Helper function in `src/lib/audit.ts` used by all admin API routes

## Dashboard & Navigation
- Unified dashboard at `/dashboard` shows coach profile card and all ensemble profile cards
- Users can create and manage multiple ensemble profiles from the dashboard
- Each ensemble card shows name, type, location with edit/dashboard links
- "Add Another Ensemble" button appears when user already has at least one ensemble
- Navbar shows "Dashboard" for all logged-in users; admins also see "Admin Panel" link
- `/dashboard/coach` redirects to public profile or profile creation form
- `/dashboard/ensemble` shows ensemble picker if multiple, or single ensemble dashboard
- `/dashboard/ensemble/profile?id=xxx` edits a specific ensemble; no id = create new
- API endpoints: `/api/coaches/me` returns coach profile; `/api/ensembles/me` returns all user's ensemble profiles (array)
- CRUD: `/api/ensembles/[id]` supports GET/PUT/DELETE with ownership checks

## Review System
- Coach-initiated invite-based reviews: Coaches send invites to ensemble email addresses, ensembles write reviews from pending invites
- **Models**: `ReviewInvite` (pending/completed/expired, 90-day expiry) and `Review` (linked to invite, not booking)
- **Review fields**: rating (1-5), reviewText, sessionMonth/Year, sessionFormat (in_person/virtual), validatedSkills (JSON array)
- **Skill verification**: Reviewers validate coach skills they can vouch for; coach profiles show verification counts (e.g., "Pitch Accuracy ✓3")
- **Coach dashboard**: `/dashboard/coach/reviews` — send invites, track status
- **Ensemble dashboard**: Pending invites section with "Write Review" links
- **Review submission**: `/reviews/write?inviteId=XXX` — star rating, testimonial, session details, skill validation checkboxes
- **Admin moderation**: Reviews tab in admin panel with delete capability; audit logged
- **API routes**: POST/GET `/api/reviews/invite`, GET `/api/reviews/invite/[id]`, GET `/api/reviews/invites/pending`, POST `/api/reviews`, GET `/api/coaches/[id]/reviews`, GET/DELETE `/api/admin/reviews[/id]`

## Favourites & Smart Sorting
- Users can favourite coaches via heart icon on browse page and coach profile pages
- Favourite coaches appear at the top of the "Find Coaches" page
- If the user has an ensemble profile, coaches are ranked by relevance: same state (+10), same city (+5), matching ensemble type (+10), matching experience level (+10)
- Sort order: Favourites first → Relevance score → Skill match count → Rating
- `FavoriteCoach` model with unique constraint on (userId, coachProfileId)
- API: GET/POST `/api/favorites` (toggle favourite, list favourite IDs)
- Optimistic UI updates with rollback on failure

## Recent Changes
- 2026-02-08: Added smart skill filter management: predefined skills always show in filter, custom skills auto-appear when 5+ coaches have them, admin can toggle visibility
- 2026-02-08: Added skill search autocomplete to browse page filter panel that searches all skills including those below threshold
- 2026-02-08: Created Admin Skills tab with ability to view all skills with coach counts, toggle showInFilter flag, and delete custom skills (predefined protected server-side)
- 2026-02-08: Multiple ensemble profiles per user — users can now create and manage multiple ensembles from the dashboard; ensemble names must be unique per state; search displays state only for duplicate names
- 2026-02-08: Updated footer and hero to say "Australian Barbershop community"; added review mention to For Ensembles card; removed bookings completed indicator from coach profiles
- 2026-02-08: Added favourites system — users can favourite coaches with heart button; favourited coaches always appear first on browse page; smart sorting ranks nearby coaches with matching skills higher for ensemble members
- 2026-02-08: Migrated skills system from hardcoded JSON to database-driven Skill + CoachSkill tables with 4 categories (26 skills), custom skill support, endorsement counts, and display ordering
- 2026-02-08: Added "Buy Me a Coffee" support button across the site (footer, home page banner, dashboard, coach profiles) linking to buymeacoffee.com/ThinkingBarbershop with clear messaging that donations support the CoachConnect platform, not individual coaches
- 2026-02-08: Added notification bell to navbar showing pending review invite count with dropdown for quick access
- 2026-02-08: Cleaned up ensemble dashboard — removed KPIs and bookings section, kept review invites and quick links
- 2026-02-08: Removed "Book This Coach" and "Message" buttons from public coach profile page
- 2026-02-08: Added hover tooltips on verified skill badges showing which ensembles validated each skill
- 2026-02-08: Review invites now only target existing ensembles on CoachConnect (search/select UI, backend validation)
- 2026-02-08: Added `/api/ensembles/search` endpoint for coaches to find registered ensembles
- 2026-02-08: Implemented coach-initiated review invite system with skill validation, admin moderation, and profile verification display
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

## Phase 2 — Future Implementations
- **Social Login (OAuth)**: Add Google, Facebook (and potentially Apple/GitHub) sign-in via NextAuth.js providers, with account linking for existing email/password users
- **International Roll-Out**: Expand beyond Australia with country selection, localized content, and region-appropriate defaults
- **Time Zone Display**: Show time zone differences between ensemble and coach on profiles, especially useful for virtual coaching across regions
- **Email Notifications**: Automated emails for review invites, profile approvals, new messages, and other key platform events
- **Analytics Dashboard for Coaches**: Profile views, search appearances, enquiry counts, and other engagement metrics to help coaches understand their reach
