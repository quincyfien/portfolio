# Portfolio — NDICHIA QUINCY FIEN

Systems Engineer → Aspiring Cloud Security Engineer. Built entirely from scratch with no UI framework dependencies.

**Positioning:** I design the system, write the documentation that builds it, and secure every layer — so an AI or any developer can implement without worrying about anything but implementation-level details.

**Live sections:** Hero with particle animation · About · How I Work (3 pillars) · Skills · Services · Projects (filterable, modal detail views) · Professional Journey (timeline) · Certifications · Technical Documents (upload/download) · Contact form

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build | Vite 8 |
| Icons | Lucide React |
| Styling | Hand-rolled CSS with design tokens, light/dark themes |
| Linting | Oxlint |
| Backend | Supabase (Postgres + Auth + Storage) |
| Email | Netlify Function + Nodemailer |

## Getting Started

```bash
npm install
npm run dev        # development server
npm run build      # production build
npm run preview    # preview production build
npm run lint       # lint
```

## Supabase setup (content backend)

The site is a static React app whose content lives in Supabase. Without Supabase, it falls back to the bundled default content (editable locally, stored in your browser only).

1. Create a free project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in the SQL editor (creates tables + row-level security + storage bucket).
3. Seed your existing content (optional, one-time):
   ```bash
   SUPABASE_URL="https://YOUR-PROJECT.supabase.co" \
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
   node supabase/seed.mjs
   ```
4. Create your admin user: Dashboard → Authentication → Users → **Add user** (email + password).
5. Configure env vars (see below).

### Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | `.env.local` (dev) + Netlify | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `.env.local` (dev) + Netlify | Supabase anon/public key |
| `VITE_ADMIN_PATH` | `.env.local` (dev) + Netlify | Hidden admin route (default `nq-admin-x7k3`) |
| `SUPABASE_SERVICE_ROLE_KEY` | seed script only | Bypasses RLS for seeding — never expose in the browser |

See `.env.example`.

## Admin access

There is **no public admin button**. Log in by visiting:

```
https://your-site.netlify.app/#nq-admin-x7k3
```

(The path is set by `VITE_ADMIN_PATH`; default `nq-admin-x7k3`. Set your own secret value in Netlify and `.env.local`.) That opens the email/password sign-in. Only the admin user you created in Supabase can write; public visitors can only read.

## Deployment (Netlify)

The contact form runs as a Netlify serverless function. Required Netlify env vars:

- `MY_EMAIL` — your Gmail address
- `GMAIL_APP_PASSWORD` — a Gmail app password (16 chars)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Project Structure

```
src/
├── main.jsx                 # Entry point with ErrorBoundary
├── App.jsx                  # Root component (sections, IntersectionObserver, #admin route)
├── index.css                # Design tokens, base styles, shared utilities
├── components/
│   ├── Navbar.jsx/.css      # Sticky glass navbar, theme toggle, mobile menu
│   ├── Hero.jsx/.css        # Canvas particle animation, portrait, CTA buttons
│   ├── About.jsx/.css       # Portrait + bio + education
│   ├── HowIWork.jsx/.css    # Three-pillar methodology
│   ├── Skills.jsx/.css      # Domain cards + category chips
│   ├── Services.jsx/.css    # Service offerings
│   ├── Projects.jsx/.css    # Filterable grid + detail modal
│   ├── Journey.jsx/.css     # Timeline
│   ├── Certifications.jsx   # Credentials with status (Earned/In Progress/Planned)
│   ├── Blog.jsx/.css        # Documents list + modal with View/Download
│   ├── Contact.jsx/.css     # Contact form + info card
│   ├── Footer.jsx/.css      # Site footer
│   ├── Admin/               # Admin dashboard, login modal, toast
│   └── SocialIcons.jsx      # Custom SVG icons
├── context/DataContext.jsx  # Supabase-backed data + auth context
├── lib/supabase.js          # Supabase client
├── data/                    # Default/seed content
├── content/blog/            # Legacy markdown posts (seed source)
└── utils/markdown.jsx       # Markdown parser
supabase/
├── schema.sql               # Tables, RLS, storage bucket
└── seed.mjs                 # One-time content seed
```

## Features

- **Fully editable content** — profile, journey, how-I-work, skills, services, projects, certifications, and documents are all managed from the admin dashboard and persisted to Supabase.
- **Document upload/download** — upload PDFs (or other files) from the admin; visitors open a description modal and download/view the file.
- **Light/Dark theme** — persisted with full design token swap.
- **Canvas particle animation** — mouse-interactive, theme-aware.
- **Accessible** — ARIA roles/labels, semantic HTML, keyboard navigation, screen reader support.
- **Responsive** — 10+ breakpoints from 480px to 1100px.
- **No UI library** — every pixel hand-crafted with CSS custom properties.

## Linting

```bash
npm run lint
```
