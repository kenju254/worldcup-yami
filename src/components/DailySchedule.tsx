"use client";

import { useEffect, useState } from "react";

export function DailySchedule() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch from Next.js API route or Firebase function
    // fetch("/api/schedule").then(...)
    setTimeout(() => {
      setSchedule([
        { id: 1, home: "USA", away: "England", time: "10:00 AM", group: "Group B" },
        { id: 2, home: "Brazil", away: "France", time: "2:00 PM", group: "Group F" },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="glass-panel">
      <h2 style={{ marginBottom: "1rem" }}>Upcoming Matches</h2>
      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading schedule...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {schedule.map((match) => (
            <div key={match.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "rgba(0,0,0,0.05)", borderRadius: "12px" }}>
              <div style={{ fontWeight: 600 }}>{match.home} vs {match.away}</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{match.time} | {match.group}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
