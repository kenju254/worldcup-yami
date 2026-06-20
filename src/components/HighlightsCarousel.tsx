import { fetchSecureApi } from "@/utils/api";
import Image from "next/image";

interface HighlightVideo {
  id: string;
  title: string;
  thumbnail: string;
}

export async function HighlightsCarousel() {
  let videos: HighlightVideo[] = [];
  let errorMsg: string | null = null;

  try {
    // First try to get yesterday's results to build targeted queries
    let teamsParam = "";
    try {
      const resultsData = await fetchSecureApi("/results");
      const results = resultsData.results || [];
      if (results.length > 0) {
        teamsParam = results
          .map((r: { home: string; away: string }) => `${r.home} vs ${r.away}`)
          .join(",");
      }
    } catch {
      // If results fail, we'll just use default query
    }

    const queryParam = teamsParam ? `?teams=${encodeURIComponent(teamsParam)}` : "";
    const data = await fetchSecureApi(`/highlights${queryParam}`);
    videos = data.highlights || [];
  } catch (err) {
    console.error("Failed to fetch highlights", err);
    errorMsg = "Could not load the latest highlights.";
  }

  if (!videos.length && !errorMsg) {
    videos = [
      { id: "1", title: "Argentina vs Germany - Full Match Highlights", thumbnail: "https://via.placeholder.com/320x180" },
      { id: "2", title: "Spain vs Italy - All Goals & Highlights", thumbnail: "https://via.placeholder.com/320x180" },
    ];
  }

  return (
    <div className="glass-panel" style={{ gridColumn: "1 / -1" }}>
      <div className="section-header">
        <h2>Yesterday&apos;s Match Highlights</h2>
      </div>

      {errorMsg ? (
        <p style={{ color: "var(--danger-color, red)" }}>{errorMsg}</p>
      ) : videos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎬</div>
          <p>No highlights available yet</p>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "8px" }}>
          {videos.map((vid: HighlightVideo) => (
            <div key={vid.id} style={{ minWidth: "300px", borderRadius: "12px", overflow: "hidden", background: "rgba(0,0,0,0.05)", position: "relative", cursor: "pointer" }}>
              <Image src={vid.thumbnail} alt={vid.title} width={300} height={180} unoptimized style={{ width: "100%", height: "180px", objectFit: "cover" }} />
              <div style={{ padding: "12px", fontWeight: 500, fontSize: "0.9rem" }}>{vid.title}</div>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "rgba(0,0,0,0.6)", borderRadius: "50%", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", marginTop: "-20px" }}>
                ▶
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
