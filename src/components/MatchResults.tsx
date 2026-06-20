import { fetchSecureApi } from "@/utils/api";

export async function MatchResults() {
  let results: any[] = [];
  let errorMsg = null;

  try {
    const data = await fetchSecureApi("/results");
    results = data.results || [];
  } catch (err) {
    console.error("Failed to fetch results", err);
    errorMsg = "Could not load the latest results.";
  }

  if (!results.length && !errorMsg) {
    results = [
      { id: 101, home: "Argentina", away: "Germany", homeScore: 2, awayScore: 1 },
      { id: 102, home: "Spain", away: "Italy", homeScore: 0, awayScore: 0 },
    ];
  }

  return (
    <div className="glass-panel">
      <h2 style={{ marginBottom: "1rem" }}>Latest Results</h2>
      {errorMsg ? (
        <p style={{ color: "var(--danger-color, red)" }}>{errorMsg}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {results.map((match: any) => (
            <div key={match.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(0,0,0,0.05)", borderRadius: "12px" }}>
              <div style={{ fontWeight: 500, flex: 1, textAlign: "right" }}>{match.home}</div>
              <div style={{ margin: "0 16px", fontWeight: 800, fontSize: "1.2rem", color: "var(--primary)" }}>
                {match.homeScore} - {match.awayScore}
              </div>
              <div style={{ fontWeight: 500, flex: 1 }}>{match.away}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
