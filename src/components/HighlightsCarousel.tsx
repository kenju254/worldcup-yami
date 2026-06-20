import { fetchSecureApi } from "@/utils/api";

export async function HighlightsCarousel() {
  let videos: any[] = [];
  let errorMsg = null;

  try {
    const data = await fetchSecureApi("/highlights");
    videos = data.highlights || [];
  } catch (err) {
    console.error("Failed to fetch highlights", err);
    errorMsg = "Could not load the latest highlights.";
  }

  if (!videos.length && !errorMsg) {
    videos = [
      { id: "1", title: "Argentina vs Germany Highlights - Fox Sports", thumbnail: "https://via.placeholder.com/320x180" },
      { id: "2", title: "Spain vs Italy Highlights - Fox Sports", thumbnail: "https://via.placeholder.com/320x180" },
    ];
  }

  return (
    <div className="glass-panel" style={{ gridColumn: "1 / -1" }}>
      <h2 style={{ marginBottom: "1rem" }}>Latest Highlights (Fox Sports)</h2>
      {errorMsg ? (
        <p style={{ color: "var(--danger-color, red)" }}>{errorMsg}</p>
      ) : (
        <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "8px" }}>
          {videos.map((vid: any) => (
            <div key={vid.id} style={{ minWidth: "300px", borderRadius: "12px", overflow: "hidden", background: "rgba(0,0,0,0.05)", position: "relative", cursor: "pointer" }}>
              <img src={vid.thumbnail} alt={vid.title} style={{ width: "100%", height: "180px", objectFit: "cover" }} />
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
