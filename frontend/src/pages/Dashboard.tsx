import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HotspotMap from "../components/HotspotMap";
import ForecastChart from "../components/ForecastChart";
import BiasTable from "../components/BiasTable";
import { getBiasData, getBiasSummary } from "../api/api";

interface DashboardProps {
  activeView: "authority" | "public";
}

/* ─── PublicHighlights ── Fetches real bias data, no static values ─────── */
const PublicHighlights: React.FC = () => {
  const [biasRows, setBiasRows] = useState<any[]>([]);
  const [topWard, setTopWard] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getBiasData(), getBiasSummary()])
      .then(([biasRes, summaryRes]) => {
        const rows = biasRes.data as any[];
        setBiasRows(rows.slice(0, 4));
        setTopWard(rows[0] ?? null);
        void summaryRes; // summary available if needed later
      })
      .catch(() => { setBiasRows([]); setTopWard(null); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {[1, 2].map((i) => (
          <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: "1.5rem", minHeight: "200px", opacity: 0.5 }} />
        ))}
      </div>
    );
  }

  if (biasRows.length === 0) {
    return (
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
        No bias data yet — submit complaints to populate the accountability view.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
      {/* Bias Activity Radar — driven by real /api/bias data */}
      <div style={{ background: "linear-gradient(135deg, rgba(248,113,113,0.06), rgba(236,72,153,0.04))", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
        <div className="section-title" style={{ marginBottom: "1.25rem" }}>
          <div className="icon" style={{ background: "rgba(248,113,113,0.15)", fontSize: "0.875rem" }}>⚠</div>
          High-Bias Ward Radar
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {biasRows.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.1)", borderRadius: "var(--radius-md)" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: "600", fontSize: "0.9rem", marginBottom: "0.4rem" }}>{item.ward_name}</div>
                <div style={{ height: "4px", background: "rgba(248,113,113,0.15)", borderRadius: "9999px", overflow: "hidden" }}>
                  <div style={{ width: `${item.bias_score}%`, height: "100%", background: "#f87171", borderRadius: "9999px" }} />
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "#f87171", fontFamily: "var(--font-display)" }}>{item.bias_score}/100</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>{item.total_complaints ?? 0} complaints</div>
              </div>
            </div>
          ))}
        </div>
        <Link to="/investigate" className="btn btn-danger btn-sm" style={{ marginTop: "1rem", width: "100%", justifyContent: "center" }}>Investigate →</Link>
      </div>

      {/* Top Ward Brief — driven by real top bias ward */}
      <div style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04))", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "var(--radius-lg)", padding: "1.5rem", display: "flex", flexDirection: "column" }}>
        <div className="section-title" style={{ marginBottom: "1.25rem" }}>
          <div className="icon" style={{ background: "rgba(99,102,241,0.15)", fontSize: "0.875rem" }}>🔍</div>
          Auto Investigation Brief
        </div>
        {topWard && (
          <div style={{ background: "var(--bg-elevated)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "var(--radius-md)", padding: "1.25rem", flex: 1, fontSize: "0.875rem", lineHeight: 1.7, color: "var(--text-secondary)" }}>
            <div style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontWeight: "700", color: "#818cf8", fontSize: "0.9rem" }}>{topWard.ward_name}</span>
              <span style={{ background: "rgba(248,113,113,0.1)", color: "#f87171", fontSize: "0.65rem", padding: "0.1rem 0.5rem", borderRadius: "var(--radius-full)", fontWeight: "700" }}>
                BIAS SCORE: {topWard.bias_score}/100
              </span>
            </div>
            <p style={{ marginBottom: "0.75rem" }}>
              Analysis of <strong style={{ color: "var(--text-primary)" }}>{topWard.total_complaints ?? 0} complaints</strong> shows the highest bias score in the city —
              avg resolution of <strong style={{ color: "#f87171" }}>{topWard.avg_resolution_days} days</strong> vs city average.
            </p>
            <p>
              This ward has been flagged for elevated urgency scores relative to all other wards.
              A field investigation is recommended to verify resolution quality.
            </p>
          </div>
        )}
        <Link to="/investigate" className="btn btn-primary" style={{ marginTop: "1rem", justifyContent: "center" }}>🤖 Generate Full Brief</Link>
      </div>
    </div>
  );
};


const getCategoryStyle = (cat: string) => {
  const map: Record<string, { bg: string; color: string }> = {
    "Road & Potholes": { bg: "rgba(251,191,36,0.12)", color: "#fbbf24" },
    Sanitation: { bg: "rgba(52,211,153,0.1)", color: "#34d399" },
    Electricity: { bg: "rgba(251,191,36,0.1)", color: "#fbbf24" },
    Drainage: { bg: "rgba(56,189,248,0.1)", color: "#38bdf8" },
    "Water Supply": { bg: "rgba(99,102,241,0.1)", color: "#818cf8" },
    Encroachment: { bg: "rgba(248,113,113,0.1)", color: "#f87171" },
    Noise: { bg: "rgba(139,92,246,0.1)", color: "#a78bfa" },
  };
  return map[cat] || { bg: "rgba(255,255,255,0.06)", color: "#94a3b8" };
};

const getUrgencyColor = (score: number) => {
  if (score >= 80) return "#f87171";
  if (score >= 60) return "#fbbf24";
  return "#34d399";
};



// ─── Component ───────────────────────────────────────────────────────────────
const Dashboard: React.FC<DashboardProps> = ({ activeView }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Derived stats from complaint data
  const openComplaints  = complaints.filter((c) => c.status === "open").length;
  const highUrgency     = complaints.filter((c) => (c.ai_urgency_score ?? c.urgency_score ?? 0) >= 7).length;
  const uniqueWards     = new Set(complaints.map((c) => c.ward_name).filter(Boolean)).size;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8000/api/complaints");
        const data = await response.json();
        setComplaints(data.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch complaints:", error);
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);



  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

      {/* ─── Hero Header ─────────────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg-elevated) 100%)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-xl)",
          padding: "2rem 2.5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "-40%",
            right: "-10%",
            width: "400px",
            height: "400px",
            background: activeView === "authority"
              ? "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(248,113,113,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
          <div>
            {/* View indicator pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                background: activeView === "authority" ? "var(--primary-light)" : "var(--danger-light)",
                border: `1px solid ${activeView === "authority" ? "rgba(59,130,246,0.25)" : "rgba(248,113,113,0.25)"}`,
                borderRadius: "var(--radius-full)",
                padding: "0.3rem 0.875rem",
                marginBottom: "1rem",
              }}
            >
              <span style={{ fontSize: "0.8rem" }}>{activeView === "authority" ? "🏛" : "🌐"}</span>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: activeView === "authority" ? "var(--civic-blue-light)" : "var(--danger)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {activeView === "authority" ? "Authority Dashboard" : "Public Accountability View"}
              </span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2.25rem",
                fontWeight: "700",
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                marginBottom: "0.5rem",
              }}
            >
              {activeView === "authority"
                ? "Bengaluru Civic Command Center"
                : "Civic Accountability Dashboard"}
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
              {activeView === "authority"
                ? "Real-time complaint intelligence, urgency triage, and predictive analytics for ward officers."
                : "Resolution bias analysis, inequality detection, and investigation tools for citizens & journalists."}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.75rem" }}>
            <div
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                padding: "0.75rem 1.25rem",
                textAlign: "right",
              }}
            >
              <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.2rem" }}>
                Last Updated
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                {currentTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                {currentTime.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>

            {activeView === "authority" ? (
              <Link to="/complaint" className="btn btn-primary">
                <span>🚨</span> Report Issue
              </Link>
            ) : (
              <Link to="/investigate" className="btn btn-danger">
                <span>🔍</span> Investigate Ward
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ─── Pattern Alerts (Authority only) ─────────────────────────── */}
      {activeView === "authority" && (
        <div
          style={{
            background: "rgba(248,113,113,0.06)",
            border: "1px solid rgba(248,113,113,0.2)",
            borderRadius: "var(--radius-lg)",
            padding: "1.25rem 1.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  background: "#f87171",
                  borderRadius: "50%",
                  animation: "blink 1.5s infinite",
                  boxShadow: "0 0 8px rgba(248,113,113,0.6)",
                }}
              />
              <span style={{ fontWeight: "600", color: "#f87171", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Active Pattern Alerts
              </span>
              <span
                style={{
                  background: "rgba(248,113,113,0.15)",
                  color: "#f87171",
                  fontSize: "0.7rem",
                  fontWeight: "700",
                  padding: "0.1rem 0.5rem",
                  borderRadius: "var(--radius-full)",
                }}
              >
                {loading ? "…" : openComplaints}
              </span>
            </div>
            <Link to="/triage" style={{ fontSize: "0.8125rem", color: "#f87171", fontWeight: "500" }}>
              View all →
            </Link>
          </div>
          <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Real-time alerts loading from API...
          </div>
        </div>
      )}

      {/* ─── Stats Grid ───────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
        {loading ? (
          [1,2,3,4].map((i) => (
            <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: "1.25rem", minHeight: "90px", opacity: 0.5 }} />
          ))
        ) : [
          { icon: "📋", label: "Total Complaints", value: complaints.length, color: "var(--civic-blue-light)", link: "/triage" },
          { icon: "🔴", label: "Open", value: openComplaints, color: "#f87171", link: "/triage" },
          { icon: "⚡", label: "High Urgency", value: highUrgency, color: "#fbbf24", link: "/triage" },
          { icon: "🏘", label: "Active Wards", value: uniqueWards, color: "#34d399", link: "/" },
        ].map((stat, i) => (
          <div key={i} className="stat-card" style={{ padding: "1.25rem" }}>
            <div style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>{stat.icon}</div>
            <div className="stat-value" style={{ color: stat.color, fontSize: "1.75rem" }}>
              {stat.value}
            </div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ─── Main Grid ────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "1.5rem" }}>
        {/* Left: Map */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minHeight: "520px",
          }}
        >
          <div
            style={{
              padding: "1.25rem 1.5rem",
              borderBottom: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div className="section-title">
              <div className="icon" style={{ background: "var(--primary-light)", fontSize: "0.9rem" }}>🗺</div>
              {activeView === "authority" ? "Ward Complaint Heatmap" : "Inequality Heatmap — Bengaluru"}
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <span
                style={{
                  fontSize: "0.75rem",
                  padding: "0.25rem 0.75rem",
                  background: "rgba(248,113,113,0.1)",
                  color: "#f87171",
                  borderRadius: "var(--radius-full)",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <span style={{ width: "6px", height: "6px", background: "#f87171", borderRadius: "50%", display: "inline-block" }} />
                Hotspot
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  padding: "0.25rem 0.75rem",
                  background: "rgba(59,130,246,0.1)",
                  color: "#60a5fa",
                  borderRadius: "var(--radius-full)",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <span style={{ width: "6px", height: "6px", background: "#60a5fa", borderRadius: "50%", display: "inline-block" }} />
                Normal
              </span>
            </div>
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <HotspotMap />
          </div>
        </div>

        {/* Right: Chart + Activity */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Forecast Chart */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              height: "240px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "1rem 1.25rem",
                borderBottom: "1px solid var(--border-color)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div className="section-title" style={{ fontSize: "1rem" }}>
                <div className="icon" style={{ background: "rgba(99,102,241,0.1)", fontSize: "0.85rem" }}>◈</div>
                7-Day Forecast
              </div>
              <Link to="/forecast" style={{ fontSize: "0.8rem", color: "var(--civic-blue-light)", fontWeight: "500" }}>
                Full view →
              </Link>
            </div>
            <div style={{ flex: 1, padding: "0.5rem", overflow: "hidden" }}>
              <ForecastChart />
            </div>
          </div>

          {/* Bias Table */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "1rem 1.25rem",
                borderBottom: "1px solid var(--border-color)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div className="section-title" style={{ fontSize: "1rem" }}>
                <div className="icon" style={{ background: "rgba(248,113,113,0.1)", fontSize: "0.85rem" }}>⚖</div>
                Bias Rankings
              </div>
              <Link to="/bias" style={{ fontSize: "0.8rem", color: "var(--danger)", fontWeight: "500" }}>
                Full analysis →
              </Link>
            </div>
            <div style={{ flex: 1, overflow: "auto" }}>
              <BiasTable />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Recent Complaints (Authority View) ──────────────────────── */}
      {activeView === "authority" && (
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "1.25rem 1.5rem",
              borderBottom: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div className="section-title">
              <div className="icon" style={{ background: "var(--primary-light)", fontSize: "0.85rem" }}>📋</div>
              Recent Complaints — AI Classified
            </div>
            <Link to="/triage" className="btn btn-secondary btn-sm">
              View Full Queue →
            </Link>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Complaint</th>
                  <th>Category</th>
                  <th>Urgency</th>
                  <th>Ward</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                      Loading real complaints data...
                    </td>
                  </tr>
                ) : complaints.length > 0 ? (
                  complaints.map((c) => {
                    const catStyle = getCategoryStyle(c.predicted_category || c.category || "Other");
                    const urgency = c.ai_urgency_score || c.urgency || 0;
                    const urgencyColor = getUrgencyColor(urgency);
                    return (
                      <tr key={c.id || c.complaint_id}>
                        <td style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--text-tertiary)", fontWeight: "600" }}>
                          {c.complaint_id || c.id}
                        </td>
                        <td style={{ maxWidth: "320px", color: "var(--text-primary)" }}>
                          <span style={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {c.raw_text}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              background: catStyle.bg,
                              color: catStyle.color,
                              padding: "0.25rem 0.625rem",
                              borderRadius: "var(--radius-full)",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {c.predicted_category || c.category || "Other"}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <div style={{ flex: 1, height: "4px", background: "var(--bg-elevated)", borderRadius: "9999px", overflow: "hidden", minWidth: "50px" }}>
                              <div
                                style={{
                                  width: `${urgency}%`,
                                  height: "100%",
                                  background: urgencyColor,
                                  borderRadius: "9999px",
                                }}
                              />
                            </div>
                            <span style={{ fontSize: "0.8125rem", fontWeight: "700", color: urgencyColor, minWidth: "28px" }}>
                              {Math.round(urgency)}
                            </span>
                          </div>
                        </td>
                        <td style={{ fontSize: "0.875rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                          {c.ward_name || c.ward || "N/A"}
                        </td>
                        <td>
                          <span
                            style={{
                              background: "rgba(52,211,153,0.1)",
                              color: "#34d399",
                              padding: "0.2rem 0.6rem",
                              borderRadius: "var(--radius-full)",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Active
                          </span>
                        </td>
                        <td style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>
                          {c.filed_date ? new Date(c.filed_date).toLocaleDateString() : "N/A"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                      No complaints data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Public Accountability Highlight (Public View) ───────────── */}
      {activeView === "public" && (
        <PublicHighlights />
      )}

    </div>
  );
};

export default Dashboard;
