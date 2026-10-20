# Haven — Real estate workspace

A responsive React foundation for a real estate agent or small agency
workspace. This phase provides the application shell, navigation, design
foundation, and honest placeholder pages. It does not manage business data.

## Technology stack

- React and JavaScript (JSX)
- Vite
- Tailwind CSS v4 with the official `@tailwindcss/vite` plugin
- React Router
- Lucide React
- ESLint

## Prerequisites

- Node.js 20.19+ or 22.12+ (or a newer compatible release)
- npm

## Install and run

From PowerShell in the project folder:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite. To create and locally preview a production
build:

```powershell
npm run build
npm run preview
```

Run ESLint with:

```powershell
npm run lint
```

## Placeholder pages

| Route | Purpose |
| --- | --- |
| `/dashboard` | Workspace introduction and future-area placeholders |
| `/properties` | Future property management |
| `/content` | Future content creation workspace |
| `/calendar` | Future marketing schedule |
| `/inquiries` | Future customer inquiries |
| `/settings` | Future workspace and account preferences |

The root route redirects to `/dashboard`. Unknown routes show a not-found page.
All routes use the shared responsive application shell.

## Project structure

```text
src/
├── app/                 # App entry and React Router configuration
├── assets/              # Local application assets
├── components/
│   ├── layout/          # Shared shell, sidebar, header, mobile navigation
│   └── ui/              # Reusable buttons, cards, badges, page headers
├── hooks/               # Future reusable React hooks
├── lib/                 # Future shared library setup
├── pages/               # Route-level placeholder pages
├── services/            # Future backend and external-service boundary
├── styles/              # Tailwind entry and global design tokens
└── utils/               # Future framework-independent helpers
```

## Tailwind CSS

Tailwind CSS v4 is integrated through the official Vite plugin in
`vite.config.js`. Global styles import Tailwind with `@import "tailwindcss";`
in `src/styles/index.css`; the small palette is defined there with `@theme`.
No separate Tailwind config file is required for this setup.

## Planned shared-backend architecture

Desktop and mobile browsers will need a shared backend and authenticated access
to use the same account and synchronized data. Future backend communication
belongs in `src/services/`, with client setup kept separate from UI components.
This app currently has no database client, authentication, or local business
record storage. `.env.example` only documents placeholder variable names for a
future Supabase setup. Never expose a Supabase service-role key in frontend
code; it belongs only in a trusted server environment.

## Future phases

1. Agree on data ownership, roles, and the shared backend design.
2. Add secure authentication and the initial data model.
3. Build property, content, calendar, and inquiry workflows.
4. Add selected integrations and prepare the shared web app for Android
   packaging with Capacitor, if needed.

These are planning notes only; none of those features are implemented here.

## Current limitations

- All business screens are placeholders; there are no forms or saved records.
- There is no authentication, backend, synchronization, AI, or social
  publishing integration.
- The profile/account control is a visual placeholder.
- Capacitor is not installed or configured.
- No deployment or release process is configured.
