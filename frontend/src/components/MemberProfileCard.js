import React from "react";

const Badge = ({ children }) => (
  <span
    style={{
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: 999,
      background: "#f1f5f9",
      border: "1px solid #e2e8f0",
      marginRight: 8,
      marginBottom: 8,
      fontSize: 12,
    }}
  >
    {children}
  </span>
);

export default function MemberProfileCard({ profile }) {
  if (!profile) return null;

  const {
    name,
    age,
    residence,
    travel_hubs = [],
    occupation,
    health_goals = [],
    motivations,
    wearables = [],
    preferences = {},
  } = profile || {};

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <h2 style={{ margin: 0, fontSize: 20 }}>Member Profile</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <div style={label}>Name</div>
          <div style={value}>{name || "—"}</div>
        </div>
        <div>
          <div style={label}>Age</div>
          <div style={value}>{age ?? "—"}</div>
        </div>
        <div>
          <div style={label}>Residence</div>
          <div style={value}>{residence || "—"}</div>
        </div>
        <div>
          <div style={label}>Occupation</div>
          <div style={value}>{occupation || "—"}</div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={label}>Travel Hubs</div>
        <div>{(travel_hubs || []).length ? travel_hubs.map((t, i) => <Badge key={i}>{t}</Badge>) : "—"}</div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={label}>Health Goals</div>
        <ul style={{ margin: "8px 0 0 16px" }}>
          {(health_goals || []).length ? health_goals.map((g, i) => <li key={i}>{g}</li>) : <li>—</li>}
        </ul>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={label}>Motivations</div>
        <div style={value}>{motivations || "—"}</div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={label}>Wearables</div>
        <div>{(wearables || []).length ? wearables.map((w, i) => <Badge key={i}>{w}</Badge>) : "—"}</div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={label}>Preferences</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <div style={{ ...miniLabel }}>Communication</div>
            <div style={value}>{preferences?.communication || "—"}</div>
          </div>
          <div>
            <div style={{ ...miniLabel }}>Reports</div>
            <div style={value}>{preferences?.reports || "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: 16,
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};

const headerStyle = { marginBottom: 12, borderBottom: "1px solid #e2e8f0", paddingBottom: 8 };
const label = { fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.4 };
const miniLabel = { fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.4 };
const value = { fontSize: 14, color: "#0f172a", marginTop: 4 };
