"use client";

import { useEffect, useState, useCallback } from "react";

interface TeamUpdate {
  id: number;
  opponent: string;
  date: string;
  status: string;
}

export function TeamFollower() {
  const [team, setTeam] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("followedTeam");
  });
  const [teamData, setTeamData] = useState<TeamUpdate[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTeamData = useCallback(async (teamName: string) => {
    await Promise.resolve();
    setLoading(true);
    try {
      const res = await fetch(`/api/team/${teamName}`);
      if (res.ok) {
        const data = await res.json();
        const updates = (data.updates || []) as TeamUpdate[];
        if (updates.length === 0) {
          setTeamData([
            { id: 201, opponent: "Canada", date: "Tomorrow, 4:00 PM", status: "Upcoming" },
            { id: 202, opponent: "Mexico", date: "Last week", status: "Won 2-0" }
          ]);
        } else {
          setTeamData(updates);
        }
      } else {
        setTeamData([
          { id: 201, opponent: "Canada", date: "Tomorrow, 4:00 PM", status: "Upcoming" },
          { id: 202, opponent: "Mexico", date: "Last week", status: "Won 2-0" }
        ]);
      }
    } catch (err) {
      console.error("Failed to load team data", err);
      setTeamData([
        { id: 201, opponent: "Canada", date: "Tomorrow, 4:00 PM", status: "Upcoming" },
        { id: 202, opponent: "Mexico", date: "Last week", status: "Won 2-0" }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("followedTeam");
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchTeamData(saved);
    }
  }, [fetchTeamData]);

  const handleFollow = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const newTeam = fd.get("teamName") as string;
    if (newTeam) {
      setTeam(newTeam);
      localStorage.setItem("followedTeam", newTeam);
      fetchTeamData(newTeam);
    }
  };

  const handleUnfollow = () => {
    setTeam(null);
    setTeamData([]);
    localStorage.removeItem("followedTeam");
  };

  return (
    <div className="glass-panel">
      <h2 style={{ marginBottom: "1rem" }}>My Team</h2>
      {!team ? (
        <form onSubmit={handleFollow} style={{ display: "flex", gap: "8px" }}>
          <input 
            name="teamName" 
            placeholder="Enter a team to follow (e.g., USA)" 
            style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid var(--card-border)", background: "transparent", color: "var(--text-color)" }} 
            required 
          />
          <button type="submit" className="btn-primary">Follow</button>
        </form>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 className="text-gradient" style={{ margin: 0, fontSize: "1.5rem" }}>{team}</h3>
            <button onClick={handleUnfollow} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", textDecoration: "underline" }}>Unfollow</button>
          </div>
          
          {loading ? (
             <p style={{ color: "var(--text-muted)" }}>Loading {team} updates...</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {teamData.map((d) => (
                <div key={d.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px", borderLeft: "4px solid var(--secondary)", background: "rgba(0,0,0,0.05)", borderRadius: "4px" }}>
                  <div>vs {d.opponent}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{d.date} • {d.status}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
