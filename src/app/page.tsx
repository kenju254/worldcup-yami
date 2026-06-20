import { Suspense } from "react";
import { Header } from "@/components/Header";
import { DailySchedule } from "@/components/DailySchedule";
import { MatchResults } from "@/components/MatchResults";
import { GroupStandings } from "@/components/GroupStandings";
import { HighlightsCarousel } from "@/components/HighlightsCarousel";
import { TeamFollower } from "@/components/TeamFollower";

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
          <Suspense fallback={<div className="glass-panel">Loading today&apos;s games...</div>}>
            <DailySchedule />
          </Suspense>
          <TeamFollower />
        </div>
        
        {/* Right column: Yesterday's Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <Suspense fallback={<div className="glass-panel">Loading yesterday&apos;s results...</div>}>
            <MatchResults />
          </Suspense>
        </div>

        {/* Full-width: Group Standings */}
        <Suspense fallback={<div className="glass-panel" style={{ gridColumn: "1 / -1" }}>Loading standings...</div>}>
          <GroupStandings />
        </Suspense>

        {/* Full-width: Yesterday's Highlights */}
        <Suspense fallback={<div className="glass-panel" style={{ gridColumn: "1 / -1" }}>Loading highlights...</div>}>
          <HighlightsCarousel />
        </Suspense>
      </main>

      <footer style={{ marginTop: "4rem", textAlign: "center", color: "var(--text-muted)", padding: "2rem 0", borderTop: "1px solid var(--card-border)" }}>
        <p>&copy; 2026 World Cup Real-time Updates. Powered by API-Football &amp; YouTube API.</p>
      </footer>
    </div>
  );
}
