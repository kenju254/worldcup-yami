# Architecture Review: World Cup 2026 Tracking Application

*Author: Distinguished Engineer*

## Overview
The World Cup 2026 Tracking Application adopts a modern, highly secure **Zero Trust Architecture**. By separating the frontend presentation layer from the backend API gateway, and restricting public access to the backend, the system ensures scalability, maintainability, and enterprise-grade security for high-traffic sports events.

## System Components

### 1. Frontend: Next.js (React 19)
- **Framework**: Next.js 16 utilizing the App Router (`src/app`).
- **Rendering Strategy**: Next.js Server Components. Components like `DailySchedule`, `MatchResults`, and `HighlightsCarousel` run entirely on the server. This prevents exposing any internal backend URLs or tokens to the browser.
- **Secure API Proxy**: The Next.js server acts as a secure identity proxy. Using `google-auth-library`, it automatically fetches an OIDC identity token using the Compute Engine service account and securely forwards requests to the private Python API.
- **State & Theming**: Employs a global `ThemeProvider` for robust dark/light mode context switching, ensuring accessibility and a modern aesthetic.

### 2. Backend Gateway: Firebase Cloud Functions (Python/Flask)
- **Framework**: Flask wrapped within Firebase `https_fn` (Google Cloud Run).
- **Security Posture (Zero Trust)**: The API is strictly private. The `allUsers` IAM role has been revoked. It only accepts authenticated invocations via the `run.invoker` IAM role. This prevents public quota theft and completely protects the sensitive API keys stored in environment variables.
- **Endpoints**:
  - `/schedule`: Fetches upcoming fixtures.
  - `/results`: Fetches recently completed fixtures.
  - `/highlights`: Interfaces with YouTube API for curated match highlights.
  - `/team/<team_id>`: Retrieves team-specific telemetry and fixtures.

### 3. External Integrations
- **API-Sports (Football)**: Serves as the primary source of truth for real-time match data, schedules, and scores.
- **YouTube Data API v3**: Delivers rich media highlights from broadcasters (e.g., Fox Sports).

## Evaluation
The architecture is exceptionally well-suited for a high-profile sports tracking app. The Zero Trust security model ensures that malicious actors cannot scrape or abuse the API quotas. Utilizing Firebase Functions provides auto-scaling to handle traffic spikes during major matches. The Next.js frontend ensures optimal SEO and fast load times, while keeping secret keys completely secure on the backend proxy.
