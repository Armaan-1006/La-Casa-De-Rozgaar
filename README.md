# La Casa De Rozgaar — The House of Employment

**Intelligent Talent & Workforce Ecosystem**

A production-quality frontend for an AI-powered platform that continuously connects market demand with human capability.

## Overview

La Casa De Rozgaar is built as a Money Heist-inspired intelligence headquarters UI for a talent and workforce ecosystem. The platform serves two major audiences:

- **Candidates**: Understand market skills, assess capabilities, identify gaps, discover jobs, and plan careers
- **Employers**: Analyze market trends, discover talent, match candidates to roles, and plan workforce strategy

## Architecture

### Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build**: Vite

### Project Structure

```
src/
├── components/        # Reusable UI components
│   └── Layout.tsx    # Sidebar and Header
├── pages/            # Full-page components
│   ├── WarRoom.tsx                    # Dashboard/Command Center
│   ├── MarketIntelligence.tsx         # Market analysis
│   ├── SkillIntelligence.tsx          # Skill demand tracking
│   ├── CandidateDossier.tsx           # Candidate profile
│   ├── SkillHeist.tsx                 # Skill gap analysis
│   ├── JobFinder.tsx                  # Job matching
│   ├── SimulationVault.tsx            # Career simulation
│   └── EmployerDashboard.tsx          # Employer intelligence
├── data/
│   └── mockData.ts   # Demo data and API responses
├── hooks/
│   └── useTheme.ts   # Theme management
├── lib/
│   └── utils.ts      # Utility functions
├── App.tsx           # Main application router
├── index.css         # Global styles
└── main.tsx          # Entry point
```

## Features

### Visual Design System

- **Dark Mode** (Default): Money Heist-inspired cinematic palette
  - Obsidian (#0B0B0D)
  - Charcoal (#151518)
  - Burgundy (#3A0D13)
  - Crimson (#B3132B) — Primary accent
  - Warm Ivory (#F2E9DC)

- **Light Mode**: Premium classified dossier aesthetic
  - Paper/ivory backgrounds
  - Charcoal text
  - Burgundy headings
  - Responsive theme switching

### Pages Implemented

1. **War Room** — Command center dashboard with live market metrics
2. **Market Intelligence** — Role demand, skill trends, geographic analysis
3. **Skill Intelligence** — Emerging skills, demand tracking, skill relationships
4. **Candidate Dossier** — Profile, capability assessment, radar charts
5. **Skill Heist** — Gap analysis with critical/high/medium/strength categorization
6. **AI Job Finder** — Intelligent job matching with explainable scores
7. **Simulation Vault** — "What-if" career scenario planning
8. **Employer Mastermind** — Workforce intelligence and capability analysis

### Core Interactions

- Smooth page transitions with Framer Motion
- Responsive sidebar navigation with submenu support
- Theme toggling with persistence
- Animated charts with data reveal
- Skill sliders and interactive controls
- Mobile-optimized drawer navigation

## Running the Application

### Development

```bash
npm install
npm run dev
```

Starts dev server at `http://localhost:5173`

### Build

```bash
npm run build
```

Produces optimized production build in `dist/`

### Preview

```bash
npm run preview
```

## Design Philosophy

### Money Heist Identity (65-70%)

- Dossier-inspired card layouts
- Classified/verified status indicators
- Operation codes and case numbers
- Scan line visual effects
- Intelligence terminal aesthetics
- Strategic planning atmosphere

### Professional SaaS (30-35%)

- Clear information hierarchy
- Readable typography and spacing
- Accessible color contrast
- Responsive layouts
- Intuitive navigation
- Data-driven UI

## Navigation Structure

### Main Areas

- **War Room** — Dashboard overview
- **Intelligence** — Market, skills, roles, compensation, forecast
- **Candidate** — Dossier, assessment, skill heist, jobs, career
- **Simulation** — Career scenario vault
- **Employer** — Mastermind, talent vault, workforce, gaps
- **Learning** — Courses, interviews, research, feed

## Key Components

### Sidebar

- Hierarchical navigation with expandable submenus
- Theme toggle (dark/light)
- Online status indicator
- Mobile responsive drawer

### Header

- Sticky header with scroll detection
- Global search placeholder
- Operation status display
- Dynamic styling based on scroll position

### Cards & Panels

- Hover effects with border transitions
- Gradient backgrounds for emphasis
- Monospace labels for technical data
- Consistent spacing and padding

## Data Layer

Mock data is centralized in `src/data/mockData.ts`:

- Market trends (jobs, skills, demand)
- Candidate profiles with skill assessments
- Job listings with match scores
- Employer workforce data
- Learning resources and interview questions

All demo data is clearly marked as `DEMO INTELLIGENCE` to maintain transparency.

## Animations & Motion

Implemented via Framer Motion:

- Container stagger animations
- Item fade-in effects
- Chart data reveals
- Modal transitions
- Sidebar animations
- Smooth scroll behaviors

## Responsive Breakpoints

- Mobile: < 768px (drawer navigation)
- Tablet: 768px - 1024px (optimized layout)
- Desktop: > 1024px (full sidebar)

## Accessibility

- Semantic HTML structure
- ARIA labels where appropriate
- Keyboard navigation support
- Sufficient color contrast
- Focus states on interactive elements
- Respects `prefers-reduced-motion`

## Performance Optimizations

- GPU-accelerated animations (transform/opacity)
- Lazy loading for images
- Efficient re-renders with React.memo
- CSS class composition with Tailwind
- Minimal DOM mutations

## Next Steps for Production

1. **Backend Integration** — Connect to real APIs
2. **Authentication** — User login and session management
3. **Database** — Store user profiles, assessments, job data
4. **Real Market Data** — Integrate actual job market data sources
5. **Assessment Engine** — Implement secure skill assessment
6. **Search & Filtering** — Full-text search, advanced filters
7. **Analytics** — Track user engagement and outcomes
8. **Notifications** — Real-time alerts and updates

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile: iOS Safari, Chrome Mobile

## License

Build For Bharat 2.0 — Chandigarh University

## Contact

For questions about this frontend or the La Casa De Rozgaar project, contact the development team.

---

**"We don't just find jobs or candidates — we continuously understand the market, measure talent, identify the gap, and help both sides become ready for what comes next."**
