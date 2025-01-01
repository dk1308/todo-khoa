# Weekly Todos

A single-page app for recurring weekly tasks - the things you do every Monday, every Friday, every day.
Tasks are pinned to a day of the week rather than to a date, so the board is the same week after week.
Tick things off as you go, hit **Uncheck All** when the week resets.

Runs entirely in the browser. No account, no server, no network calls.

## Features

- **Weekly view** - all seven days side by side, today's column highlighted, per-day `done/total` counts.
- **Daily view** - one day at a time, useful on a phone.
- **Drag to reorder** within a day (dnd-kit); a 5px drag threshold keeps buttons clickable.
- **Inline editing** - click a task to edit the title/description, `Enter` saves, `Esc` cancels.
- **Uncheck All** - clears every checkbox for a fresh week.
- **Excel import/export** - download the whole list as `weekly-todos.xlsx`, edit it in Excel, import it back.

## Data & persistence

State is saved to `localStorage` (key `weekly-todos`) on every change, so it survives reloads but is
tied to one browser profile. Clearing site data wipes it. **Export to Excel is the backup mechanism.**

The exported sheet is named `Todos` with these columns:

| Column | Notes |
| --- | --- |
| `ID` | UUID; blank generates a new one on import |
| `Title` | required - rows without one are skipped |
| `Description` | optional |
| `Day` | must be a full English weekday, `Monday`…`Sunday` |
| `Completed` | `Yes` / `No` |
| `Order` | position within the day; falls back to row order |

Import **replaces** the current list rather than merging into it.

## Getting started

Requires Node.js 18+.

```bash
npm install
npm run dev       # http://localhost:8080
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Vite dev server on port 8080 |
| `npm run build` | Production build to `dist/` |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm run test` | Vitest, single run |
| `npm run test:watch` | Vitest in watch mode |

## Tech stack

React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui (Radix) · dnd-kit · SheetJS (`xlsx`) · React Router · Vitest

## Project layout

```
src/
  pages/Index.tsx        weekly / daily views, toolbar
  hooks/useTodos.ts      all todo state and mutations
  services/excelService.ts   localStorage + .xlsx import/export
  components/            DayColumn, TodoItem, TodoForm
  components/ui/         generated shadcn/ui primitives
  types/todo.ts          Todo + DayOfWeek
```

Working on this repo with Claude Code? See [CLAUDE.md](CLAUDE.md).
