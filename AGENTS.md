# Repository Guidelines

## Project Structure & Module Organization

This repository is a pnpm/Turborepo monorepo. Frontend code lives in `apps/web`, a React + Vite app using Tailwind, shadcn-style UI components, React Router, and AI SDK pieces. Backend code lives in `apps/api`, a Mastra service using Better Auth, Drizzle ORM, Neon Postgres, and Zod. Shared workspace configuration is at the root, including `package.json`, `turbo.json`, `pnpm-workspace.yaml`, `oxlintrc.json`, and `pnpm-lock.yaml`. Database schema and migrations are under `apps/api/src/db` and `apps/api/drizzle`. No dedicated test directory is currently present.

## Build, Test, and Development Commands

Use pnpm 10.16.1, as declared by `packageManager`.

- `pnpm install`: install all workspace dependencies.
- `pnpm dev`: run `turbo run dev` for both `api` and `web`.
- `pnpm --filter web dev`: run only the Vite frontend.
- `pnpm --filter api dev`: run only the Mastra backend.
- `pnpm build`: build all packages through Turbo.
- `pnpm typecheck`: run TypeScript checks across packages.
- `pnpm lint` / `pnpm lint:fix`: run oxlint, optionally applying fixes.
- `pnpm format` / `pnpm format:fix`: check or apply oxfmt formatting.
- `pnpm --filter api db:generate` and `pnpm --filter api db:migrate`: manage Drizzle migrations.

## Coding Style & Naming Conventions

Write TypeScript with ES modules. Follow the existing two-space indentation and single-quote style. Use PascalCase for React components, camelCase for functions and variables, and kebab-case or lowercase folder names where already established. Prefer existing UI primitives in `apps/web/src/components/ui` before adding new component patterns. Keep auth-specific frontend code in `apps/web/src/auth` unless broader routing or app integration requires changes.

## Testing Guidelines

There is no configured test runner in the package scripts yet. For now, validate changes with `pnpm typecheck`, `pnpm lint`, and targeted manual testing in the dev server. If tests are added, place them near the code they cover using names such as `*.test.ts` or `*.test.tsx`, and add a package-level `test` script.

## Commit & Pull Request Guidelines

Recent commits use short, imperative messages, sometimes with a prefix such as `chore:`. Keep commits focused and descriptive, for example `fix auth client base url` or `chore: update wrangler config`. Pull requests should include a concise summary, verification steps, linked issues when relevant, and screenshots for visible UI changes.

## Security & Configuration Tips

Do not commit secrets. Use `.env` files locally and keep `.env.example` updated when introducing required variables. Better Auth depends on `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DATABASE_URL`, and trusted CORS origins; verify these before debugging frontend login or registration failures.

## DESIGN of frontend

Always read and do follow DESIGN.md file
