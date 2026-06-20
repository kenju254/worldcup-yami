# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-06-20
### Added
- **Theme Flash Prevention**: Embedded a synchronous inline theme restoration script in the root layout head to read `localStorage` and set `data-theme` attribute before the first browser paint.
- **Dynamic Team Name Resolution**: Enhanced the backend `/team/<team_id>` endpoint to automatically resolve country names (e.g. "USA", "Argentina") into numeric IDs via the API-Sports `/teams` endpoint.

### Changed
- **React 19 & Next.js 16 Compatibility**: Resolved linter errors and warnings related to React 19 rules (such as `react-hooks/set-state-in-effect`) by refactoring state initialization to use lazy state initializers and wrapping updates in useCallback with deferred async microtask calls.
- **Linter & Build Optimizations**: Configured ESLint to ignore compiled assets in the `.firebase` directory, resolving turbopack linter issues, and replaced raw `any` types with explicit TypeScript interfaces. Replaced `<img>` tags with `<Image />` to prevent LCP warnings.
- **Backend Telemetry Mapping**: Formatted the raw backend response in the Flask team updates endpoint to map exactly to the frontend telemetry updates schema.

## [1.1.0] - 2026-06-20
### Added
- **Zero Trust Architecture**: Fully migrated the Next.js frontend and Python backend to a secure identity-aware proxy architecture.
- **Next.js API Routes**: Created secure internal proxy routes (`/api/team/[id]`) for interactive client components.
- **OIDC Authentication**: Implemented `google-auth-library` to securely request backend services using Compute Engine service account tokens.
- **Live Deployment Link**: Added live Firebase deployment link to README.md.

### Changed
- **Server Components**: Refactored `DailySchedule`, `MatchResults`, and `HighlightsCarousel` from client-side fetching to native Next.js Server Components for enhanced security and performance.
- **Python API (Cloud Run)**: Revoked `allUsers` IAM permission to prevent unauthorized quota theft. The API now strictly requires `run.invoker` authentication.
- **Architecture Documentation**: Updated `architecture.md` to reflect the new Zero Trust principles and Next.js SSR configurations.

## [1.0.0] - 2026-06-19
### Added
- Initial project release.
- Real-time Daily Schedule using API-Sports.
- Match Results integration.
- YouTube Highlights Carousel.
- Interactive Team Follower tracking tool.
- Firebase Hosting and Functions integrations.
- Beautiful, elegant UI with dynamic light/dark mode.
