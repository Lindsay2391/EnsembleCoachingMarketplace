# Ensemble Coaching Marketplace

## Overview
A Next.js 14 marketplace for connecting Australian ensemble groups with qualified vocal/music coaches. Users can browse coaches, book sessions, leave reviews, and message each other.

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
- `DATABASE_URL` - SQLite connection string (file:./dev.db)
- `NEXTAUTH_SECRET` - JWT signing secret
- `NEXTAUTH_URL` - Base URL for NextAuth

## Design
- **Color scheme**: Warm coral/salmon palette (custom `coral` Tailwind colors), matching thinkingbarbershop.com style
- **Primary color**: coral-500 (#e8837c)

## Recent Changes
- 2026-02-08: Restyled entire app from indigo/purple to coral/salmon color scheme to match thinkingbarbershop.com
- 2026-02-08: Initial Replit setup - configured port 5000, ran Prisma migrations, set environment variables
