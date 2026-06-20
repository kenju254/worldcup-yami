import { fetchSecureApi } from "@/utils/api";

interface Match {
  id: number;
  home: string;
  away: string;
  time: string;
  group: string;
  status: string;
  homeLogo?: string;
  awayLogo?: string;
}

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  } catch {
    return dateStr;
  }
}

function isLiveSoon(dateStr: string): boolean {
  try {
    const matchTime = new Date(dateStr).getTime();
    const now = Date.now();
    const diffMs = matchTime - now;
    return diffMs > 0 && diffMs <= 2 * 60 * 60 * 1000; // within 2 hours
  } catch {
    return false;
  }
}

function getTodayFormatted(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export async function DailySchedule() {
  let schedule: Match[] = [];
  let errorMsg: string | null = null;

  try {
    const data = await fetchSecureApi("/schedule");
    schedule = data.matches || [];
  } catch (err) {
    console.error("Failed to fetch schedule", err);
    errorMsg = "Could not load today's schedule.";
  }

  // Fallback for empty state or error
  if (!schedule.length && !errorMsg) {
    schedule = [
      { id: 1, home: "USA", away: "England", time: "2026-06-20T17:00:00Z", group: "Group B", status: "NS" },
      { id: 2, home: "Brazil", away: "France", time: "2026-06-20T21:00:00Z", group: "Group F", status: "NS" },
    ];
  }

  return (
    <div className="glass-panel">
      <div className="section-header">
        <h2>Today&apos;s Games</h2>
        <span className="date-badge">{getTodayFormatted()}</span>
      </div>

      {errorMsg ? (
        <p style={{ color: "var(--danger-color, red)" }}>{errorMsg}</p>
      ) : schedule.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⚽</div>
          <p>No games scheduled for today</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {schedule.map((match: Match) => (
            <div key={match.id} className="match-card">
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: "1.05rem" }}>
                  {match.home} vs {match.away}
                </div>
                <span className="group-label">{match.group}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                <span className="kickoff-badge">
                  🕐 {formatTime(match.time)}
                </span>
                {isLiveSoon(match.time) && (
                  <span className="live-soon-badge">
                    <span className="live-dot" />
                    Live Soon
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
