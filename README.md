# Haven — Social media workspace

A responsive React/Vite social media management prototype. It helps a small team organise multiple brands, draft platform-specific content, plan a calendar, and track engagement follow-ups.

## Current MVP

- Dashboard metrics derived from saved workspace records.
- Brand management with social profile names/handles.
- Content studio for creating, editing, searching, copying, and managing post drafts/plans.
- Monthly content calendar.
- Manually logged engagement and follow-up records.
- Workspace rename, JSON export/import, and reset.
- Local persistence using the current browser's localStorage.
- Responsive navigation and legacy redirects from `/properties` and `/inquiries`.

## Important limitations

This is a local-first prototype, not yet a connected social media publishing platform. It does not authenticate users, synchronise between devices, connect real Instagram/Facebook/TikTok/LinkedIn accounts, publish posts to platforms, receive live messages, or pull analytics. Social account handles are organisational references only. Calendar items marked **Planned** are in-app plans, not confirmed platform schedules.

The initial workspace contains clearly illustrative sample records to demonstrate the workflows. Add your own records or reset the workspace from Settings. Data is stored in the browser that you use; clearing browser storage will remove it unless you export a backup first.

## Run locally

Requires Node.js 20.19+ or 22.12+ and npm.

```bash
npm install
npm run dev
```

Build and lint:

```bash
npm run build
npm run lint
```

## Tech stack

- React and JavaScript (JSX)
- Vite
- Tailwind CSS v4 via `@tailwindcss/vite`
- React Router
- Lucide React

## Suggested next engineering phases

1. Add authentication and a secure shared backend so data syncs across devices and collaborators.
2. Add roles, workspace membership, server-side validation, and auditability.
3. Connect social platforms using their approved OAuth and publishing APIs, with per-platform capability checks.
4. Add real analytics, media upload/storage, and approval workflows only after validating user demand.
5. Add automated tests and deployment checks before a public launch.
