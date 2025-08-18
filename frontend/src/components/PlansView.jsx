// components/PlansView.jsx
import React, { useEffect, useState } from "react";

export default function PlansView({ isMobile }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/plans");
        if (!res.ok) throw new Error("Failed to fetch plans");
        const data = await res.json();
        setPlans(data || []);
      } catch (err) {
        setError(err.message || "Error loading plans");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Loading plans...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2 style={{ marginBottom: 20, fontSize: 22, fontWeight: 700 }}>📅 Member Plans</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
        }}
      >
        {plans.map((p, i) => (
          <div
            key={i}
            style={{
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: 16,
              boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
            }}
          >
            <h3 style={{ margin: 0, fontSize: 16 }}>
              Month {p.month}, Week {p.week}
            </h3>
            <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0" }}>
              {p.timestamp} — <b>{p.provider}</b>
            </p>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              {p.category}
            </p>
            <div
              style={{
                background: "#f8fafc",
                padding: 12,
                borderRadius: 8,
                fontSize: 13,
                whiteSpace: "pre-wrap",
              }}
            >
              {Object.entries(p.plan).map(([key, value]) => (
                <div key={key} style={{ marginBottom: 8 }}>
                  <strong style={{ color: "#1d4ed8" }}>{key}:</strong>{" "}
                  {Array.isArray(value) ? (
                    <ul style={{ margin: "4px 0 0 16px" }}>
                      {value.map((v, idx) => (
                        <li key={idx}>{v}</li>
                      ))}
                    </ul>
                  ) : typeof value === "object" ? (
                    <pre style={{ margin: 0 }}>{JSON.stringify(value, null, 2)}</pre>
                  ) : (
                    <span>{value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
