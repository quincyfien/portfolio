# Portfolio — NDICHIA QUINCY FIEN

Professional portfolio showcasing projects in cybersecurity, software development, and technical writing. Built entirely from scratch with no UI framework dependencies.

**Live sections:** Hero with particle animation · About · Skills (ARIA tabbed) · Services · Projects (filterable, modal detail views) · Professional Journey (timeline) · Technical Blog (custom markdown parser) · Contact form

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build | Vite 8 |
| Icons | Lucide React |
| Styling | Hand-rolled CSS with design tokens, light/dark themes |
| Linting | Oxlint |
| Blog | Custom markdown parser with YAML frontmatter |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── main.jsx              # Entry point with ErrorBoundary
├── App.jsx               # Root component (IntersectionObserver, scroll navigation)
├── index.css             # Design tokens, base styles, shared utilities
├── components/
│   ├── Navbar.jsx/.css   # Sticky glass navbar, theme toggle, mobile menu
│   ├── Hero.jsx/.css     # Canvas particle animation, portrait, CTA buttons
│   ├── About.jsx/.css    # 3-column bio, stats, academic timeline
│   ├── Skills.jsx/.css   # ARIA-compliant tabbed skill cards
│   ├── Services.jsx/.css # Service offerings
│   ├── Projects.jsx/.css # Filterable grid + detail modal
│   ├── Journey.jsx/.css  # Alternating timeline
│   ├── Blog.jsx/.css     # Markdown blog, search, categories, tags
│   ├── Contact.jsx/.css  # Contact form + info card
│   ├── Footer.jsx/.css   # Site footer
│   ├── ErrorBoundary.jsx # Error boundary wrapper
│   └── SocialIcons.jsx   # Custom SVG icons
├── data/                 # Content data (profile, skills, projects, etc.)
├── content/blog/         # Blog posts in Markdown
└── utils/markdown.jsx    # Custom markdown parser & JSX renderer
```

## Features

- **Light/Dark theme** — Persisted in localStorage with full design token swap
- **Canvas particle animation** — Mouse-interactive, theme-aware, 80-particle system
- **Custom markdown parser** — Full blog with search, category sidebar, and tag cloud
- **Accessible** — ARIA roles/labels, semantic HTML, keyboard navigation, screen reader support
- **Responsive** — 10+ breakpoints from 480px to 1100px
- **No UI library** — Every pixel hand-crafted with CSS custom properties

## Linting

```bash
npm run lint
```
