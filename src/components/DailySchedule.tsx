import { fetchSecureApi } from "@/utils/api";

interface Match {
  id: number;
  home: string;
  away: string;
  time: string;
  group: string;
}

export async function DailySchedule() {
  let schedule: Match[] = [];
  let errorMsg: string | null = null;

  try {
    const data = await fetchSecureApi("/schedule");
    schedule = data.matches || [];
  } catch (err) {
    console.error("Failed to fetch schedule", err);
    errorMsg = "Could not load the latest schedule.";
  }

  // Fallback for empty state or error
  if (!schedule.length && !errorMsg) {
    schedule = [
      { id: 1, home: "USA", away: "England", time: "10:00 AM", group: "Group B" },
      { id: 2, home: "Brazil", away: "France", time: "2:00 PM", group: "Group F" },
    ];
  }

  return (
    <div className="glass-panel">
      <h2 style={{ marginBottom: "1rem" }}>Upcoming Matches</h2>
      {errorMsg ? (
        <p style={{ color: "var(--danger-color, red)" }}>{errorMsg}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {schedule.map((match: Match) => (
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
