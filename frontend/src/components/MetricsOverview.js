import React from "react";

const Row = ({ label, value, postfix = "" }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
    <span style={{ color: "#475569" }}>{label}</span>
    <strong>{value}{postfix}</strong>
  </div>
);

const Progress = ({ value = 0 }) => {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  return (
    <div style={{ height: 10, background: "#f1f5f9", borderRadius: 999 }}>
      <div style={{ width: `${pct}%`, height: "100%", background: "#0ea5e9", borderRadius: 999 }} />
    </div>
  );
};

export default function MetricsOverview({ metrics }) {
  if (!metrics) return null;

  const consult = metrics?.consult_hours || {};
  const adherence = metrics?.adherence || {};
  const queries = metrics?.queries || {};
  const consultEntries = Object.entries(consult);
  const totalHours = consultEntries.reduce((acc, [, v]) => acc + (Number(v) || 0), 0);

  return (
    <div style={wrap}>
      <div style={card}>
        <h3 style={title}>Consult Hours</h3>
        <div>
          {(consultEntries.length ? consultEntries : [["—", 0]]).map(([k, v]) => (
            <Row key={k} label={titleCase(k)} value={(v ?? 0).toFixed(1)} postfix="h" />
          ))}
          <div style={{ marginTop: 8, borderTop: "1px solid #e2e8f0", paddingTop: 8 }}>
            <Row label="Total" value={totalHours.toFixed(1)} postfix="h" />
          </div>
        </div>
      </div>

      <div style={card}>
        <h3 style={title}>Adherence</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
          {[
            ["overall", adherence?.overall],
            ["zone2_exercise", adherence?.zone2_exercise],
            ["strength", adherence?.strength],
            ["nutrition", adherence?.nutrition],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#475569" }}>{labelize(k)}</span>
                <strong>{Math.round((v ?? 0) * 100)}%</strong>
              </div>
              <Progress value={v ?? 0} />
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <h3 style={title}>Conversation Cadence</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "#475569" }}>Member-initiated / week</span>
              <strong>{queries?.member_initiated_per_week ?? 0}</strong>
            </div>
            <Progress value={normalize(queries?.member_initiated_per_week, 0, 12)} />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "#475569" }}>Elyx-initiated / week</span>
              <strong>{queries?.elyx_initiated_per_week ?? 0}</strong>
            </div>
            <Progress value={normalize(queries?.elyx_initiated_per_week, 0, 12)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function labelize(s = "") {
  return s.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}
function titleCase(s = "") {
  return s
    .replace(/_/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
function normalize(v, min, max) {
  const x = Number(v) || 0;
  if (max <= min) return 0;
  return Math.max(0, Math.min(1, (x - min) / (max - min)));
}

const wrap = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 };
const card = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 };
const title = { margin: 0, paddingBottom: 8, borderBottom: "1px solid #e2e8f0", fontSize: 16 };
