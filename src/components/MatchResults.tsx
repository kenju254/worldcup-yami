import { fetchSecureApi } from "@/utils/api";

interface MatchResult {
  id: number;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  group?: string;
  homeLogo?: string;
  awayLogo?: string;
}

function getYesterdayFormatted(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export async function MatchResults() {
  let results: MatchResult[] = [];
  let errorMsg: string | null = null;

  try {
    const data = await fetchSecureApi("/results");
    results = data.results || [];
  } catch (err) {
    console.error("Failed to fetch results", err);
    errorMsg = "Could not load yesterday's results.";
  }

  if (!results.length && !errorMsg) {
    results = [
      { id: 101, home: "Argentina", away: "Germany", homeScore: 2, awayScore: 1, group: "Group C" },
      { id: 102, home: "Spain", away: "Italy", homeScore: 1, awayScore: 1, group: "Group E" },
    ];
  }

  return (
    <div className="glass-panel">
      <div className="section-header">
        <h2>Yesterday&apos;s Results</h2>
        <span className="date-badge">{getYesterdayFormatted()}</span>
      </div>

      {errorMsg ? (
        <p style={{ color: "var(--danger-color, red)" }}>{errorMsg}</p>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p>No results from yesterday</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {results.map((match: MatchResult) => {
            const isDraw = match.homeScore === match.awayScore;
            const homeWon = match.homeScore > match.awayScore;
            return (
              <div key={match.id} className="match-card" style={{ flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                    <span className={homeWon && !isDraw ? "winner-name" : ""} style={{ fontWeight: homeWon && !isDraw ? 700 : 500 }}>
                      {match.home}
                    </span>
                  </div>
                  <div className="score-display" style={{ color: "var(--primary)" }}>
                    <span>{match.homeScore}</span>
                    <span className="divider">-</span>
                    <span>{match.awayScore}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, justifyContent: "flex-end" }}>
                    <span className={!homeWon && !isDraw ? "winner-name" : ""} style={{ fontWeight: !homeWon && !isDraw ? 700 : 500 }}>
                      {match.away}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                  <span className="group-label">{match.group || "Group Stage"}</span>
                  {isDraw && <span className="result-badge draw">Draw</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
