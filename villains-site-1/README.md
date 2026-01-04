# Volunteer Fundraising Dashboard

A Next.js fundraising dashboard for Ukrainian volunteer organizations.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Hosting**: Vercel
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Magic Link + Email/Password)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Language**: TypeScript
- **Package Manager**: npm

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file with:
```
NEXT_PUBLIC_SUPABASE_URL=https://oxhllxkvklxkxvdtpebd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_X3qkbag4sU8Pna_7wzFmzA_Mj8Zj0Rr
SUPABASE_SERVICE_ROLE_KEY=sb_secret_6gMgd1WYNFfp26sXhQ2Eqw_gOwxsLH-
```

**Note**: The `NEXT_PUBLIC_` prefix is required for client-side access. The `SUPABASE_SERVICE_ROLE_KEY` should only be used server-side and is currently not used in this implementation (all operations use the anon key with RLS).

3. Build the application:
```bash
npm run build
```

4. Start the production server:
```bash
npm start
```

The server will run on `http://localhost:3001`

**For Development:**
```bash
npm run dev
```

## Server Configuration

This project is configured to run from the base path `/Troublemakers/villains-site-1` and is set up to work with a Cloudflare tunnel.

**Cloudflare Tunnel Setup:**
The tunnel configuration in `/Users/anton/Documents/GitHub/custom-server/config.yml` routes:
- `/Troublemakers/villains-site-1/*` → `http://localhost:3001`

Make sure the Next.js server is running on port 3001 before accessing:
`https://code.anton-atom.com/Troublemakers/villains-site-1/`

## Features

### Public Pages
- `/` - Landing page
- `/login` - Authentication (Magic Link + Email/Password)

### User Dashboard
- `/dashboard` - View personal donations and campaigns
- `/dashboard/campaigns/[id]` - Campaign details with progress and goals

### Admin Pages
- `/admin` - Admin overview
- `/admin/campaigns` - Manage campaigns
- `/admin/donations` - Manage donations

## Architecture

- **Server Components** by default
- **Server Actions** for mutations
- **Row Level Security (RLS)** enforced
- **Supabase Auth** for authentication
- **No custom auth logic**

## Security

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- All database access goes through Supabase
- RLS policies enforce data access rules
- Admin users determined by `profiles.role = 'admin'`

## Database Schema

The project uses the following Supabase tables:
- `profiles` - User profiles
- `campaigns` - Fundraising campaigns
- `campaign_members` - Campaign membership
- `donations` - Donation records
- `goals` - Campaign goals

Views:
- `user_total_donations` - User donation totals
- `campaign_progress` - Campaign progress tracking
