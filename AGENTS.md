# Agent Directions

This project is a Next.js App Router application focused on clear React components and custom hooks.

## Project Shape

- Use TypeScript and keep `strict` expectations in mind.
- Prefer `@/*` imports for app code.
- Keep feature code close to the route that owns it, for example:
  - `src/app/(auth-users)/(with-description-context)/estimation/components`
  - `src/app/(auth-users)/(with-description-context)/estimation/hooks`
  - `src/app/(admin-only)/statistics/components`
  - `src/app/(admin-only)/statistics/hooks`
- Put shared primitive UI in `src/components/ui`.
- Put reusable cross-page layout/components in `src/components`.
- Put reusable domain or API helpers in `src/lib` or the nearest feature `utils` folder.

## Component Guidelines

- Components should primarily describe UI and user interaction.
- Keep components small enough that their responsibility is obvious from the file name.
- Move repeated or complex JSX into focused child components.
- Move side effects, fetching, async workflows, and derived behavior into custom hooks.
- Type props explicitly with `type` or `interface`.
- Use existing shadcn-style UI components before creating new primitives.
- Use `lucide-react` icons for actions when an icon exists.
- Add `"use client"` only when a component uses hooks, event handlers, browser APIs, or client-only libraries.
- Prefer accessible controls and semantic markup over decorative-only UI.

## Custom Hook Guidelines

- Hooks should be named `useSomething` and live in the nearest feature `hooks` folder.
- A hook should own one behavior: fetching providers, sending estimates, saving statistics, managing filters, etc.
- Return a simple API such as data, loading state, error state, and action functions.
- Use `useCallback` for action functions that are passed into effects or child components.
- Keep request body shaping, response normalization, and error handling inside hooks when it serves the UI workflow.
- Avoid hiding large unrelated state machines inside a single hook; split when responsibilities diverge.
- Do not introduce global state unless local state or an existing provider is not enough.

## Data And API Boundaries

- Keep route handlers in `src/app/api/**/route.ts`.
- Keep API endpoint constants in existing API utility modules when possible.
- Reuse existing domain types from `src/types` and API route exports before creating duplicate types.
- Validate unknown API response shapes before setting UI state.
- Keep formatting helpers, such as currency and date formatting, in shared or feature `utils` modules.

## Styling

- Follow the existing Tailwind and shadcn-style class patterns.
- Keep page-level layout in pages or layout components, and detailed presentation inside components.
- Avoid large visual rewrites while making functional changes.
- Use existing color, spacing, border, and shadow conventions unless the task explicitly asks for a redesign.

## Before Finishing

- Run `npm run lint` for code changes when practical.
- Run `npm run build` when changes affect routing, server/client boundaries, API contracts, or shared types.
- Check that new components and hooks are imported through the same path style used nearby.
- Keep changes scoped to the requested feature.
