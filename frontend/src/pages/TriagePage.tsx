import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { updateComplaint } from "../api/api";

const CATEGORIES = ["Road & Potholes", "Drainage", "Sanitation & Garbage", "Streetlight", "Water Supply", "Encroachment", "Electricity", "Other"];



const getCategoryIcon = (cat: string) => {
    const icons: Record<string, string> = {
        "Road & Potholes": "🚧",
        "Drainage": "🌊",
        "Sanitation & Garbage": "🗑",
        "Streetlight": "💡",
        "Water Supply": "💧",
        "Encroachment": "🚫",
        "Electricity": "⚡",
        "Other": "📋",
    };
    return icons[cat] || "📋";
};

const TriagePage: React.FC = () => {
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterCategory, setFilterCategory] = useState("all");
    const [sortBy, setSortBy] = useState("urgency");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedComplaint, setSelectedComplaint] = useState<number | null>(null);
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [officerInput, setOfficerInput] = useState("");

    const assignOfficer = async (id: number) => {
        if (!officerInput) return;
        try {
            await updateComplaint(id, { officer_id: officerInput });
            setComplaints(complaints.map((c: any) => 
                (c.id === id || c.complaint_id === id) 
                ? { ...c, officer_id: officerInput } 
                : c
            ));
            setOfficerInput("");
        } catch (err) {
            console.error("Failed to assign:", err);
        }
    };

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                setLoading(true);
                const response = await fetch("/api/complaints");
                const data = await response.json();
                setComplaints(data);
            } catch (error) {
                console.error("Failed to fetch complaints:", error);
                setComplaints([]);
            } finally {
                setLoading(false);
            }
        };

        fetchComplaints();
    }, []);

    const processedComplaints = complaints.map((c) => ({
        id: c.id || c.complaint_id,
        code: c.complaint_id || "N/A",
        text: c.raw_text || "",
        category: c.predicted_category || c.category || "Other",
        urgency: c.ai_urgency_score || c.urgency || 0,
        ward: c.ward_name || c.ward || "N/A",
        status: c.status || "open",
        filed: c.filed_date || new Date().toISOString(),
        department: "BBMP",
        officer: c.officer_id || null,
        severity_keywords: [],
    }));

    const updateComplaintStatus = async (id: number, newStatus: string) => {
        try {
            await fetch(`/api/complaints/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            setComplaints(complaints.map((c: any) => (c.id === id || c.complaint_id === id) ? { ...c, status: newStatus } : c));
            if (selectedComplaint === id) {
                // If you want to handle auto-deselecting or keeping it selected
            }
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    const filtered = processedComplaints.filter((c) => {
        if (filterStatus !== "all" && c.status !== filterStatus) return false;
        if (filterCategory !== "all" && c.category !== filterCategory) return false;
        if (searchQuery && !c.text.toLowerCase().includes(searchQuery.toLowerCase()) && !c.ward.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    }).sort((a, b) => {
        if (sortBy === "urgency") return b.urgency - a.urgency;
        if (sortBy === "newest") return 0;
        return 0;
    });

    const selected = selectedComplaint !== null ? processedComplaints.find((c) => c.id === selectedComplaint) : null;

    const getStatusBg = (s: string) => {
        if (s === "open") return { bg: "rgba(248,113,113,0.1)", color: "#f87171", label: "Open" };
        if (s === "in_progress") return { bg: "rgba(251,191,36,0.1)", color: "#fbbf24", label: "In Progress" };
        return { bg: "rgba(52,211,153,0.1)", color: "#34d399", label: "Resolved" };
    };

    const getUrgencyColor = (u: number) => {
        if (u >= 80) return "#f87171";
        if (u >= 60) return "#fbbf24";
        return "#34d399";
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "0.5rem", fontWeight: "500" }}>
                        ← Back to Dashboard
                    </Link>
                    <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.875rem", fontWeight: "700", letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>
                        AI Triage Queue
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
                        Urgency-sorted complaints classified by distilBERT · {filtered.length} complaints shown
                    </p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button className="btn btn-secondary btn-sm">📥 Export CSV</button>
                    <Link to="/complaint" className="btn btn-primary btn-sm">+ New Complaint</Link>
                </div>
            </div>

            {/* Filter Bar */}
            <div
                style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-lg)",
                    padding: "1rem 1.25rem",
                    display: "flex",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                    alignItems: "center",
                }}
            >
                <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
                    <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", fontSize: "0.875rem" }}>🔍</span>
                    <input
                        className="form-input"
                        placeholder="Search complaints or wards..."
                        value={searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: "2.25rem", height: "38px", fontSize: "0.875rem" }}
                    />
                </div>

                <select className="form-select" value={filterStatus} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)} style={{ width: "auto", height: "38px", fontSize: "0.875rem" }}>
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                </select>

                <select className="form-select" value={filterCategory} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterCategory(e.target.value)} style={{ width: "auto", height: "38px", fontSize: "0.875rem" }}>
                    <option value="all">All Categories</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>

                <select className="form-select" value={sortBy} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value)} style={{ width: "auto", height: "38px", fontSize: "0.875rem" }}>
                    <option value="urgency">Sort: Urgency</option>
                    <option value="newest">Sort: Newest</option>
                </select>

                {/* Filter Chips */}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {[
                        { label: "🔴 Critical (80+)", count: complaints.filter(c => c.urgency >= 80).length },
                        { label: "⚡ Open", count: complaints.filter(c => c.status === "open").length },
                    ].map((chip, i) => (
                        <span
                            key={i}
                            style={{
                                fontSize: "0.75rem",
                                padding: "0.25rem 0.75rem",
                                background: "var(--bg-elevated)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "var(--radius-full)",
                                color: "var(--text-secondary)",
                                fontWeight: "500",
                            }}
                        >
                            {chip.label}: {chip.count}
                        </span>
                    ))}
                </div>
            </div>

            {/* Triage List + Detail Panel */}
            <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 380px" : "1fr", gap: "1.25rem" }}>
                {/* Complaint List */}
                <div
                    style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-lg)",
                        overflow: "hidden",
                    }}
                >
                    <div style={{ overflowX: "auto" }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: "40px" }}>Urgency</th>
                                    <th>Complaint</th>
                                    <th>Category</th>
                                    <th>Ward</th>
                                    <th>Status</th>
                                    <th>Officer</th>
                                    <th>Filed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                                            Loading complaints...
                                        </td>
                                    </tr>
                                ) : filtered.map((c) => {
                                    const urgColor = getUrgencyColor(c.urgency);
                                    const statusStyle = getStatusBg(c.status);
                                    const isSelected = selectedComplaint === c.id;
                                    return (
                                        <tr
                                            key={c.id}
                                            onClick={() => setSelectedComplaint(isSelected ? null : c.id)}
                                            style={{
                                                cursor: "pointer",
                                                background: isSelected ? "rgba(59,130,246,0.06)" : "transparent",
                                                borderLeft: isSelected ? "3px solid #3b82f6" : "3px solid transparent",
                                                transition: "all 0.15s ease",
                                            }}
                                        >
                                            <td>
                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                                                    <span style={{ fontWeight: "800", fontSize: "1.1rem", color: urgColor, fontFamily: "var(--font-display)" }}>
                                                        {c.urgency}
                                                    </span>
                                                    <div style={{ width: "28px", height: "3px", background: "var(--bg-elevated)", borderRadius: "9999px", overflow: "hidden" }}>
                                                        <div style={{ width: `${c.urgency}%`, height: "100%", background: urgColor }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ maxWidth: "300px" }}>
                                                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                                                    <span style={{ fontSize: "1rem", marginTop: "1px" }}>{getCategoryIcon(c.category)}</span>
                                                    <div>
                                                        <div style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "var(--text-tertiary)", marginBottom: "0.2rem" }}>{c.code}</div>
                                                        <div style={{ fontSize: "0.875rem", color: "var(--text-primary)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                                            {c.text}
                                                        </div>
                                                        {c.severity_keywords.length > 0 && (
                                                            <div style={{ display: "flex", gap: "0.25rem", marginTop: "0.3rem", flexWrap: "wrap" }}>
                                                                {c.severity_keywords.map((kw) => (
                                                                    <span key={kw} style={{ background: "rgba(248,113,113,0.1)", color: "#f87171", fontSize: "0.65rem", padding: "0.05rem 0.4rem", borderRadius: "3px", fontWeight: "600" }}>
                                                                        ⚠ {kw}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                                                    {c.category}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: "0.875rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{c.ward}</td>
                                            <td>
                                                <span style={{ background: statusStyle.bg, color: statusStyle.color, padding: "0.2rem 0.6rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: "600", whiteSpace: "nowrap" }}>
                                                    {statusStyle.label}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: "0.8rem", color: c.officer ? "var(--text-secondary)" : "var(--text-tertiary)", whiteSpace: "nowrap" }}>
                                                {c.officer || "Unassigned"}
                                            </td>
                                            <td style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>
                                                {c.filed.split(" ")[1]}
                                                <div>{c.filed.split(" ")[0]}</div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Detail Panel */}
                {selected && (
                    <div
                        style={{
                            background: "var(--bg-card)",
                            border: "1px solid var(--border-accent)",
                            borderRadius: "var(--radius-lg)",
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                            animation: "fadeInRight 0.25s ease",
                        }}
                    >
                        <div
                            style={{
                                padding: "1rem 1.25rem",
                                borderBottom: "1px solid var(--border-color)",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <div>
                                <div style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "var(--text-tertiary)", marginBottom: "0.2rem" }}>{selected.code}</div>
                                <div style={{ fontWeight: "700", fontSize: "1rem", color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                                    Complaint Details
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedComplaint(null)}
                                style={{ color: "var(--text-tertiary)", fontSize: "1.25rem", background: "none", border: "none", cursor: "pointer" }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ flex: 1, overflow: "auto", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {/* Urgency */}
                            <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", padding: "1rem" }}>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
                                    AI Urgency Score
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                    <div style={{ fontSize: "2.5rem", fontWeight: "800", color: getUrgencyColor(selected.urgency), fontFamily: "var(--font-display)" }}>
                                        {selected.urgency}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ height: "8px", background: "rgba(255,255,255,0.08)", borderRadius: "9999px", overflow: "hidden", marginBottom: "0.25rem" }}>
                                            <div style={{ width: `${selected.urgency}%`, height: "100%", background: `linear-gradient(90deg, #34d399, ${getUrgencyColor(selected.urgency)})`, borderRadius: "9999px" }} />
                                        </div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                                            {selected.urgency >= 80 ? "🔴 Critical Priority" : selected.urgency >= 60 ? "🟡 High Priority" : "🟢 Normal Priority"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Category & Department */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                                <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", padding: "0.875rem" }}>
                                    <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>Category</div>
                                    <div style={{ fontWeight: "600", fontSize: "0.875rem", color: "var(--text-primary)" }}>
                                        {getCategoryIcon(selected.category)} {selected.category}
                                    </div>
                                </div>
                                <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", padding: "0.875rem" }}>
                                    <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>Department</div>
                                    <div style={{ fontWeight: "600", fontSize: "0.875rem", color: "var(--civic-blue-light)" }}>{selected.department}</div>
                                </div>
                            </div>

                            {/* Complaint Text */}
                            <div>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>Complaint Text</div>
                                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6, background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", padding: "0.875rem" }}>
                                    {selected.text}
                                </p>
                            </div>

                            {/* Ward */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                                <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", padding: "0.875rem" }}>
                                    <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>Ward</div>
                                    <div style={{ fontWeight: "600", fontSize: "0.875rem", color: "var(--text-primary)" }}>📍 {selected.ward}</div>
                                </div>
                                <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", padding: "0.875rem" }}>
                                    <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>Officer</div>
                                    <div style={{ fontWeight: "600", fontSize: "0.875rem", color: "var(--text-secondary)" }}>{selected.officer || "Unassigned"}</div>
                                </div>
                            </div>

                            {/* Assign officer */}
                            {!selected.officer && (
                                <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", padding: "0.875rem" }}>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>Assign Officer</div>
                                    <input 
                                        className="form-input" 
                                        placeholder="Officer name or ID..." 
                                        style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }} 
                                        value={officerInput}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOfficerInput(e.target.value)}
                                    />
                                    <button 
                                        className="btn btn-primary btn-sm" 
                                        style={{ width: "100%", justifyContent: "center" }}
                                        onClick={() => assignOfficer(selected.id)}
                                    >
                                        Assign & Notify
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Action Footer */}
                        <div
                            style={{
                                padding: "1rem 1.25rem",
                                borderTop: "1px solid var(--border-color)",
                                display: "flex",
                                gap: "0.625rem",
                            }}
                        >
                            <button onClick={() => updateComplaintStatus(selected.id, "resolved")} className="btn btn-success btn-sm" style={{ flex: 1, justifyContent: "center" }}>✓ Mark Resolved</button>
                            <button onClick={() => updateComplaintStatus(selected.id, "in_progress")} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: "center" }}>⟳ In Progress</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TriagePage;
