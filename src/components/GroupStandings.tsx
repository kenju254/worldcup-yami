import { fetchSecureApi } from "@/utils/api";
import Image from "next/image";

interface TeamStanding {
  name: string;
  logo: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalDiff: number;
}

interface GroupData {
  group: string;
  teams: TeamStanding[];
}

export async function GroupStandings() {
  let standings: GroupData[] = [];
  let errorMsg: string | null = null;

  try {
    const data = await fetchSecureApi("/standings");
    standings = data.standings || [];
  } catch (err) {
    console.error("Failed to fetch standings", err);
    errorMsg = "Could not load group standings.";
  }

  // Fallback data
  if (!standings.length && !errorMsg) {
    standings = [
      {
        group: "Group A",
        teams: [
          { name: "Qatar", logo: "", points: 0, played: 3, won: 0, drawn: 0, lost: 3, goalDiff: -5 },
          { name: "Ecuador", logo: "", points: 6, played: 3, won: 2, drawn: 0, lost: 1, goalDiff: 2 },
          { name: "Senegal", logo: "", points: 3, played: 3, won: 1, drawn: 0, lost: 2, goalDiff: -1 },
          { name: "Netherlands", logo: "", points: 7, played: 3, won: 2, drawn: 1, lost: 0, goalDiff: 4 },
        ],
      },
      {
        group: "Group B",
        teams: [
          { name: "England", logo: "", points: 7, played: 3, won: 2, drawn: 1, lost: 0, goalDiff: 7 },
          { name: "Iran", logo: "", points: 3, played: 3, won: 1, drawn: 0, lost: 2, goalDiff: -3 },
          { name: "USA", logo: "", points: 5, played: 3, won: 1, drawn: 2, lost: 0, goalDiff: 1 },
          { name: "Wales", logo: "", points: 1, played: 3, won: 0, drawn: 1, lost: 2, goalDiff: -5 },
        ],
      },
    ];
  }

  return (
    <div style={{ gridColumn: "1 / -1" }}>
      <div className="section-header" style={{ marginBottom: "1.25rem" }}>
        <h2>Group Standings</h2>
      </div>

      {errorMsg ? (
        <div className="glass-panel">
          <p style={{ color: "var(--danger-color, red)" }}>{errorMsg}</p>
        </div>
      ) : standings.length === 0 ? (
        <div className="glass-panel empty-state">
          <div className="empty-state-icon">🏆</div>
          <p>Standings not yet available</p>
        </div>
      ) : (
        <div className="standings-grid">
          {standings.map((group) => (
            <div key={group.group} className="glass-panel" style={{ padding: "20px" }}>
              <h3 style={{ margin: "0 0 14px 0", fontSize: "1.1rem" }}>
                <span className="text-gradient">{group.group}</span>
              </h3>
              <table className="standings-table">
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>P</th>
                    <th>W</th>
                    <th>D</th>
                    <th>L</th>
                    <th>GD</th>
                    <th>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {group.teams
                    .sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff)
                    .map((team, idx) => (
                      <tr key={team.name} className={idx < 2 ? "qualified" : ""}>
                        <td>
                          <div className="team-name-cell">
                            {team.logo && (
                              <Image
                                src={team.logo}
                                alt={team.name}
                                width={20}
                                height={20}
                                className="team-logo-sm"
                                unoptimized
                              />
                            )}
                            {team.name}
                          </div>
                        </td>
                        <td>{team.played}</td>
                        <td>{team.won}</td>
                        <td>{team.drawn}</td>
                        <td>{team.lost}</td>
                        <td style={{ color: team.goalDiff > 0 ? "#22c55e" : team.goalDiff < 0 ? "#ef4444" : "var(--text-muted)" }}>
                          {team.goalDiff > 0 ? "+" : ""}{team.goalDiff}
                        </td>
                        <td style={{ fontWeight: 700 }}>{team.points}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
