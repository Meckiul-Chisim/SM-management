# Haven — social media workspace (local-first demo)

Haven helps a freelancer, creator or small agency plan social content in one place: organise brands, write and track posts, see a content calendar, and keep a list of follow-ups.

**It is a frontend-only demo.** Everything is stored in the visitor's own browser. It does not publish to any social platform.

## What you can do

- **Dashboard** – counts and lists calculated from your own records: the next 7 days, drafts, follow-ups, overdue items.
- **Brands & accounts** – create, edit and delete brands. Handles are saved as notes only. Deleting a brand tells you how many posts and follow-ups it has and lets you keep them (moved to "General workspace") or delete them with it.
- **Content studio** – create, edit, delete, search and filter posts by brand, platform and status; change status in place; copy text; repurpose a post for another platform. A starter-text helper fills built-in **templates** (it is not AI and makes no network calls).
- **Content calendar** – month view of posts that have a planned date, with a day panel. Entries are plans inside the app.
- **Engagement** – a manual follow-up list with due dates, overdue highlighting, mark done / reopen, edit and filters. Nothing is imported from social platforms.
- **Settings** – rename the workspace, export a JSON backup, import a backup (validated and previewed before it replaces anything), remove or reset sample data, delete all data, turn the animated background off.
- Light and dark themes, keyboard-accessible dialogs, reduced-motion support.

### What a post status means

| Status | Meaning |
| --- | --- |
| Draft | Still being written. |
| Ready | Written and waiting to be planned or posted. |
| Planned | Has a planned date **in this app**. Nothing is scheduled on any platform. |
| Published | You posted it yourself and marked it here. The app never publishes anything. |

## Not included

Haven has **no** sign-in, cloud sync, team collaboration, real social account connections, automatic publishing, live comments/messages, live analytics or AI generation. The brands, posts and people in the sample data are invented and labelled "Sample".

## Run it locally

Requires Node.js 20.19+ (or 22.12+) and npm.

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build      # production build into dist/
npm run preview    # serve the production build locally
npm run lint       # ESLint
npm test           # Vitest unit and component tests
```

## How data is stored

- The workspace is saved in the browser's `localStorage` (key `haven-social-workspace-v1`), with a `schemaVersion`. The theme and animated-background choices are saved separately.
- Dates are stored as local text (`2026-10-23` or `2026-10-23T10:00`) with no time zone, so a planned post never moves to another day.
- If saved data cannot be read, a copy is kept in the browser under `haven-social-workspace-recovery` and sample data is loaded, with a visible warning. If the browser blocks storage, a banner says changes are not being saved.
- Clearing site data deletes the workspace. Use **Settings → Export backup** to keep a copy. Another tab on the same site stays in step automatically.
- Anyone with access to the browser profile can read the data. Do not store sensitive customer information in this demo.

## Deploy (static hosting)

The build output in `dist/` is static files.

**Vercel:** import the GitHub repository. The framework preset is Vite (build command `npm run build`, output directory `dist`). `vercel.json` already rewrites every route to `index.html`, so refreshing `/calendar` works. No environment variables are needed.

**Netlify / Cloudflare Pages:** build command `npm run build`, publish directory `dist`. `public/_redirects` handles routing.

## Project structure

```
src/
  app/          router and navigation list
  components/   layout shell, ui primitives, and feature components
  context/      workspace and toast providers
  data/         schema, validation, reducer, storage, backup, sample data
  hooks/        shared hooks
  pages/        one file per route
  utils/        dates, calendar, filters, follow-ups, drafts, theme
  styles/       design tokens (light and dark) and component classes
```

## Before this could be a multi-user product

1. Authentication and per-user/workspace access control.
2. A server database with server-side validation, migrations and backups.
3. Roles and team collaboration (comments, approvals).
4. Official platform APIs (OAuth, per-platform publishing rules and rate limits) for real connections and publishing.
5. Real analytics and media upload/storage.
6. Privacy policy, data export/deletion for users, monitoring and security review.

## Product name

"Haven" is the current working name. Whether to keep it is a decision for the owner; it is set in one place (`PRODUCT_NAME` in `src/app/navigation.js`, plus `index.html` and `DEFAULT_WORKSPACE_NAME` in `src/data/constants.js`).
