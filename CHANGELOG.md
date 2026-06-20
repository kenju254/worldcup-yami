# Changelog

All notable changes to this project will be documented in this file.

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
