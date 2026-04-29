import React, { useState } from "react";
import { Link } from "react-router-dom";
import { loginUser } from "../api/api";

const Login: React.FC = (): React.JSX.Element => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"officer" | "admin">("officer");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      await loginUser({ email, password, role });
      window.location.href = "/";
    } catch (err) {
      alert("Invalid credentials, please try again.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "75vh",
        padding: "2rem 1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-xl)",
          padding: "2.5rem",
          boxShadow: "var(--shadow-lg)",
          animation: "fadeIn 0.4s ease",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "2rem", justifyContent: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "800",
              color: "white",
              fontSize: "1.125rem",
              fontFamily: "var(--font-display)",
              boxShadow: "0 4px 14px rgba(59,130,246,0.4)",
            }}
          >
            N
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: "700" }}>
            NagaraIQ Authority Portal
          </span>
        </div>

        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: "700", textAlign: "center", marginBottom: "0.375rem" }}>
          Sign In
        </h1>
        <p style={{ color: "var(--text-secondary)", textAlign: "center", fontSize: "0.9rem", marginBottom: "2rem" }}>
          Access the civic intelligence dashboard
        </p>

        {/* Role toggle */}
        <div
          style={{
            display: "flex",
            background: "var(--bg-elevated)",
            borderRadius: "var(--radius-md)",
            padding: "3px",
            marginBottom: "1.5rem",
            gap: "2px",
          }}
        >
          {["officer", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r as "officer" | "admin")}
              style={{
                flex: 1,
                padding: "0.5rem",
                borderRadius: "8px",
                fontSize: "0.8125rem",
                fontWeight: "600",
                cursor: "pointer",
                border: "none",
                fontFamily: "var(--font-body)",
                background: role === r ? "linear-gradient(135deg, #3b82f6, #6366f1)" : "transparent",
                color: role === r ? "white" : "var(--text-secondary)",
                boxShadow: role === r ? "0 2px 8px rgba(59,130,246,0.4)" : "none",
                transition: "all 0.2s ease",
                textTransform: "capitalize",
              }}
            >
              {r === "officer" ? "🏛 Ward Officer" : "👑 Admin"}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="officer@bbmp.gov.in"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              id="login-email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              id="login-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: "0.875rem", fontSize: "1rem", justifyContent: "center", marginTop: "0.5rem" }}
          >
            🔑 Sign In to Dashboard
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <Link
            to="/"
            style={{ color: "var(--civic-blue-light)", fontSize: "0.875rem", fontWeight: "500" }}
          >
            ← Return to Public View
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
