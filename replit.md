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
- Coaches can initiate invite-based review requests to ensembles.
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
- Notification bell in the navbar shows pending review invites for ensemble users and pending coach approval counts for admins.
- Admins see the bell even without ensemble profiles; notifications link to the admin panel.

**Email Verification & Password Reset:**
- Registration generates a verification token and sends a branded HTML email via Resend.
- Dashboard shows an amber banner prompting unverified users to verify their email, with a "Resend Email" button.
- `/verify-email` page handles token verification from email links.
- `/forgot-password` page lets users request a password reset email (generic response to prevent account enumeration).
- `/reset-password` page allows setting a new password from a reset link (tokens expire after 1 hour).
- Email utility at `src/lib/email.ts` with coral-branded HTML templates.

## Recent Changes
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

## External Dependencies
- **Database**: PostgreSQL (Neon-backed) managed with Prisma ORM 7 (`@prisma/adapter-pg`).
- **Authentication**: NextAuth.js with a credentials provider (JWT strategy).
- **Email**: Resend for transactional emails (verification, password reset) via `RESEND_API_KEY` secret.
- **External Links**: Integration with `buymeacoffee.com` for platform support donations.