import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { compareWards, getWards } from "../api/api";

interface WardStats {
  ward_name: string;
  total_complaints: number;
  avg_resolution_days: number;
  bias_score: number;
  overdue: number;
  on_time_rate: number;
  fake_rate: number;
}

interface CompareResult {
  ward_a: WardStats;
  ward_b: WardStats;
  all_wards: string[];
}

const MetricRow = ({
  label, valueA, valueB, unit = "", higherIsBad = false,
}: {
  label: string; valueA: number; valueB: number; unit?: string; higherIsBad?: boolean;
}) => {
  const aWins = higherIsBad ? valueA < valueB : valueA > valueB;
  const bWins = higherIsBad ? valueB < valueA : valueB > valueA;
  const winColor = "#34d399";
  const loseColor = "#f87171";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "1rem", alignItems: "center", padding: "0.75rem 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{ fontWeight: "700", fontSize: "0.9375rem", color: aWins ? winColor : bWins ? loseColor : "var(--text-primary)", textAlign: "right" }}>
        {valueA}{unit}
      </div>
      <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", textAlign: "center", minWidth: "140px" }}>{label}</div>
      <div style={{ fontWeight: "700", fontSize: "0.9375rem", color: bWins ? winColor : aWins ? loseColor : "var(--text-primary)" }}>
        {valueB}{unit}
      </div>
    </div>
  );
};

const ComparePage: React.FC = () => {
  const [wardA, setWardA] = useState("");
  const [wardB, setWardB] = useState("");
  const [wards, setWards] = useState<string[]>([]);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [wardsLoading, setWardsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getWards()
      .then((r) => {
        const w: string[] = r.data;
        setWards(w);
        if (w.length >= 2) { setWardA(w[0]); setWardB(w[1]); }
      })
      .catch(() => setWards([]))
      .finally(() => setWardsLoading(false));
  }, []);

  const handleCompare = async () => {
    if (!wardA || !wardB) return;
    setLoading(true);
    setError(null);
    try {
      const r = await compareWards(wardA, wardB);
      setResult(r.data);
    } catch {
      setError("Could not fetch comparison data. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "0.5rem", fontWeight: "500" }}>
          ← Back to Dashboard
        </Link>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.875rem", fontWeight: "700", letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>
          Ward vs Ward Comparison
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
          Compare any two wards side-by-side — resolution times, bias scores, complaint counts, and more.
        </p>
      </div>

      {/* Ward Picker */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-xl)", padding: "2rem" }}>
        {wardsLoading ? (
          <div style={{ textAlign: "center", color: "var(--text-secondary)", padding: "1rem" }}>Loading wards from database...</div>
        ) : wards.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-secondary)", padding: "1rem" }}>
            No wards found. Submit complaints first to populate ward data.
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "1.5rem", alignItems: "end" }}>
              <div className="form-group">
                <label className="form-label">Ward A</label>
                <select className="form-select" value={wardA} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setWardA(e.target.value); setResult(null); }}>
                  {wards.map((w) => <option key={w}>{w}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", paddingBottom: "0.25rem" }}>
                <div style={{ width: "44px", height: "44px", background: "var(--gradient-primary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.125rem", fontWeight: "700", color: "white", boxShadow: "0 4px 12px rgba(59,130,246,0.4)" }}>⇌</div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: "500" }}>vs</span>
              </div>
              <div className="form-group">
                <label className="form-label">Ward B</label>
                <select className="form-select" value={wardB} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setWardB(e.target.value); setResult(null); }}>
                  {wards.map((w) => <option key={w}>{w}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "1.5rem" }}>
              <button className="btn btn-primary" onClick={handleCompare} disabled={loading || wardA === wardB} style={{ padding: "0.75rem 2.5rem", fontSize: "1rem" }}>
                {loading ? <><div className="spinner" style={{ borderTopColor: "white", width: "16px", height: "16px" }} />Comparing...</> : "⚖️ Compare Wards"}
              </button>
            </div>
          </>
        )}
      </div>

      {error && (
        <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: "var(--radius-md)", padding: "1rem", color: "#f87171", fontSize: "0.9rem" }}>
          ⚠ {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", animation: "fadeIn 0.4s ease" }}>
          {/* Ward Headers */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "1.5rem", alignItems: "stretch" }}>
            {/* Ward A */}
            <div style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(99,102,241,0.05))", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "var(--radius-lg)", padding: "1.5rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏘</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: "700", color: "var(--civic-blue-light)", marginBottom: "0.25rem" }}>{result.ward_a.ward_name}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginBottom: "0.5rem" }}>{result.ward_a.total_complaints} complaints</div>
              <div style={{ display: "inline-block", background: result.ward_a.bias_score >= 60 ? "rgba(248,113,113,0.1)" : result.ward_a.bias_score >= 30 ? "rgba(251,191,36,0.1)" : "rgba(52,211,153,0.1)", color: result.ward_a.bias_score >= 60 ? "#f87171" : result.ward_a.bias_score >= 30 ? "#fbbf24" : "#34d399", padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)", fontSize: "0.8rem", fontWeight: "700" }}>
                Bias Score: {result.ward_a.bias_score}/100
              </div>
            </div>
            {/* VS */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: "1.5rem", color: "var(--text-tertiary)", fontWeight: "700" }}>⇌</div>
            </div>
            {/* Ward B */}
            <div style={{ background: "linear-gradient(135deg, rgba(248,113,113,0.08), rgba(236,72,153,0.04))", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "var(--radius-lg)", padding: "1.5rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏘</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: "700", color: "#f87171", marginBottom: "0.25rem" }}>{result.ward_b.ward_name}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginBottom: "0.5rem" }}>{result.ward_b.total_complaints} complaints</div>
              <div style={{ display: "inline-block", background: result.ward_b.bias_score >= 60 ? "rgba(248,113,113,0.1)" : result.ward_b.bias_score >= 30 ? "rgba(251,191,36,0.1)" : "rgba(52,211,153,0.1)", color: result.ward_b.bias_score >= 60 ? "#f87171" : result.ward_b.bias_score >= 30 ? "#fbbf24" : "#34d399", padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)", fontSize: "0.8rem", fontWeight: "700" }}>
                Bias Score: {result.ward_b.bias_score}/100
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
            <div className="section-title" style={{ marginBottom: "0.5rem" }}>
              <div className="icon" style={{ background: "rgba(99,102,241,0.1)" }}>📊</div>
              Head-to-Head Metrics
            </div>
            <MetricRow label="Avg Resolution Days" valueA={result.ward_a.avg_resolution_days} valueB={result.ward_b.avg_resolution_days} unit=" days" higherIsBad />
            <MetricRow label="Bias Score" valueA={result.ward_a.bias_score} valueB={result.ward_b.bias_score} unit="/100" higherIsBad />
            <MetricRow label="Total Complaints" valueA={result.ward_a.total_complaints} valueB={result.ward_b.total_complaints} />
            <MetricRow label="Overdue Complaints" valueA={result.ward_a.overdue} valueB={result.ward_b.overdue} higherIsBad />
            <MetricRow label="On-Time Resolution %" valueA={result.ward_a.on_time_rate} valueB={result.ward_b.on_time_rate} unit="%" />
          </div>

          {/* Verdict */}
          <div style={{ background: "linear-gradient(135deg, rgba(248,113,113,0.06), rgba(99,102,241,0.04))", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
            <div className="section-title" style={{ marginBottom: "1rem" }}>
              <div className="icon" style={{ background: "rgba(248,113,113,0.1)", fontSize: "0.875rem" }}>⚖</div>
              Statistical Verdict
            </div>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: "0.9375rem" }}>
              Comparing <strong style={{ color: "var(--civic-blue-light)" }}>{result.ward_a.ward_name}</strong> vs{" "}
              <strong style={{ color: "#f87171" }}>{result.ward_b.ward_name}</strong>: the resolution time gap is{" "}
              <strong style={{ color: "#f87171", fontSize: "1.1rem" }}>
                {result.ward_b.avg_resolution_days > 0
                  ? `${(Math.max(result.ward_a.avg_resolution_days, result.ward_b.avg_resolution_days) / Math.max(Math.min(result.ward_a.avg_resolution_days, result.ward_b.avg_resolution_days), 1)).toFixed(1)}×`
                  : "N/A"}
              </strong>{" "}
              for identical complaint categories.{" "}
              {Math.abs(result.ward_a.bias_score - result.ward_b.bias_score) > 30
                ? <strong style={{ color: "#f87171" }}>This gap is statistically significant.</strong>
                : <strong style={{ color: "#fbbf24" }}>This gap requires further investigation.</strong>}
            </p>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
              <Link to="/investigate" className="btn btn-danger btn-sm">🔍 Investigate</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparePage;
