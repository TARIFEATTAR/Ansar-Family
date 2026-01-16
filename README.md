# Ansar Family Platform

> Every Heart Anchored — The infrastructure layer for supporting New Muslims and those returning to Islam.

## MVP Features

- **Landing Page** (`/`) — Three clear paths: Join, Volunteer, Partner
- **Seeker Intake Form** (`/join`) — 5-step form for New Muslims and those reconnecting
- **Admin Dashboard** (`/admin`) — View and triage disconnected seekers
- **Convex Backend** — Real-time database for intake submissions

## Quick Start

### 1. Install Dependencies

```bash
cd ansar-platform
npm install
```

### 2. Set Up Convex

Run the Convex development server (you'll need to create a Convex account):

```bash
npx convex dev
```

This will:
- Prompt you to log in or create a Convex account
- Create a new Convex project
- Generate your `NEXT_PUBLIC_CONVEX_URL`
- Deploy your schema and functions

### 3. Start Development Server

```bash
npm run dev
```

Visit:
- **Landing**: http://localhost:3000
- **Join Form**: http://localhost:3000/join
- **Admin**: http://localhost:3000/admin (password: `ansarfamily2026`)

## Deploy to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial MVP"
git push origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variable:
   - `NEXT_PUBLIC_CONVEX_URL` — Your Convex deployment URL

### 3. Deploy Convex to Production

```bash
npx convex deploy
```

## Project Structure

```
ansar-platform/
├── convex/                 # Convex backend
│   ├── schema.ts           # Database schema
│   ├── intakes.ts          # Intake mutations/queries
│   └── _generated/         # Auto-generated types
├── src/
│   ├── app/
│   │   ├── page.tsx        # Landing page
│   │   ├── join/page.tsx   # Seeker intake form
│   │   ├── admin/page.tsx  # Admin dashboard
│   │   ├── layout.tsx      # Root layout
│   │   └── globals.css     # Design tokens
│   └── components/
│       └── providers/      # Convex provider
└── package.json
```

## Design System

- **Colors**: Alabaster, Charcoal, Gold, Industrial
- **Typography**: EB Garamond (editorial), JetBrains Mono (system)
- **Philosophy**: Quiet luxury meets warm hospitality

## Terminology

| Term | Meaning |
|------|---------|
| Seeker | New Muslim or someone returning to Islam |
| Ansar | Volunteer companion who supports a Seeker |
| Disconnected | A Seeker not yet assigned to a community |
| Partner | A community organization (masjid, MSA, etc.) |

## Admin Access

- **URL**: `/admin`
- **Password**: `ansarfamily2026` (change in production!)

## Next Steps (Post-MVP)

1. [ ] Add Clerk authentication
2. [ ] Build Ansar volunteer form
3. [ ] Build Partner application form
4. [ ] Create Partner dashboard
5. [ ] Add email/SMS notifications
6. [ ] Implement pairing system

---

Built with ❤️ for the Ummah
