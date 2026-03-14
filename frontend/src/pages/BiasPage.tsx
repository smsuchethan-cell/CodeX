import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BiasTable from "../components/BiasTable";
import { getBiasSummary } from "../api/api";

interface BiasSummary {
  worst_gap: number | null;
  worst_ward_high: string | null;
  worst_ward_low: string | null;
  significant_wards: number;
  city_avg_days: number | null;
  worst_avg_days: number | null;
}

const BiasPage: React.FC = () => {
  const [summary, setSummary] = useState<BiasSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  useEffect(() => {
    getBiasSummary()
      .then((r) => setSummary(r.data))
      .catch(() => setSummary(null))
      .finally(() => setSummaryLoading(false));
  }, []);

  const insightCards = summary
    ? [
        {
          icon: "⚖️",
          title: "Worst Bias Gap",
          value: summary.worst_gap ? `${summary.worst_gap}×` : "—",
          sub: summary.worst_ward_high && summary.worst_ward_low
            ? `${summary.worst_ward_high} vs ${summary.worst_ward_low}`
            : "No data yet",
          color: "#f87171",
          gradient: "linear-gradient(135deg, rgba(248,113,113,0.1), rgba(236,72,153,0.06))",
        },
        {
          icon: "📊",
          title: "High-Bias Wards",
          value: `${summary.significant_wards} wards`,
          sub: "Bias score ≥ 50 — resolution inequality detected",
          color: "#fbbf24",
          gradient: "linear-gradient(135deg, rgba(251,191,36,0.1), rgba(249,115,22,0.06))",
        },
        {
          icon: "🔴",
          title: "City Avg Resolution",
          value: summary.city_avg_days ? `${summary.city_avg_days} days` : "—",
          sub: summary.worst_avg_days
            ? `vs ${summary.worst_avg_days} days in worst ward`
            : "No resolution data yet",
          color: "#34d399",
          gradient: "linear-gradient(135deg, rgba(52,211,153,0.1), rgba(20,184,166,0.06))",
        },
      ]
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "0.5rem", fontWeight: "500" }}>
          ← Back to Dashboard
        </Link>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.875rem", fontWeight: "700", letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>
          Resolution Bias Detector
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
          Statistical analysis of resolution time inequality across Bengaluru wards — powered by real complaint data.
        </p>
      </div>

      {/* Insight Cards */}
      {summaryLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: "100px", borderRadius: "12px" }} />
          ))}
        </div>
      ) : summary && insightCards.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          {insightCards.map((card, i) => (
            <div key={i} className="stat-card" style={{ background: card.gradient, borderColor: `${card.color}30` }}>
              <div style={{ fontSize: "1.5rem" }}>{card.icon}</div>
              <div className="stat-value" style={{ color: card.color, fontSize: "1.75rem" }}>{card.value}</div>
              <div className="stat-label">{card.title}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>{card.sub}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: "1.5rem", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", color: "var(--text-secondary)", textAlign: "center" }}>
          No bias data yet — submit some complaints first to see statistics.
        </div>
      )}

      {/* Live Bias Table */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="section-title">
            <div className="icon" style={{ background: "rgba(248,113,113,0.1)", fontSize: "0.85rem" }}>⚖</div>
            Bias Rankings — All Monitored Wards
          </div>
          <Link to="/investigate" className="btn btn-danger btn-sm">🔍 Investigate Top Ward</Link>
        </div>
        <div style={{ padding: "1rem" }}>
          <BiasTable />
        </div>
      </div>
    </div>
  );
};

export default BiasPage;
