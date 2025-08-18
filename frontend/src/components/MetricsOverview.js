import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";

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

  const consult = metrics?.team_utilization || {};
  const adherence = metrics?.adherence_tracking || {};
  const queries = metrics?.communication_stats || {};
  const consultEntries = Object.entries(consult);
  const totalHours = consultEntries.reduce((acc, [, v]) => acc + (Number(v) || 0), 0);

  return (
    <div style={wrap}>
      {/* <div style={card}>
        <h3 style={title}>Consult Hours</h3>
        <div>
          {(consultEntries.length ? consultEntries : [["—", 0]]).map(([k, v]) => (
            <Row key={k} label={titleCase(k)} value={(v ?? 0).toFixed(1)} postfix="h" />
          ))}
          <div style={{ marginTop: 8, borderTop: "1px solid #e2e8f0", paddingTop: 8 }}>
            <Row label="Total" value={totalHours.toFixed(1)} postfix="h" />
          </div>
        </div>
      </div> */}
      <div style={card}>
  <h3 style={title}>Consult Hours</h3>
  <BarChart
    width={350}
    height={250}
    data={(consultEntries.length ? consultEntries : [["—", 0]]).map(([k, v]) => ({
      name: titleCase(k),
      hours: v ?? 0,
    }))}
    margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
  >
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar dataKey="hours" fill="#3b82f6" radius={[6, 6, 0, 0]} />
  </BarChart>
</div>


      {/* <div style={card}>
        <h3 style={title}>Adherence</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
          {[
            ["overall", adherence?.overall_adherence],
            ["zone2_exercise", adherence?.zone2_exercise],
            ["strength", adherence?.strength_training],
            ["nutrition", adherence?.nutrition_goals],
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
      </div> */}
      <div style={card}>
  <h3 style={title}>Adherence</h3>
  <PieChart width={300} height={300}>
    <Pie
      data={[
        { name: "Overall", value: Math.round((adherence?.overall_adherence ?? 0) * 100) },
        { name: "Zone 2 Exercise", value: Math.round((adherence?.zone2_exercise ?? 0) * 100) },
        { name: "Strength Training", value: Math.round((adherence?.strength_training ?? 0) * 100) },
        { name: "Nutrition", value: Math.round((adherence?.nutrition_goals ?? 0) * 100) },
      ]}
      cx="50%"
      cy="50%"
      innerRadius={70}
      outerRadius={100}
      paddingAngle={4}
      dataKey="value"
    >
      {[
        "#3b82f6", // blue
        "#10b981", // green
        "#f59e0b", // amber
        "#ef4444", // red
      ].map((color, index) => (
        <Cell key={index} fill={color} />
      ))}
    </Pie>
    <Tooltip />
    <Legend />
  </PieChart>
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
              <span style={{ color: "#475569" }}>Team-initiated / week</span>
              <strong>{queries?.team_initiated_per_week ?? 0}</strong>
            </div>
            <Progress value={normalize(queries?.team_initiated_per_week, 0, 12)} />
          </div>
          <div style={{ marginTop: 8, borderTop: "1px solid #e2e8f0", paddingTop: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "#475569", fontSize: "14px" }}>Member triggers</span>
                  <strong style={{ fontSize: "14px" }}>{queries?.member_triggers ?? 0}</strong>
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "#475569", fontSize: "14px" }}>Elyx triggers</span>
                  <strong style={{ fontSize: "14px" }}>{queries?.elyx_triggers ?? 0}</strong>
                </div>
              </div>
            </div>
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

const wrap = { 
  display: "grid", 
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
  gap: 16 
};
const card = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 };
const title = { margin: 0, paddingBottom: 8, borderBottom: "1px solid #e2e8f0", fontSize: 16 };
