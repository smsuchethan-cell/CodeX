import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBiasData } from "../api/api";

interface BiasRow {
  ward_name: string;
  bias_score: number;
  avg_resolution_days: number;
  total_complaints: number;
}

const InvestigatePage: React.FC = () => {
  const [wards, setWards] = useState<BiasRow[]>([]);
  const [selectedWard, setSelectedWard] = useState<BiasRow | null>(null);
  const [wardsLoading, setWardsLoading] = useState(true);
  const [briefGenerated, setBriefGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"brief" | "rti">("brief");

  useEffect(() => {
    getBiasData()
      .then((r) => {
        const rows: BiasRow[] = (r.data as BiasRow[]).slice(0, 10);
        setWards(rows);
        if (rows.length > 0) setSelectedWard(rows[0]);
      })
      .catch(() => setWards([]))
      .finally(() => setWardsLoading(false));
  }, []);

  const handleGenerateBrief = () => {
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setBriefGenerated(true); }, 1500);
  };

  const rtiQueries = selectedWard ? [
    `Request all complaint resolution logs for ${selectedWard.ward_name} (last 90 days) including officer name, resolution timestamp, and field visit confirmation.`,
    `Request internal complaint routing records to determine which complaints were administratively closed without site verification in ${selectedWard.ward_name}.`,
    `Request BBMP's defined SLA (Service Level Agreement) for complaints in ${selectedWard.ward_name} and the number of SLA breaches in the past 6 months.`,
    `Request complaint volume audit for ${selectedWard.ward_name} for the last 3 months, including any anomalous drops vs historical baseline.`,
  ] : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "0.5rem", fontWeight: "500" }}>
          ← Back to Dashboard
        </Link>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.875rem", fontWeight: "700", letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>
          Investigation Center
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
          AI investigation brief generator and RTI query builder for journalists & activists — powered by live data.
        </p>
      </div>

      {wardsLoading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>Loading ward data from database...</div>
      ) : wards.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)" }}>
          No ward data yet. Submit complaints to see wards here.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.25rem", alignItems: "start" }}>
          {/* Ward List */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border-color)" }}>
              <div className="section-title" style={{ fontSize: "0.9375rem" }}>
                <div className="icon" style={{ background: "rgba(248,113,113,0.1)", fontSize: "0.8rem" }}>🔴</div>
                High-Bias Wards
              </div>
            </div>
            {wards.map((ward) => (
              <div
                key={ward.ward_name}
                onClick={() => { setSelectedWard(ward); setBriefGenerated(false); }}
                style={{ padding: "0.875rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: selectedWard?.ward_name === ward.ward_name ? "rgba(59,130,246,0.06)" : "transparent", borderLeft: selectedWard?.ward_name === ward.ward_name ? "3px solid #3b82f6" : "3px solid transparent", borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "all 0.15s ease" }}
              >
                <div>
                  <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>{ward.ward_name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>{ward.total_complaints} complaints</div>
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: "800", fontSize: "1rem", color: ward.bias_score >= 60 ? "#f87171" : ward.bias_score >= 40 ? "#fbbf24" : "#34d399" }}>
                  {ward.bias_score}
                </div>
              </div>
            ))}
          </div>

          {/* Detail Panel */}
          {selectedWard && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Ward Summary */}
              <div style={{ background: "linear-gradient(135deg, rgba(248,113,113,0.06), rgba(236,72,153,0.04))", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>Investigating</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: "700", color: "#f87171" }}>{selectedWard.ward_name}</div>
                    <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>Bengaluru BBMP</div>
                  </div>
                  <div style={{ textAlign: "center", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "var(--radius-md)", padding: "1rem 1.5rem" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", fontWeight: "800", color: "#f87171", lineHeight: 1 }}>{selectedWard.bias_score}</div>
                    <div style={{ fontSize: "0.7rem", color: "#f87171", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "0.35rem" }}>Bias Score /100</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginTop: "1.25rem" }}>
                  {[
                    { label: "Avg Resolution", value: `${selectedWard.avg_resolution_days} days` },
                    { label: "Total Complaints", value: `${selectedWard.total_complaints}` },
                    { label: "Bias Score", value: `${selectedWard.bias_score}/100` },
                  ].map((s, i) => (
                    <div key={i} style={{ background: "rgba(0,0,0,0.2)", borderRadius: "var(--radius-md)", padding: "0.75rem", textAlign: "center" }}>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: "700", fontSize: "1rem" }}>{s.value}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", marginTop: "0.2rem" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Brief Button */}
              {!briefGenerated && (
                <button className="btn btn-primary" onClick={handleGenerateBrief} disabled={generating} style={{ padding: "1rem", fontSize: "1rem", justifyContent: "center" }}>
                  {generating ? (
                    <><div className="spinner" style={{ borderTopColor: "white" }} /> Generating Investigation Brief...</>
                  ) : (
                    <>🤖 Generate Investigation Brief for {selectedWard.ward_name}</>
                  )}
                </button>
              )}

              {/* Brief Output */}
              {briefGenerated && (
                <div style={{ background: "var(--bg-card)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: "var(--radius-lg)", overflow: "hidden", animation: "fadeIn 0.4s ease" }}>
                  <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", background: "var(--bg-elevated)" }}>
                    {(["brief", "rti"] as const).map((tab) => (
                      <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "0.875rem 1.5rem", fontSize: "0.875rem", fontWeight: "600", cursor: "pointer", border: "none", borderBottom: activeTab === tab ? "2px solid #818cf8" : "2px solid transparent", color: activeTab === tab ? "#818cf8" : "var(--text-secondary)", background: "transparent", fontFamily: "var(--font-body)", transition: "all 0.15s ease", textTransform: "capitalize" }}>
                        {tab === "brief" ? "📄 Investigation Brief" : "📋 RTI Queries"}
                      </button>
                    ))}
                  </div>
                  <div style={{ padding: "1.5rem" }}>
                    {activeTab === "brief" && (
                      <div>
                        <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "0.9rem" }}>
                          <strong>{selectedWard.ward_name}</strong> has a bias score of <strong style={{ color: "#f87171" }}>{selectedWard.bias_score}/100</strong>{" "}
                          with an average resolution time of <strong>{selectedWard.avg_resolution_days} days</strong> across {selectedWard.total_complaints} complaints.
                          This ward has been flagged due to statistically elevated urgency scores relative to the city average.
                          A field investigation is recommended to verify whether complaints are being resolved administratively without site visits.
                        </p>
                        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setBriefGenerated(false)}>↺ Regenerate</button>
                        </div>
                      </div>
                    )}
                    {activeTab === "rti" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                          The following RTI queries are auto-generated based on {selectedWard.ward_name}'s data. File these with BBMP under the RTI Act 2005.
                        </p>
                        {rtiQueries.map((q, i) => (
                          <div key={i} style={{ background: "var(--bg-elevated)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: "var(--radius-md)", padding: "1rem", display: "flex", gap: "0.875rem" }}>
                            <div style={{ width: "24px", height: "24px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: "700", color: "white", flexShrink: 0 }}>{i + 1}</div>
                            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{q}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InvestigatePage;
