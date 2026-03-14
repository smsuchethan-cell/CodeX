import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ForecastChart from "../components/ForecastChart";
import { getHotspots } from "../api/api";

interface Hotspot {
  ward_name: string;
  cluster_id: number;
  complaint_count: number;
}

const ForecastPage: React.FC = () => {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);

  useEffect(() => {
    getHotspots()
      .then((r) => setHotspots((r.data as Hotspot[]).slice(0, 2)))
      .catch(() => setHotspots([]));
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "0.5rem", fontWeight: "500" }}>
          ← Back to Dashboard
        </Link>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.875rem", fontWeight: "700", letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>
          Complaint Forecast
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
          7-day predictive analytics based on real historical complaint data from PostgreSQL.
        </p>
      </div>

      {/* Main forecast chart */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="section-title">
              <div className="icon" style={{ background: "rgba(99,102,241,0.1)", fontSize: "0.9rem" }}>◈</div>
              7-Day Prediction — All Wards
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginTop: "0.25rem" }}>
              Based on rolling 30-day average from live database
            </div>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            {[
              { color: "#6366f1", label: "Predicted" },
              { color: "rgba(99,102,241,0.3)", label: "Trend Band" },
            ].map((l) => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <div style={{ width: "12px", height: "3px", background: l.color, borderRadius: "2px" }} />
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: "300px", padding: "1rem" }}>
          <ForecastChart />
        </div>
      </div>

      {/* Surge Alert — driven by real hotspot data */}
      {hotspots.length > 0 && (
        <div style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "var(--radius-lg)", padding: "1.5rem", display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
          <div style={{ fontSize: "2rem" }}>⚡</div>
          <div>
            <div style={{ fontWeight: "700", color: "#f87171", fontSize: "1rem", marginBottom: "0.5rem" }}>
              High-Activity Wards — Surge Risk
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Based on current complaint density,{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                {hotspots.map((h) => h.ward_name).join(" and ")}
              </strong>{" "}
              are the highest-activity wards ({hotspots.map((h) => `${h.ward_name}: ${h.complaint_count} complaints`).join(", ")}).
              Recommend pre-deployment of field response teams to these wards.
            </p>
          </div>
        </div>
      )}

      {hotspots.length === 0 && (
        <div style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: "var(--radius-lg)", padding: "1.5rem", color: "var(--text-secondary)", textAlign: "center" }}>
          No hotspot data yet. Submit complaints to see surge predictions.
        </div>
      )}
    </div>
  );
};

export default ForecastPage;
