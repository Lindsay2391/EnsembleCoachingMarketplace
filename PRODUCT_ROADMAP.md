# Ensemble Coaching Marketplace - Product Design & Roadmap

## Executive Summary

A two-sided marketplace connecting ensemble groups (choruses, quartets, a cappella groups) with qualified coaches. Starting as a free platform in Australia with plans for global expansion, the product solves discovery, booking friction, and reliability issues for both sides of the market.

**Core Value Propositions:**
- **For Ensembles:** Find the right coach, book with confidence, reduce admin overhead
- **For Coaches:** Get discovered, fill calendar gaps, reduce cancellations and payment hassles

---

## Product Principles

1. **Trust First:** Build credibility through transparency (profiles, reviews, clear pricing)
2. **Reduce Friction:** Every feature should eliminate steps, not add them
3. **Start Simple:** Launch lean, validate with real users, iterate based on data
4. **Future-Proof:** Build for Australia, architect for global scale
5. **Fair Marketplace:** Balance power between coaches and ensembles

---

## User Personas

### Primary Personas

#### Ensemble Director/Manager ("Sarah")
- **Role:** Chorus director or quartet lead
- **Pain Points:** 
  - Doesn't know which coaches specialize in their needs
  - Wastes time on email tennis for scheduling
  - Worried about last-minute cancellations
  - Budget uncertainty (travel costs, hidden fees)
- **Jobs to be Done:** Find a coach who "gets" my group, book them confidently, minimize admin
- **Success Metrics:** Time to booking, coach satisfaction score

#### Professional Coach ("Marcus")
- **Pain Points:**
  - Spends 30%+ of time on admin (invoicing, calendar management, payment chasing)
  - Calendar has gaps that could be filled
  - Loses money to last-minute cancellations
  - Hard to prove credibility to new clients
- **Jobs to be Done:** Get found by right clients, fill my calendar, get paid reliably
- **Success Metrics:** Bookings per month, time saved on admin, payment reliability

### Secondary Personas

#### Treasurer/Administrator ("Janet")
- Handles ensemble finances, needs proper invoices and clear pricing
- Low tech comfort, needs simple payment flows

#### Emerging Coach ("Tom")
- Building reputation, needs platform credibility
- Willing to offer competitive rates for reviews/exposure

---

## Market Analysis

### Australian Market (Phase 1 Focus)
- **Ensemble Segments:** Barbershop (AAMBS, Sweet Adelines), community choruses, a cappella groups, chamber ensembles
- **Geographic Clusters:** Sydney, Melbourne, Brisbane, Adelaide, Perth
- **Key Insight:** Travel costs are significant (coach may need to fly interstate), but pool of local coaches is limited

### Global Expansion Considerations
- **Phase 2:** New Zealand, UK (strong barbershop/choral tradition)
- **Phase 3:** North America (largest market but most competitive)
- **Localization Needs:** Currency, time zones, language (minimal for English markets)

---

## Product Vision & Phases

### Phase 0: Pre-Launch (Weeks 1-4)
**Goal:** Validate demand, build initial supply

**Key Activities:**
- [ ] Interview 10 ensemble directors (understand booking process, pain points)
- [ ] Interview 10 coaches (understand their admin burden, pricing models)
- [ ] Map current booking flow (how do bookings happen today?)
- [ ] Identify early adopters (who will use an MVP?)
- [ ] Define success metrics for Phase 1

**Deliverables:**
- User research summary document
- Initial coach/ensemble signup list (50+ expressions of interest)
- Competitive analysis (similar platforms in other industries)

---

### Phase 1: MVP Launch (Months 1-3)
**Goal:** Prove core value proposition with minimal viable product

**Core Features:**

#### For Coaches (Supply Side)
1. **Profile Creation**
   - Basic info (name, location, photo, bio)
   - Specialties (genre tags: barbershop, classical, jazz, contemporary a cappella, etc.)
   - Experience level they teach (beginner, intermediate, advanced, elite/competition)
   - Rate structure (hourly, half-day, full-day) with transparency
   - Availability calendar (manual entry initially)
   - Video introduction (optional but recommended)
   - Qualifications/credentials (optional)

2. **Booking Management**
   - View incoming booking requests
   - Accept/decline with custom message
   - Mark dates as unavailable
   - Contact ensembles directly through platform

3. **Profile Analytics** (simple)
   - Profile views
   - Booking request rate

#### For Ensembles (Demand Side)
1. **Coach Discovery**
   - Browse/search coaches by:
     - Location (suburb/city/state)
     - Genre/specialty
     - Experience level
     - Availability (date range)
     - Price range
   - Filter and sort results
   - View detailed coach profiles

2. **Booking Request Flow**
   - Submit booking request with:
     - Proposed date(s)
     - Session type (2hr, half-day, full-day)
     - Group type and size
     - Specific goals/needs
     - Budget expectations
   - Receive confirmation when coach accepts
   - Direct messaging with coach

3. **Review System** (post-session)
   - Rate coach (1-5 stars)
   - Written review (optional)
   - Categories: preparation, communication, teaching effectiveness, value

#### Platform Features
- **User Authentication:** Email/password signup, email verification
- **Messaging System:** In-platform chat (keeps communication on record, reduces "he said/she said")
- **Notifications:** Email alerts for booking requests, acceptances, messages
- **Basic Admin Panel:** Approve coach profiles, monitor activity, handle disputes

**Technical Stack Assumptions:**
- **Frontend:** React/Next.js (SEO-friendly, fast, scalable)
- **Backend:** Node.js/Express or Python/Django
- **Database:** PostgreSQL (relational data, scales well)
- **Hosting:** Vercel/Netlify (frontend) + Railway/Render (backend), or all-in-one like Heroku
- **Authentication:** Auth0 or NextAuth
- **Storage:** AWS S3 or Cloudinary (for photos/videos)
- **Email:** SendGrid or Postmark

**Success Metrics:**
- 20+ active coach profiles
- 50+ ensemble users registered
- 10+ completed bookings
- 80%+ coach acceptance rate on requests
- <48hr average response time on booking requests

**Launch Strategy:**
1. Onboard 10 "founding coaches" (hand-picked, diverse specialties)
2. Seed with 20 ensemble directors from research phase
3. Soft launch to Australian barbershop/choral community via:
   - AAMBS/Sweet Adelines newsletters
   - State choral association email lists
   - Facebook groups (permission-based sharing)
4. Gather feedback intensively (weekly check-ins with early users)

---

### Phase 2: Platform Refinement (Months 4-6)
**Goal:** Reduce friction, increase trust, improve matching

**New Features:**

#### Enhanced Discovery
- **Smart Matching Algorithm:**
  - Based on ensemble's past bookings (if any)
  - Genre compatibility scoring
  - Distance/travel cost estimates
  - "Coaches similar to [X]" recommendations

- **Coach Comparison Tool:**
  - Side-by-side comparison of up to 3 coaches
  - Standardized rate display (normalize to per-hour equivalent)

#### Trust & Safety
- **Verified Badges:**
  - Profile completion badge
  - Reviews/rating thresholds
  - Qualification verification (manual review initially)

- **Cancellation Policy Framework:**
  - Coaches set their own policy (e.g., "7 days notice for refund")
  - Display clearly on profile
  - Platform tracks cancellation rates

- **Dispute Resolution:**
  - Formal process for handling conflicts
  - Platform mediates when needed

#### Booking Improvements
- **Calendar Integration:**
  - Coaches sync Google/Apple calendar
  - Auto-update availability
  - Send calendar invites on confirmation

- **Booking Templates:**
  - Ensembles save common requests ("Contest Prep Package", "Repertoire Refresh")
  - Pre-fill next booking with same coach

#### Analytics & Insights
- **Coach Dashboard:**
  - Conversion rate (views → requests → bookings)
  - Earnings tracker (manual entry, since payment is off-platform)
  - Busiest times/seasons

- **Ensemble Dashboard:**
  - Booking history
  - Favorite coaches
  - Budget spent over time

**Success Metrics:**
- 50+ active coaches
- 200+ ensemble users
- 50+ completed bookings
- 4.5+ average coach rating
- 30% repeat booking rate

---

### Phase 3: Payment & Monetization (Months 7-12)
**Goal:** Introduce revenue model, improve payment reliability

**New Features:**

#### Payment Processing
- **Integrated Payments:**
  - Platform holds payment (escrow) until session completed
  - Auto-release 24hrs after session (or on ensemble confirmation)
  - Dispute window (7 days post-session)

- **Deposit System:**
  - Ensembles pay 25-50% deposit upfront
  - Reduces no-shows and cancellations
  - Coaches get deposit if ensemble cancels within policy window

- **Multiple Payment Methods:**
  - Credit/debit card (Stripe)
  - Bank transfer (for larger bookings)
  - PayPal (international ease)

#### Monetization Model
**Option A: Commission-Based** (Recommended)
- 10-15% commission on bookings
- Free to browse and create profiles
- Only pay when booking happens
- Rationale: Aligns incentives (we succeed when matches succeed)

**Option B: Subscription Tiers**
- Free: Limited bookings per quarter, basic profile
- Coach Pro ($20/month): Unlimited bookings, premium profile features, analytics
- Rationale: Predictable revenue, but may deter emerging coaches

**Option C: Hybrid**
- Free profiles, low commission (5-8%) for first 12 months
- Then small monthly fee ($10) + lower commission (3-5%)
- Rationale: Balances growth with sustainability

**Recommended Approach:** Start with Option A at 12% commission, grandfather early adopters at 8% for loyalty.

#### Financial Features
- **Automatic Invoicing:**
  - Platform generates invoices with ABN (Australia), tax compliance
  - Ensembles receive proper receipts for treasurers
  - Coaches get payment summaries for tax reporting

- **Travel Cost Handling:**
  - Coaches can add travel supplement to rate
  - Transparent breakdown (rate + travel) in booking flow
  - Or: ensembles book travel separately, coach confirms

#### Cancellation Protection
- **Coach Cancellation Insurance:**
  - Platform offers replacement coach if cancellation <7 days out
  - Or: full refund + bonus credit
  - Builds trust that platform has ensemble's back

- **Ensemble Cancellation Policy:**
  - Enforced through deposit system
  - Coaches keep deposit if <7 days notice
  - Sliding scale refunds (e.g., 50% if 7-14 days, 100% if >14 days)

**Success Metrics:**
- 100+ active coaches
- 500+ ensemble users
- $50k+ GMV (Gross Merchandise Value)
- <2% payment disputes
- 50%+ repeat booking rate

---

### Phase 4: Scale & Expansion (Months 13-24)
**Goal:** Expand geographically, add power features, build community

**Geographic Expansion:**
1. **New Zealand** (Month 13-15)
   - Similar culture, smaller market for testing
   - Currency support (NZD)
2. **United Kingdom** (Month 16-18)
   - Large choral/barbershop market
   - Currency support (GBP)
3. **North America** (Month 19-24)
   - Largest market, most competitive
   - Currency support (USD, CAD)

**New Features:**

#### Advanced Matching
- **AI-Powered Recommendations:**
  - "Coaches we think you'll love" based on collaborative filtering
  - "Ensembles that book coaches like you"

- **Group Coaching:**
  - Multiple ensembles split cost for workshop/masterclass
  - Coaches can list group session availability

#### Community Features
- **Forum/Knowledge Base:**
  - Coaches share tips, ensembles ask questions
  - Builds engagement between bookings
  - SEO benefit (content marketing)

- **Coach Spotlight Series:**
  - Platform highlights coach stories
  - Increases coach visibility, humanizes marketplace

- **Ensemble Success Stories:**
  - Testimonials from groups who improved
  - Social proof for new users

#### Business Features
- **Team Accounts:**
  - Multiple admins for large choruses
  - Separate billing/scheduling roles

- **Recurring Bookings:**
  - Ensembles can book coach for regular sessions
  - Auto-invoicing and calendar entries

- **Gift Cards/Credits:**
  - Ensembles can buy coaching credits in advance (cashflow for platform)
  - Gifts for other ensembles

#### Platform Health
- **Fraud Detection:**
  - Flag suspicious patterns (review manipulation, payment issues)
  - Automated alerts for manual review

- **Quality Scores:**
  - Coaches ranked by response time, booking completion, ratings
  - Higher scores = better placement in search

**Success Metrics:**
- 500+ active coaches globally
- 5,000+ ensemble users
- $500k+ annual GMV
- Active in 4+ countries
- 70%+ retention rate (ensembles book again within 6 months)

---

## Technical Architecture

### High-Level System Design

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  Web Frontend   │────────▶│   API Gateway    │────────▶│   Database      │
│  (React/Next)   │         │   (REST/GraphQL) │         │   (PostgreSQL)  │
│                 │         │                  │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                     │
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
            ┌──────────────┐ ┌──────────────┐ ┌─────────────┐
            │   Auth       │ │  Messaging   │ │  Payment    │
            │   Service    │ │  Service     │ │  Service    │
            │  (Auth0)     │ │  (WebSocket) │ │  (Stripe)   │
            └──────────────┘ └──────────────┘ └─────────────┘
                    │                │                │
                    ▼                ▼                ▼
            ┌──────────────┐ ┌──────────────┐ ┌─────────────┐
            │   Email      │ │  Storage     │ │  Analytics  │
            │   (SendGrid) │ │  (S3/Cloud.) │ │  (Mixpanel) │
            └──────────────┘ └──────────────┘ └─────────────┘
```

### Data Model (Core Entities)

#### Users
```
User {
  id: UUID
  email: string (unique)
  password_hash: string
  user_type: enum (coach, ensemble, admin)
  created_at: timestamp
  email_verified: boolean
  profile_id: UUID (foreign key)
}
```

#### Coach Profiles
```
CoachProfile {
  id: UUID
  user_id: UUID (foreign key)
  full_name: string
  location: {city, state, country}
  bio: text
  photo_url: string
  video_url: string (optional)
  specialties: array<string> (tags)
  experience_levels: array<enum>
  rate_structure: {
    hourly: decimal,
    half_day: decimal,
    full_day: decimal,
    currency: string
  }
  availability_calendar: jsonb (or separate table)
  rating: decimal (computed)
  total_bookings: integer (computed)
  verified: boolean
  cancellation_policy: text
  travel_supplement: decimal (optional)
}
```

#### Ensemble Profiles
```
EnsembleProfile {
  id: UUID
  user_id: UUID (foreign key)
  ensemble_name: string
  ensemble_type: enum (chorus, quartet, etc.)
  size: integer
  location: {city, state, country}
  genres: array<string>
  experience_level: enum
}
```

#### Bookings
```
Booking {
  id: UUID
  ensemble_id: UUID (foreign key)
  coach_id: UUID (foreign key)
  status: enum (pending, accepted, declined, completed, cancelled)
  proposed_dates: array<date>
  confirmed_date: date
  session_type: enum (hourly, half_day, full_day)
  duration_hours: decimal
  rate: decimal
  travel_cost: decimal (optional)
  total_cost: decimal (computed)
  goals: text (ensemble's session goals)
  special_requests: text
  created_at: timestamp
  updated_at: timestamp
  completed_at: timestamp
  cancellation_reason: text (optional)
  cancelled_by: enum (coach, ensemble, admin)
}
```

#### Reviews
```
Review {
  id: UUID
  booking_id: UUID (foreign key)
  reviewer_id: UUID (ensemble)
  reviewee_id: UUID (coach)
  rating: integer (1-5)
  review_text: text (optional)
  categories: {
    preparation: integer (1-5),
    communication: integer (1-5),
    teaching_effectiveness: integer (1-5),
    value: integer (1-5)
  }
  created_at: timestamp
  verified_booking: boolean (must have completed booking)
}
```

#### Messages
```
Message {
  id: UUID
  booking_id: UUID (foreign key, optional - can message before booking)
  sender_id: UUID
  recipient_id: UUID
  content: text
  read: boolean
  created_at: timestamp
}
```

### API Endpoints (Key Routes)

#### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/verify-email` - Verify email token
- `POST /api/auth/reset-password` - Password reset request

#### Coaches
- `GET /api/coaches` - Search/browse coaches (public)
- `GET /api/coaches/:id` - Get coach profile (public)
- `POST /api/coaches` - Create coach profile (authenticated)
- `PUT /api/coaches/:id` - Update coach profile (authenticated, own profile)
- `GET /api/coaches/:id/availability` - Get availability calendar
- `PUT /api/coaches/:id/availability` - Update availability

#### Ensembles
- `POST /api/ensembles` - Create ensemble profile
- `PUT /api/ensembles/:id` - Update ensemble profile
- `GET /api/ensembles/:id/bookings` - Get ensemble's booking history

#### Bookings
- `POST /api/bookings` - Create booking request (ensemble)
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/accept` - Accept booking (coach)
- `PUT /api/bookings/:id/decline` - Decline booking (coach)
- `PUT /api/bookings/:id/cancel` - Cancel booking (either party)
- `PUT /api/bookings/:id/complete` - Mark completed (coach)
- `GET /api/bookings` - List user's bookings (filtered by status)

#### Reviews
- `POST /api/reviews` - Submit review (ensemble, post-booking)
- `GET /api/coaches/:id/reviews` - Get coach's reviews (public)

#### Messages
- `POST /api/messages` - Send message
- `GET /api/messages` - Get conversation threads
- `GET /api/messages/:booking_id` - Get messages for booking
- `PUT /api/messages/:id/read` - Mark message as read

#### Admin
- `GET /api/admin/coaches/pending` - Get coaches awaiting approval
- `PUT /api/admin/coaches/:id/approve` - Approve coach profile
- `GET /api/admin/stats` - Platform metrics dashboard

---

## Implementation Roadmap

### Phase 1 To-Do List (Months 1-3)

#### Week 1-2: Project Setup & Design
- [ ] Set up Git repository and project structure
- [ ] Choose and configure tech stack (Next.js + Node/Python backend)
- [ ] Design database schema (PostgreSQL)
- [ ] Create wireframes for key pages:
  - [ ] Landing page
  - [ ] Coach profile page
  - [ ] Coach search/browse page
  - [ ] Booking request flow
  - [ ] Dashboard (coach and ensemble views)
- [ ] Design system / UI component library (consider shadcn/ui or MUI)
- [ ] Set up development environment (local DB, API, frontend)

#### Week 3-4: Core Backend Development
- [ ] Implement user authentication (Auth0 or custom with JWT)
- [ ] Build user registration/login flows
- [ ] Create API endpoints for:
  - [ ] User management (CRUD)
  - [ ] Coach profiles (CRUD)
  - [ ] Ensemble profiles (CRUD)
- [ ] Set up database migrations
- [ ] Implement basic API validation and error handling
- [ ] Set up email service (SendGrid) for transactional emails

#### Week 5-6: Coach Features
- [ ] Build coach profile creation form (multi-step)
- [ ] Implement photo/video upload (S3 or Cloudinary)
- [ ] Create availability calendar UI (consider react-big-calendar)
- [ ] Build coach dashboard:
  - [ ] View profile stats
  - [ ] Manage availability
  - [ ] View booking requests
- [ ] Implement coach search/filter API endpoint
- [ ] Create coach listing page with filters

#### Week 7-8: Booking Flow
- [ ] Build booking request form
- [ ] Create booking management API endpoints
- [ ] Implement booking request notification emails
- [ ] Build coach's booking request review UI
- [ ] Create booking accept/decline flow
- [ ] Build booking confirmation emails
- [ ] Implement in-platform messaging (basic)
  - [ ] Message API endpoints
  - [ ] Chat UI component
  - [ ] Real-time updates (WebSocket or polling)

#### Week 9-10: Ensemble Features & Reviews
- [ ] Build ensemble profile creation
- [ ] Create ensemble dashboard:
  - [ ] Browse coaches
  - [ ] Manage bookings
  - [ ] View booking history
- [ ] Implement review system:
  - [ ] Review submission form (post-booking)
  - [ ] Review display on coach profiles
  - [ ] Rating aggregation logic
- [ ] Build review moderation (admin can hide/remove)

#### Week 11-12: Testing, Polish & Launch
- [ ] End-to-end testing of critical flows
- [ ] User acceptance testing with beta users
- [ ] Bug fixes and polish
- [ ] Write documentation:
  - [ ] User guides (how to create profile, book coach, etc.)
  - [ ] FAQ page
  - [ ] Terms of Service
  - [ ] Privacy Policy
- [ ] Set up analytics (Mixpanel or Google Analytics)
- [ ] Deploy to production (set up CI/CD)
- [ ] Onboard founding coaches (10-15)
- [ ] Soft launch to early ensemble users
- [ ] Monitor and gather feedback intensively

---

### Phase 2 To-Do List (Months 4-6)

#### Month 4: Smart Matching & Discovery
- [ ] Implement smart matching algorithm:
  - [ ] Collaborative filtering based on booking history
  - [ ] Genre compatibility scoring
  - [ ] Distance/travel cost integration (Google Maps API)
- [ ] Build "recommended coaches" feature on ensemble dashboard
- [ ] Create coach comparison tool (side-by-side)
- [ ] Implement "coaches similar to this one" suggestions
- [ ] Add advanced search filters (rating, distance radius, price range)

#### Month 5: Trust & Calendar Integration
- [ ] Build verification badge system:
  - [ ] Profile completion badge
  - [ ] Review threshold badges
  - [ ] Manual credential verification (admin tool)
- [ ] Implement cancellation policy framework:
  - [ ] Coaches set policy in profile
  - [ ] Display prominently in booking flow
  - [ ] Track cancellation rates
- [ ] Calendar integration:
  - [ ] Google Calendar sync (OAuth)
  - [ ] Apple Calendar support
  - [ ] Auto-update availability
  - [ ] Send calendar invites on booking confirmation
- [ ] Build dispute resolution workflow:
  - [ ] Dispute submission form
  - [ ] Admin review interface
  - [ ] Resolution messaging

#### Month 6: Analytics & Templates
- [ ] Enhanced coach dashboard analytics:
  - [ ] Conversion funnel (views → requests → bookings)
  - [ ] Earnings tracker (manual entry)
  - [ ] Busiest times/seasonal trends
- [ ] Enhanced ensemble dashboard:
  - [ ] Booking history timeline
  - [ ] Favorite coaches feature
  - [ ] Budget tracking
- [ ] Booking templates:
  - [ ] Ensembles save common request types
  - [ ] Pre-fill booking form from template
- [ ] A/B test coach profile layouts for conversion
- [ ] User feedback collection (NPS survey)

---

### Phase 3 To-Do List (Months 7-12)

#### Month 7-8: Payment Integration
- [ ] Integrate Stripe (or PayPal) for payments
- [ ] Build escrow/hold system:
  - [ ] Payment held until session complete
  - [ ] Auto-release or manual confirmation
  - [ ] Dispute window logic
- [ ] Implement deposit system (25-50% upfront)
- [ ] Create payment flow UI:
  - [ ] Ensemble pays during booking
  - [ ] Coach sees pending/released payments
- [ ] Build invoice generation:
  - [ ] Auto-generate PDF invoices
  - [ ] Include ABN, tax details
  - [ ] Email to ensemble treasurer
- [ ] Payment dashboard for coaches:
  - [ ] View earnings
  - [ ] Payment history
  - [ ] Tax summary reports

#### Month 9: Monetization Model Launch
- [ ] Implement commission calculation (12% recommended)
- [ ] Build billing system:
  - [ ] Deduct commission on booking completion
  - [ ] Monthly payouts to coaches
- [ ] Grandfather early adopters (reduced commission)
- [ ] Update Terms of Service for payment terms
- [ ] Communicate pricing changes to users (30 day notice)
- [ ] Monitor revenue and adjust as needed

#### Month 10-11: Cancellation Protection
- [ ] Implement cancellation policy enforcement:
  - [ ] Deposit retained based on notice period
  - [ ] Automated refund calculation
  - [ ] Dispute handling for edge cases
- [ ] Build replacement coach feature:
  - [ ] Platform suggests alternatives if coach cancels
  - [ ] Bonus credit for affected ensembles
- [ ] Create cancellation insurance option (optional paid add-on)
- [ ] Track cancellation metrics and trends

#### Month 12: Financial Features & Optimization
- [ ] Travel cost handling:
  - [ ] Transparent breakdown in booking flow
  - [ ] Optional travel supplement field
- [ ] Multiple payment methods:
  - [ ] Bank transfer for large bookings
  - [ ] PayPal option
- [ ] Payment reminders and follow-ups (automated)
- [ ] Financial reporting for tax season (coach tools)
- [ ] Optimize payment success rates (reduce failures)
- [ ] Prepare for Phase 4 expansion (multi-currency support)

---

### Phase 4 To-Do List (Months 13-24)

#### Month 13-15: New Zealand Expansion
- [ ] Add NZD currency support
- [ ] Localize content (minimal for NZ)
- [ ] Partner with NZ choral organizations for launch
- [ ] Onboard 20+ NZ coaches
- [ ] Marketing campaign in NZ market
- [ ] Monitor NZ-specific metrics

#### Month 16-18: UK Expansion
- [ ] Add GBP currency support
- [ ] Localize content (UK English spellings, terms)
- [ ] Research UK choral/barbershop scene
- [ ] Partner with UK organizations (BABS, etc.)
- [ ] Onboard 50+ UK coaches
- [ ] Adapt payment flows for UK banking (Bacs, etc.)

#### Month 19-21: North America Expansion
- [ ] Add USD and CAD currency support
- [ ] Major marketing push (largest market)
- [ ] Competitive analysis (existing platforms in NA)
- [ ] Partner with BHS, Sweet Adelines, Harmony Inc
- [ ] Onboard 100+ North American coaches
- [ ] Localize for US/Canada regional differences

#### Month 22-24: Advanced Features & Community
- [ ] Build AI-powered recommendation engine (ML model)
- [ ] Launch group coaching feature:
  - [ ] Multiple ensembles share cost
  - [ ] Workshop/masterclass format
- [ ] Create forum/knowledge base:
  - [ ] Coach tips and articles
  - [ ] Ensemble Q&A
  - [ ] SEO-optimized content
- [ ] Launch coach spotlight series (content marketing)
- [ ] Build team accounts for large organizations
- [ ] Implement recurring booking feature
- [ ] Create gift card/credit system
- [ ] Fraud detection and quality scoring
- [ ] Platform health dashboard (internal)

---

## Go-To-Market Strategy

### Phase 1: Organic Community Launch

**Target:** Australian barbershop and choral communities

**Channels:**
1. **Direct Outreach:**
   - Email choral directors from AAMBS, Sweet Adelines, state choral associations
   - Personal invitations to trusted coaches (hand-picked founding members)

2. **Community Partnerships:**
   - Guest posts in AAMBS newsletters
   - Presentation at state choral conventions (if possible)
   - Sponsor small choral events for visibility

3. **Social Media:**
   - Join Facebook groups (e.g., "Australian Barbershoppers", "Choral Directors Australia")
   - Share value-first content (not just "use our platform")
   - Engage genuinely, build relationships before promoting

4. **Content Marketing:**
   - Blog posts on "How to Choose a Coach" (SEO + helpful)
   - Interviews with founding coaches (humanize platform)
   - Tips for ensembles on rehearsal efficiency

**Messaging:**
- "Stop wasting time on email tennis—find your perfect coach in minutes"
- "Coaches: spend less time on admin, more time doing what you love"
- "Built by singers, for singers" (if applicable)

### Phase 2-3: Paid Acquisition & PR

**Channels:**
1. **Google Ads:** Target searches like "choral coach Australia", "barbershop coaching"
2. **Facebook/Instagram Ads:** Retargeting, lookalike audiences
3. **PR:** Pitch stories to choral publications, local news (human interest)
4. **Referral Program:** Ensembles and coaches get credit for inviting others

### Phase 4: International Expansion

**Channels:**
1. **Localized Partnerships:** Work with national choral organizations in each country
2. **Influencer Marketing:** Well-known coaches endorse platform
3. **International Conferences:** Sponsor or present at major choral events

---

## Risk Assessment & Mitigation

### Critical Risks

#### 1. Chicken-and-Egg Problem (Marketplace Cold Start)
**Risk:** Not enough coaches → ensembles don't join. Not enough ensembles → coaches don't join.

**Mitigation:**
- Solve supply side first (easier to recruit 20 coaches than 200 ensembles)
- Hand-pick diverse, credible founding coaches
- Offer founding member perks (lower commission forever, featured profiles)
- Use coaches' existing networks to bring in their current clients
- Build demand through content marketing while onboarding supply

#### 2. Low Booking Volume
**Risk:** Users sign up but don't book (discovery works, conversion doesn't).

**Mitigation:**
- Obsess over booking friction—every extra field is a conversion killer
- A/B test booking flow relentlessly
- Follow up with users who browse but don't book (email, survey)
- Offer first-booking incentives (discount code, bonus)
- Track conversion funnel metrics daily

#### 3. Payment Disputes & Trust Issues
**Risk:** Coaches and ensembles fight over cancellations, no-shows, quality issues.

**Mitigation:**
- Crystal-clear cancellation policies (set by coach, enforced by platform)
- Escrow system protects both sides
- Robust review system surfaces bad actors
- Platform mediates disputes proactively
- Insurance/guarantee fund for worst cases (Phase 3+)

#### 4. Quality Control (Bad Coaches)
**Risk:** Low-quality coaches hurt platform reputation, drive ensembles away.

**Mitigation:**
- Manual approval of first coach profiles (Phase 1)
- Verification badges for credentials (Phase 2)
- Review system flags consistently poor performers
- Platform can suspend/remove coaches with <3.5 star average
- Continuous quality monitoring (admin dashboard)

#### 5. Competitive Threats
**Risk:** Larger platform (e.g., Thumbtack, Bark) adds coaching category and crushes us.

**Mitigation:**
- Move fast in niche (own "ensemble coaching" category)
- Build deep domain expertise (they can't fake understanding the market)
- Lock in supply (exclusive relationships with top coaches)
- Community moat (forum, content, relationships)
- Vertical integration (we can add features they can't justify for small segment)

#### 6. Regulatory/Legal Issues
**Risk:** Payment regulations, tax compliance, liability for bookings gone wrong.

**Mitigation:**
- Consult lawyer on Terms of Service, Privacy Policy (before launch)
- Use established payment processor (Stripe handles compliance)
- Platform is facilitator, not employer (coaches are independent contractors)
- Require coaches to have insurance (liability, professional indemnity)
- Clear disclaimers (platform not responsible for session quality)

---

## Key Metrics & KPIs

### North Star Metric
**Completed Bookings Per Month** — the ultimate measure of marketplace health

### Leading Indicators (Phase 1)
- Active coaches (posted profile, available dates set)
- Ensemble signups
- Coach profile views
- Booking requests submitted
- Booking acceptance rate
- Time to first booking (ensemble)
- Time to first accepted booking (coach)

### Engagement Metrics (Phase 2+)
- Repeat booking rate (%)
- Average bookings per ensemble per year
- Average bookings per coach per month
- Coach utilization rate (% of available dates filled)
- Ensemble retention (% still active after 6 months)

### Financial Metrics (Phase 3+)
- GMV (Gross Merchandise Value)
- Take rate (platform commission %)
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- LTV/CAC ratio (aim for 3:1 or better)
- Monthly Recurring Revenue (if subscription model)

### Quality Metrics
- Average coach rating (aim for 4.5+)
- Review submission rate (% of bookings reviewed)
- Dispute rate (% of bookings with disputes)
- Cancellation rate (by coach, by ensemble)
- Response time to booking requests (aim for <24hrs)

### Growth Metrics (Phase 4)
- Month-over-month growth rate (bookings, users, GMV)
- Geographic distribution (bookings per country)
- Market penetration (% of known coaches/ensembles using platform)

---

## Success Criteria

### Phase 1 Success
- ✅ 20+ active coach profiles
- ✅ 50+ ensemble users registered
- ✅ 10+ completed bookings
- ✅ 4+ star average rating
- ✅ <2 unresolved disputes

### Phase 2 Success
- ✅ 50+ active coaches
- ✅ 200+ ensemble users
- ✅ 50+ completed bookings
- ✅ 30%+ repeat booking rate
- ✅ Positive unit economics (if monetization started)

### Phase 3 Success
- ✅ 100+ active coaches
- ✅ 500+ ensemble users
- ✅ $50k+ GMV
- ✅ 50%+ repeat booking rate
- ✅ Break-even or profitable

### Phase 4 Success
- ✅ 500+ active coaches globally
- ✅ 5,000+ ensemble users
- ✅ $500k+ annual GMV
- ✅ Active in 4+ countries
- ✅ 70%+ retention rate

---

## Team & Resources

### Phase 1 Minimum Team
- **Product/Founder:** You (vision, user research, launch, growth)
- **Full-Stack Developer:** 1 person (can be you or hire) for MVP build
- **Designer:** Freelance or contract (UI/UX for key flows)

**Budget Estimate (Phase 1):**
- Developer: $0-15k (if you build) or $30-50k (if hired)
- Designer: $3-5k (freelance)
- Infrastructure: $100-300/month (hosting, DB, email service)
- Total: $3-55k depending on build approach

### Phase 2-3 Team Expansion
- Full-time developer (if not already)
- Part-time/contract marketing (content, social, ads)
- Customer success/community manager (high-touch support)

### Phase 4 Team (Scaling)
- Engineering team (2-3 developers)
- Marketing lead
- Operations/community manager
- Customer support (could be part-time initially)

---

## Assumptions & Open Questions

### Key Assumptions
1. **Coaches want more bookings** and are willing to try a new platform
2. **Ensembles struggle to find coaches** and will use discovery tool
3. **Payment friction is real** and worth solving (validate in Phase 0)
4. **Market size is sufficient** in Australia (tens of thousands of ensemble members)
5. **Trust can be built quickly** via reviews and transparency

### Open Questions to Resolve
1. What percentage of ensembles currently use paid coaches? (vs. volunteer/free)
2. What's the average booking price? (impacts GMV potential)
3. How often do ensembles typically book coaches? (monthly, quarterly, annually?)
4. What's the no-show/cancellation rate currently? (how big is reliability problem?)
5. Are coaches currently full or do they have capacity? (supply constraint?)
6. Do ensembles have booking budgets, or is it ad-hoc? (predictability of demand)
7. What % of bookings are local vs. require travel? (impacts matching algorithm)

**Action:** Answer these in Phase 0 user research interviews!

---

## Appendix: Competitive Analysis

### Direct Competitors (Coaching Marketplaces)
**None identified specifically for ensemble/choral coaching** — this is a greenfield opportunity! General coaching platforms (life coaching, business coaching) exist but don't serve this niche.

### Indirect Competitors

#### 1. General Service Marketplaces
- **Thumbtack, Bark, Airtasker:** "Find a pro for anything"
  - Pros: Established, trusted, large user base
  - Cons: Not specialized, coaches get lost in noise, no domain features
  - Differentiation: We own the niche, purpose-built tools

#### 2. Word-of-Mouth / Informal Networks
- **Facebook groups, personal networks, choral association directories**
  - Pros: Free, trusted referrals
  - Cons: Slow, limited reach, no booking/payment tools, no reviews
  - Differentiation: Speed, transparency, convenience, reliability

#### 3. Direct Coach Websites
- **Coaches market themselves individually**
  - Pros: Full control, no commission
  - Cons: Discovery problem, each coach reinvents wheel, no trust signals for new clients
  - Differentiation: We bring clients to them, handle admin, build credibility

### Why We Can Win
1. **Niche Focus:** Deep understanding of ensemble coaching needs
2. **Two-Sided Value:** Solve problems for both sides simultaneously
3. **Network Effects:** More coaches → more ensembles → more coaches (flywheel)
4. **First-Mover Advantage:** No one owns this space yet
5. **Community:** We're part of the community, not outsiders

---

## Next Steps (Immediate Actions)

### This Week
- [ ] Recruit 5 ensemble directors for user interviews
- [ ] Recruit 5 coaches for user interviews
- [ ] Set up interview schedule and question guide
- [ ] Create simple landing page to collect early interest ("Coming Soon - Join Waitlist")

### Next 2 Weeks
- [ ] Complete 10 user interviews
- [ ] Synthesize findings into user research doc
- [ ] Validate key assumptions (pain points, willingness to use platform)
- [ ] Decide: Build MVP yourself or hire developer?
- [ ] If hiring: Post job listing, start interviewing candidates
- [ ] If building: Set up development environment and start Week 1-2 tasks

### Next Month
- [ ] Finalize MVP feature set based on research
- [ ] Begin development (or onboard developer)
- [ ] Design key user flows (wireframes/mockups)
- [ ] Set up project management (GitHub Projects, Linear, or Trello)
- [ ] Weekly check-ins with potential early users to stay aligned

---

## Conclusion

This marketplace has strong potential to solve real, painful problems for both coaches and ensembles. The key to success is:

1. **Start small and focused** (Australia, barbershop/choral, MVP features)
2. **Solve the cold start problem** by recruiting supply (coaches) first
3. **Obsess over user experience** (reduce friction at every step)
4. **Build trust early** (transparency, reviews, responsive support)
5. **Iterate based on data** (track metrics, talk to users constantly)
6. **Scale thoughtfully** (prove unit economics before expanding geographically)

The roadmap above is ambitious but achievable with disciplined execution. Adjust phases and timelines based on actual user traction and feedback—plans are useful, but flexibility is essential.

**Most important:** Get out there and talk to users. This document is a hypothesis; your conversations with coaches and ensembles will reveal the truth. Good luck! 🎵

---

**Document Version:** 1.0  
**Last Updated:** February 6, 2026  
**Owner:** [Your Name]  
**Status:** Draft for Review
