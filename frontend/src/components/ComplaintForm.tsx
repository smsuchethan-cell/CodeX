import React, { useState } from "react";
import ImageUploader from "./ImageUploader";
import { classifyImage, createComplaint } from "../api/api";

const CATEGORIES = [
  "Road & Potholes",
  "Drainage",
  "Sanitation & Garbage",
  "Streetlight",
  "Water Supply",
  "Encroachment",
  "Electricity",
  "Noise",
  "Other"
];

const CATEGORY_ICONS: Record<string, string> = {
  "Road & Potholes": "🚧",
  "Drainage": "🌊",
  "Sanitation & Garbage": "🗑",
  "Streetlight": "💡",
  "Water Supply": "💧",
  "Encroachment": "🚫",
  "Electricity": "⚡",
  "Noise": "🔊",
  "Other": "📋",
};

const WARDS = [
  "BTM Layout", "Koramangala", "Indiranagar", "Whitefield", "Marathahalli",
  "Bellandur", "HSR Layout", "Rajajinagar", "Malleshwaram", "Jayanagar",
  "Shivajinagar", "Hebbal", "Yelahanka", "JP Nagar", "Bommanahalli",
];

const ComplaintForm: React.FC = (): React.JSX.Element => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    predicted_category: string;
    confidence: number;
    needs_manual_confirmation: boolean;
  } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [description, setDescription] = useState("");
  const [ward, setWard] = useState("");
  const [address, setAddress] = useState("");
  const [success, setSuccess] = useState(false);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsAnalyzing(true);
    setResult(null);
    setSuccess(false);

    try {
      const response = await classifyImage(selectedFile);
      setResult(response.data);
      setSelectedCategory(response.data.predicted_category);
    } catch (error) {
      console.error("Classification error:", error);
      // Fallback: show manual category selector so submission is still possible
      setResult({ predicted_category: "Other", confidence: 0, needs_manual_confirmation: true });
      setSelectedCategory("Other");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedCategory) return;
    setIsSubmitting(true);

    try {
      await createComplaint({
        raw_text: description || "Reported via image capture.",
        ward_name: ward || "Unknown",
        latitude: 12.9716,
        longitude: 77.5946,
      });
      setSuccess(true);
    } catch (err) {
      console.error("Failed to submit complaint:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 1rem", animation: "fadeIn 0.4s ease" }}>
        <div
          style={{
            width: "80px",
            height: "80px",
            background: "var(--success-light)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2.5rem",
            margin: "0 auto 1.5rem",
            border: "2px solid rgba(52,211,153,0.3)",
            boxShadow: "0 0 24px rgba(52,211,153,0.15)",
          }}
        >
          ✅
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: "700", marginBottom: "0.75rem" }}>
          Complaint Submitted!
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem", lineHeight: 1.6 }}>
          Your civic issue has been AI-classified as <strong style={{ color: "var(--civic-blue-light)" }}>{selectedCategory}</strong> and routed to the relevant department.
        </p>

        <button
          onClick={() => {
            setFile(null);
            setResult(null);
            setSelectedCategory("");
            setDescription("");
            setWard("");
            setAddress("");
            setSuccess(false);
          }}
          className="btn btn-primary"
          style={{ padding: "0.75rem 2rem" }}
        >
          Submit Another Issue
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Step 1: Photo */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              background: "var(--gradient-primary)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.7rem",
              fontWeight: "700",
              color: "white",
            }}
          >
            1
          </div>
          <h3 style={{ fontWeight: "600", fontSize: "1rem", color: "var(--text-primary)" }}>Photo Evidence</h3>
        </div>
        <ImageUploader onFileSelect={handleFileSelect} isLoading={isAnalyzing} />
      </div>

      {/* AI Result Box */}
      {result && (
        <div
          style={{
            background: result.needs_manual_confirmation
              ? "rgba(251,191,36,0.06)"
              : "rgba(59,130,246,0.06)",
            border: `1px solid ${result.needs_manual_confirmation ? "rgba(251,191,36,0.25)" : "rgba(59,130,246,0.25)"}`,
            borderRadius: "var(--radius-lg)",
            padding: "1.25rem",
            animation: "fadeIn 0.3s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
            <div style={{ fontSize: "1.5rem" }}>{result.needs_manual_confirmation ? "⚠️" : "🤖"}</div>
            <div style={{ flex: 1 }}>
              <h4
                style={{
                  fontWeight: "700",
                  fontSize: "0.9375rem",
                  marginBottom: "0.25rem",
                  color: result.needs_manual_confirmation ? "var(--warning)" : "var(--civic-blue-light)",
                }}
              >
                AI Analysis Complete
              </h4>
              <p style={{ color: "var(--text-secondary)", marginBottom: "1rem", fontSize: "0.875rem" }}>
                Confidence: <strong style={{ color: "var(--text-primary)" }}>{(result.confidence * 100).toFixed(1)}%</strong>
              </p>

              {result.needs_manual_confirmation ? (
                <div>
                  <p style={{ marginBottom: "0.75rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                    Low confidence — please confirm or correct the category:
                  </p>
                  <select
                    className="form-select"
                    value={selectedCategory}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      background: "var(--bg-elevated)",
                      padding: "0.625rem 1rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid rgba(59,130,246,0.2)",
                    }}
                  >
                    <span style={{ fontSize: "1.125rem" }}>{CATEGORY_ICONS[result.predicted_category] || "📋"}</span>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Detected:</span>
                    <span style={{ fontWeight: "700", color: "var(--civic-blue-light)", fontSize: "0.9375rem" }}>
                      {result.predicted_category}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setResult({ ...result, needs_manual_confirmation: true })}
                    style={{
                      display: "block",
                      marginTop: "0.625rem",
                      fontSize: "0.8rem",
                      color: "var(--text-tertiary)",
                      textDecoration: "underline",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Incorrect? Change manually
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {file && (
        <div style={{ opacity: result ? 1 : 0.4, pointerEvents: result ? "auto" : "none", transition: "opacity 0.3s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
            <div
              style={{
                width: "24px",
                height: "24px",
                background: result ? "var(--gradient-primary)" : "var(--bg-elevated)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.7rem",
                fontWeight: "700",
                color: result ? "white" : "var(--text-tertiary)",
                border: result ? "none" : "1px solid var(--border-color)",
              }}
            >
              2
            </div>
            <h3 style={{ fontWeight: "600", fontSize: "1rem", color: "var(--text-primary)" }}>Issue Details</h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="ward-select">Ward</label>
                <select
                  id="ward-select"
                  className="form-select"
                  value={ward}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setWard(e.target.value)}
                >
                  <option value="">Select ward...</option>
                  {WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="address-input">Address / Landmark</label>
                <input
                  id="address-input"
                  className="form-input"
                  placeholder="Near Silk Board junction..."
                  value={address}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Description <span style={{ color: "var(--text-tertiary)", fontWeight: "400" }}>(optional)</span></label>
              <textarea
                id="description"
                className="form-textarea"
                rows={3}
                placeholder="Add specific details about severity, how long it's been an issue, etc..."
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !selectedCategory}
              style={{ padding: "0.75rem 2rem", fontSize: "1rem" }}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" style={{ borderTopColor: "white", width: "16px", height: "16px" }} />
                  Submitting...
                </>
              ) : (
                "Submit Complaint →"
              )}
            </button>
          </div>
        </div>
      )}
    </form>
  );
};

export default ComplaintForm;
