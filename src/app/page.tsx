import { Suspense } from "react";
import { Header } from "@/components/Header";
import { DailySchedule } from "@/components/DailySchedule";
import { MatchResults } from "@/components/MatchResults";
import { GroupStandings } from "@/components/GroupStandings";
import { HighlightsCarousel } from "@/components/HighlightsCarousel";
import { TeamFollower } from "@/components/TeamFollower";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="layout-container">
      <Header />
      
      <main style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "24px",
      }}>
        {/* Left column: Today's Games + My Team */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <ErrorBoundary>
            <Suspense fallback={<div className="glass-panel">Loading today&apos;s games...</div>}>
              <DailySchedule />
            </Suspense>
          </ErrorBoundary>
          <ErrorBoundary>
            <TeamFollower />
          </ErrorBoundary>
        </div>
        
        {/* Right column: Yesterday's Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <ErrorBoundary>
            <Suspense fallback={<div className="glass-panel">Loading yesterday&apos;s results...</div>}>
              <MatchResults />
            </Suspense>
          </ErrorBoundary>
        </div>

        {/* Full-width: Group Standings */}
        <ErrorBoundary fallback={<div className="glass-panel" style={{ gridColumn: "1 / -1", padding: "24px", borderLeft: "4px solid var(--danger-color, #ef4444)" }}><h3>Standings Unavailable</h3><p style={{ color: "var(--text-muted)", margin: 0 }}>Failed to load tournament standings.</p></div>}>
          <Suspense fallback={<div className="glass-panel" style={{ gridColumn: "1 / -1" }}>Loading standings...</div>}>
            <GroupStandings />
          </Suspense>
        </ErrorBoundary>

        {/* Full-width: Yesterday's Highlights */}
        <ErrorBoundary fallback={<div className="glass-panel" style={{ gridColumn: "1 / -1", padding: "24px", borderLeft: "4px solid var(--danger-color, #ef4444)" }}><h3>Highlights Unavailable</h3><p style={{ color: "var(--text-muted)", margin: 0 }}>Failed to load match highlights.</p></div>}>
          <Suspense fallback={<div className="glass-panel" style={{ gridColumn: "1 / -1" }}>Loading highlights...</div>}>
            <HighlightsCarousel />
          </Suspense>
        </ErrorBoundary>
      </main>

      <footer style={{ marginTop: "4rem", textAlign: "center", color: "var(--text-muted)", padding: "2rem 0", borderTop: "1px solid var(--card-border)" }}>
        <p>&copy; 2026 World Cup Real-time Updates. Powered by API-Football &amp; YouTube API.</p>
      </footer>
    </div>
  );
}
