"use client";

import { useEffect, useState } from "react";

export function MatchResults() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setResults([
        { id: 101, home: "Argentina", away: "Germany", homeScore: 2, awayScore: 1 },
        { id: 102, home: "Spain", away: "Italy", homeScore: 0, awayScore: 0 },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="glass-panel">
      <h2 style={{ marginBottom: "1rem" }}>Latest Results</h2>
      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading results...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {results.map((match) => (
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
