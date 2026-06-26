## Goal
Organize training modules by sales channel so reps can quickly find the skill they need and managers can assign tracks. Start with 4 fixed categories; existing 4 Phone Skills modules move into the Phone track. Same structure inside each module (video → lesson → quiz → roleplay).

## Categories (fixed v1)
1. **Phone** — inbound/outbound calls
2. **Internet / BDC** — email, text, lead response, CRM templates
3. **Showroom** — meet & greet, needs analysis, demo, write-up, desk
4. **Follow-up** — unsold, sold, service-to-sales, long-term nurture

## User experience
- `/learn` becomes a category landing page: 4 large cards, each with icon, name, short description, and "X modules • Y completed" progress.
- Click a category → `/learn/category/:slug` shows the modules in that track (current Learn list UI, filtered).
- Click a module → existing module flow (unchanged).
- Breadcrumb: Learn › Phone › Module Title.
- Scenarios page also filters by category (tab strip at top: All / Phone / Internet / Showroom / Follow-up) so practice matches what they just learned.

## Data model
Add a `category` column to `dealership_modules` and a `category` column to `dealership_practice_scenarios` / `custom_scenarios`:
- type: text enum-like (`phone` | `internet` | `showroom` | `followup`)
- default: `phone` (so existing rows fall into the Phone track automatically)
- nullable: no
- indexed for filter queries

Migration also backfills the 4 existing Phone Skills modules + their roleplays to `category = 'phone'`.

## Code changes
- **New constant**: `src/lib/categories.ts` — id, slug, name, description, icon, color for the 4 categories.
- **Learn page** (`src/pages/Learn.tsx`): replace flat module grid with category cards when no category is selected.
- **New route**: `/learn/category/:slug` → reuses existing module-list rendering, filtered by category.
- **Hook update**: `useDealershipModules` returns `category` field; add `useModulesByCategory(slug)` helper.
- **Scenarios page** (`src/pages/Scenarios.tsx`): add category tab filter.
- **Admin** (`src/components/admin/ContentTab.tsx` + `PracticeScenarioManager.tsx`): add category dropdown when creating/editing a module or scenario.
- **Progress/Team dashboards**: group completion stats by category (small addition, single new section).

## What stays the same
- Existing module content, video gating, quiz threshold, roleplay engine, scoring — all untouched.
- Module IDs and URLs (`/learn/:moduleId`) unchanged, so bookmarks and in-progress users aren't disrupted.
- All 4 current Phone Skills modules keep working exactly as today; they just appear under the Phone category card.

## Out of scope (later)
- Per-dealership custom categories
- Drag-to-reorder categories
- Per-category certificates (we can add once content fills out)

## Technical notes
- New migration creates the column with a `CHECK` constraint, default `'phone'`, backfills existing rows, then sets `NOT NULL`.
- RLS policies on the affected tables don't change (category is just a filter field, not a security boundary).
- TypeScript types regenerate automatically after the migration.
