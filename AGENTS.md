# Repository Guidelines

## Project Structure & Module Organization
- app: Expo Router screens and layout (e.g., `app/_layout.tsx`, `app/(tabs)/projection.tsx`, `app/(tabs)/data.tsx`).
- src: Application modules (`src/components/LineChart.tsx`, `src/context/FinanceContext.tsx`, `src/utils/projection.ts`).
- assets: Icons, splash, and other static assets referenced by `app.json`.
- app.json: Expo configuration (name, icons, plugins). Entry is `expo-router/entry`.

## Build, Test, and Development Commands
- Install deps: `npm install`
- Start dev server: `npm start`
- Open iOS simulator: `npm run ios`
- Open Android emulator: `npm run android`
- Open web: `npm run web`
- Type-check: `npx tsc --noEmit` (strict mode enabled via `tsconfig.json`).

## Coding Style & Naming Conventions
- Language: TypeScript + React Native. Prefer function components.
- Indentation: 2 spaces; Quotes: single; End statements with semicolons.
- Components: PascalCase file and export names (e.g., `LineChart.tsx`).
- Screens (Expo Router): lowercase route files under `app/` (e.g., `data.tsx`).
- Modules: colocate logic in `src/utils` and shared UI in `src/components`.
- Lint/format: No ESLint/Prettier configured; match existing style. If adding, keep configs minimal and scoped.

## Testing Guidelines
- No test harness is configured yet. If adding tests, prefer Jest + React Native Testing Library.
- Naming: colocate as `*.test.ts`/`*.test.tsx` next to the unit under test.
- Scope: unit-test pure functions (e.g., `buildProjection`) and component behavior with RTL. Aim for clear, fast tests over coverage quotas.
- Run: add `"test": "jest"` to `package.json` or run `npx jest` once configured.

## Commit & Pull Request Guidelines
- Commits: concise, imperative subject (optionally follow Conventional Commits, e.g., `feat: add projection modes`).
- PRs: include context, linked issues, and screenshots/GIFs for UI changes. Note any config updates to `app.json`.
- Checks: ensure `npm start` boots, type-checks pass, and no runtime errors in iOS/Android/Web.

## Security & Configuration Tips
- Do not commit secrets; keep keys out of source and `app.json`.
- Asset updates: replace icons/splash in `assets/` and keep paths in `app.json` in sync.
- Persistence: `FinanceContext` uses AsyncStorage key `finance:data:v1`; bump with migration if shape changes.
