# CoachConnect by Thinking Barbershop

## Overview
CoachConnect is a Next.js 14 platform designed to connect ensemble groups with qualified vocal and music coaches. Initially launching in Australia, the platform is internationalized for 8 countries (Australia, USA, New Zealand, UK, Sweden, Denmark, Germany, Ireland). Users can browse coach profiles, filter by country/region/skills/ensemble type, and directly contact coaches. The platform aims to be the central hub for the global barbershop community, facilitating connections and supporting musical development.

## User Preferences
I prefer simple language.
I want iterative development.
Ask before making major changes.

## System Architecture
The platform is built with Next.js 14.2 using the App Router, TypeScript, and Tailwind CSS for styling, adhering to a warm coral/salmon color scheme (`coral-500 #e8837c`) to match the `thinkingbarbershop.com` brand. UI components leverage Lucide React icons and `class-variance-authority`.

**Account Structure and Profiles:**
- Users register with basic information and can then create both a coach profile and multiple ensemble profiles from a unified dashboard.
- Admin accounts are created separately via a secret code at `/admin/register`.
- The system supports dual profiles, meaning any user can have both coach and ensemble profiles, with session data reflecting `coachProfileId` and `ensembleProfileIds`.

**Coach Skills System:**
- A database-driven skill system utilizes `Skill` and `CoachSkill` tables, categorizing skills (Musicality, Singing, Performance, Learning & Process).
- It supports custom skills, `showInFilter` flags, and `endorsementCount` for skill validation from reviews.
- The browse page features skill search autocomplete and multi-select filtering with match-count ranking and smart sorting.

**Admin Panel:**
- A comprehensive admin panel at `/admin` provides platform statistics, coach management (approve, reject, delete), user management (email verification, delete), and an activity log.
- Email verification is managed in the Users tab — admins can verify/unverify user accounts, which automatically syncs the verified tick on any associated coach profile.
- Stats cards show: Total Users, Total Coaches, Pending Approvals, Verified Users.
- All admin actions are logged to an `AdminAuditLog` table.
- Admin protection is implemented for sensitive operations.

**Dashboard & Navigation:**
- A unified `/dashboard` displays both coach and all ensemble profiles associated with a user, offering creation and management options.
- Navigation includes "Dashboard" for all users and "Admin Panel" for administrators.

**Review System:**
- Two-way review flow: Coaches can invite ensembles to review them, AND ensembles can submit reviews unprompted.
- Ensemble-initiated reviews require coach approval before going live. Coaches see only the ensemble name and coaching period — not the rating, testimonial, or skills — before deciding to approve or reject.
- On approval, the review is converted to a full Review record with ratings, skill endorsements, and testimonials applied to the coach profile.
- Reviews include ratings, testimonials, session details, and validated skills, which increment `endorsementCount` on coach profiles.
- An admin moderation system is in place for reviews.

**Favourites & Smart Sorting:**
- Users can favourite coaches, which prioritizes them in search results.
- A smart sorting algorithm ranks coaches based on relevance (country, state, city, ensemble type, experience level), skill match count, and rating.

**Feedback System:**
- In-app feedback form accessible from the dashboard via a "Send Feedback" button and modal.
- Coaches/users can submit categorized feedback (Bug Report, Feature Request, Usability, General) with a 2000-character message.
- Admin panel has a "Feedback" tab with status filter pills (All, New, Reviewed, Archived), category/status badges, and actions to mark feedback as reviewed, archived, or new.
- Feedback tab shows a count badge on the tab button for unread ("new") items.

**Notification System:**
- Notification bell in the navbar shows pending review invites for ensemble users, pending ensemble-initiated reviews for coaches, and pending coach approval counts for admins.
- Admins see the bell even without ensemble profiles; notifications link to the admin panel.

**Email Verification & Password Reset:**
- Registration generates a verification token and sends a branded HTML email via Resend.
- Dashboard shows an amber banner prompting unverified users to verify their email, with a "Resend Email" button.
- `/verify-email` page handles token verification from email links.
- `/forgot-password` page lets users request a password reset email (generic response to prevent account enumeration).
- `/reset-password` page allows setting a new password from a reset link (tokens expire after 1 hour).
- Email utility at `src/lib/email.ts` with coral-branded HTML templates.

## Recent Changes
- 2026-02-18: Review update system: same ensemble can now submit updated reviews for the same coach after a 9-month cooldown period
- 2026-02-18: Rating calculation uses only the latest review per ensemble for average rating; skill endorsements accumulate from all reviews
- 2026-02-18: Review button states: "Submit a Review" (new), "Update Review" (after 9 months), greyed out with cooldown timer (within 9 months), "Review pending approval" (pending)
- 2026-02-18: New `/api/reviews/check-status` endpoint for review button state management
- 2026-02-18: Shared `recalculateCoachRating()` utility in `src/lib/reviewUtils.ts` used across all review flows
- 2026-02-18: Submit review page adapts title, messaging, and button text for update vs. new review
- 2026-02-12: Admin panel: added sortable column headers and filter controls (search, status, country, category, type) to all 7 tabs
- 2026-02-12: Coach skills UI redesigned: top 4 skills visually highlighted as "Profile Card Skills" with coral styling, divider separates remaining skills; drag-to-reorder preserved
- 2026-02-12: Added 5 new skills under "Coaching Activities" category: Workshops & Classes, Arranger Circle, PVIs, Director Coaching, Riser Placement
- 2026-02-12: Ensemble dashboard: decline button on review invites, submitted reviews section with status badges, edit/recall actions for pending reviews
- 2026-02-12: New edit review page at /reviews/edit for editing pending ensemble-initiated reviews
- 2026-02-12: New API endpoints: invite decline, ensemble reviews list, ensemble review GET/PUT/DELETE
- 2026-02-10: Added 4 new optional coach profile fields: pronouns (displayed next to name), weekend rate (in rates grid), rates notes (italic text below rates), travel willingness (own city/within state/interstate/international with badge display)
- 2026-02-10: Updated shared CoachProfileWithUser TypeScript interface with new fields
- 2026-02-10: Added coaching format field to coach profiles (in-person, virtual, or both) with form controls and badge display on profile page
- 2026-02-10: Self-invite prevention — coaches cannot send review invites to their own ensembles (filtered in search + API validation)
- 2026-02-10: Replaced month dropdown with calendar-style MonthYearPicker in review forms, supporting historical date selection back to 2010
- 2026-02-10: Added ensemble-initiated review system — ensembles can submit reviews from coach profiles; coaches approve/reject blindly (without seeing content); approved reviews become full Review records with ratings and skill endorsements
- 2026-02-10: Coach notification bell now shows pending ensemble review count
- 2026-02-10: Dashboard ensemble profile cards show pending review invite indicators
- 2026-02-09: Migrated profile picture uploads from filesystem (public/uploads) to Replit Object Storage for production persistence; new photos stored at /api/objects/uploads/uuid.ext
- 2026-02-09: Moved account verification from Coaches tab to Users tab in admin panel; admin verify/unverify now syncs coach profile verified tick automatically
- 2026-02-09: Coach profiles auto-receive verified tick when created by email-verified users, or when user verifies email with existing coach profile
- 2026-02-09: Stats card updated from "Verified Coaches" to "Verified Users"
- 2026-02-09: Implemented email verification system with Resend (verification on registration, dashboard banner, resend option)
- 2026-02-09: Implemented password reset flow (forgot-password page, reset email with 1-hour expiry, reset-password page)
- 2026-02-09: Added "Forgot password?" link to login page
- 2026-02-09: Full internationalization for 8 countries with COUNTRIES config, dynamic region dropdowns, country filters on browse page, locale-aware currency formatting, smart sorting with country matching (+15 points), ensemble uniqueness constraint updated to [ensembleName, state, country]
- 2026-02-09: Added in-app feedback system with FeedbackModal component and admin Feedback tab
- 2026-02-09: Added admin notifications for pending coach profile approvals in notification bell
- 2026-02-09: Linked coach names in admin panel to their public profiles for pre-approval review
- 2026-02-09: Added three new ensemble types: Upper Voice Groups, Mixed Voice Groups, Lower Voice Groups

## Phase 1 Tasks (from user feedback) — COMPLETED
1. **Fix case-sensitive search** — Coach search now case-insensitive (fullName and bio).
2. **Ensemble filtering on review invite** — Country and state filters added to ensemble search when inviting reviews.
3. **Admin ensemble management** — Ensembles tab in admin panel with stats, searchable list, owner details, and delete functionality.
4. **Homepage ensemble join button** — "Join as an Ensemble" button added alongside "Join as a Coach" with smart redirects for logged-in users.
5. **Role-based registration flow** — Registration supports ?role=coach and ?role=ensemble query params directing users to appropriate profile creation.

## External Dependencies
- **Database**: PostgreSQL (Neon-backed) managed with Prisma ORM 7 (`@prisma/adapter-pg`).
- **Authentication**: NextAuth.js with a credentials provider (JWT strategy).
- **Email**: Resend for transactional emails (verification, password reset) via `RESEND_API_KEY` secret.
- **External Links**: Integration with `buymeacoffee.com` for platform support donations.