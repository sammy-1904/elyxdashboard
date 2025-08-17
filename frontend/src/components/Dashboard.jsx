import React, { useEffect, useMemo, useState } from "react";
import { eventAPI } from "../services/api";
import MemberProfileCard from "./MemberProfileCard";
import MetricsOverview from "./MetricsOverview";
import JourneyTimeline from "./JourneyTimeline";
import ConversationLog from "./ConversationLog";
import DecisionModal from "./DecisionModal";

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [journey, setJourney] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [activeView, setActiveView] = useState("overview");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const [pRes, mRes, jRes, cRes, dRes] = await Promise.all([
          eventAPI.getMemberProfile(),
          eventAPI.getMetrics(),
          eventAPI.getJourney(),
          eventAPI.getConversations(),
          eventAPI.getDecisions?.() || Promise.resolve({ data: [] }),
        ]);

        if (!isMounted) return;

        setProfile(pRes?.data?.member || pRes?.data || null);
        setMetrics(mRes?.data || null);

        const j = Array.isArray(jRes?.data) ? jRes.data : [];
        setJourney(j);

        let conv = [];
        const cd = cRes?.data;
        if (Array.isArray(cd)) {
          if (cd.length && typeof cd[0] === "object" && "conversations" in cd[0]) {
            cd.forEach((ep) => {
              conv = conv.concat(ep?.conversations || []);
            });
          } else {
            conv = cd;
          }
        }
        setConversations(conv);

        const dec = dRes?.data || [];
        setDecisions(dec);

        setError("");
      } catch (e) {
        console.error(e);
        setError(e?.message || "Failed to load data");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const totals = useMemo(() => {
    const msg = (journey || []).reduce(
      (acc, ep) => acc + (ep?.metrics?.messages || ep?.conversations?.length || 0),
      0
    );
    const decisionsCount = (journey || []).reduce(
      (acc, ep) => acc + (ep?.metrics?.decisions || 0),
      0
    );
    return { msg, decisionsCount };
  }, [journey]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div>Loding Elyx Dashboard...</div>
        <div style={{ marginTop: 10, fontSize: '0.9rem', color: '#666' }}>
          Analyzing member data and journey
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, color: '#dc3545' }}>
        <h3>Dashboard Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="elyx-dashboard" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{
        background: '#f8f9fa',
        padding: '20px 30px',
        borderBottom: '2px solid #dee2e6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, color: '#2c3e50' }}>Elyx Member Dashboard</h1>
          <p style={{ margin: '5px 0 0', color: '#6c757d' }}>
            {profile?.name || 'Member'}'s Health Journey & Decision Tracking
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setActiveView("overview")}
            style={{
              padding: '8px 16px',
              border: activeView === "overview" ? '2px solid #007bff' : '1px solid #dee2e6',
              background: activeView === "overview" ? '#e7f3ff' : 'white',
              borderRadius: 6,
              cursor: 'pointer'
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView("timeline")}
            style={{
              padding: '8px 16px',
              border: activeView === "timeline" ? '2px solid #007bff' : '1px solid #dee2e6',
              background: activeView === "timeline" ? '#e7f3ff' : 'white',
              borderRadius: 6,
              cursor: 'pointer'
            }}
          >
            Journey
          </button>
          <button
            onClick={() => setActiveView("conversations")}
            style={{
              padding: '8px 16px',
              border: activeView === "conversations" ? '2px solid #007bff' : '1px solid #dee2e6',
              background: activeView === "conversations" ? '#e7f3ff' : 'white',
              borderRadius: 6,
              cursor: 'pointer'
            }}
          >
            Communications
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: 30 }}>
        {/* Key Stats Bar */}
        <section style={{
          display: 'flex',
          gap: 20,
          marginBottom: 30,
          flexWrap: 'wrap'
        }}>
          <div style={{
            flex: '1 1 200px',
            background: '#fff3cd',
            padding: 20,
            borderRadius: 8,
            border: '1px solid #ffeaa7'
          }}>
            <h4 style={{ margin: 0, color: '#856404' }}>Total Messages</h4>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#856404' }}>
              {totals.msg}
            </div>
          </div>
          <div style={{
            flex: '1 1 200px',
            background: '#d1ecf1',
            padding: 20,
            borderRadius: 8,
            border: '1px solid #74c0fc'
          }}>
            <h4 style={{ margin: 0, color: '#0c5460' }}>Decisions Made</h4>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0c5460' }}>
              {decisions.length || totals.decisionsCount}
            </div>
          </div>
          <div style={{
            flex: '1 1 200px',
            background: '#d4edda',
            padding: 20,
            borderRadius: 8,
            border: '1px solid #51cf66'
          }}>
            <h4 style={{ margin: 0, color: '#155724' }}>Journey Episodes</h4>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#155724' }}>
              {journey.length}
            </div>
          </div>
        </section>

        {/* Dynamic Content Based on Active View */}
        {activeView === "overview" && (
          <section style={{ display: 'flex', gap: 30, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 350px', minWidth: 300 }}>
              <MemberProfileCard profile={profile} />
            </div>
            <div style={{ flex: '2 1 500px', minWidth: 450 }}>
              <MetricsOverview metrics={metrics} />
            </div>
          </section>
        )}

        {activeView === "timeline" && (
          <section>
            <h2 style={{ marginBottom: 10, color: '#2c3e50' }}>Member Journey Timeline</h2>
            <p style={{ color: '#6c757d', marginBottom: 20 }}>
              Interactive timeline showing key events, decisions, and progress milestones
            </p>
            <JourneyTimeline 
              journey={journey} 
              decisions={decisions}
              onDecisionClick={setSelectedDecision} 
            />
          </section>
        )}

        {activeView === "conversations" && (
          <section>
            <h2 style={{ marginBottom: 10, color: '#2c3e50' }}>Communications & Decisions</h2>
            <p style={{ color: '#6c757d', marginBottom: 20 }}>
              Search conversations and click on highlighted messages to see decision details
            </p>
            <ConversationLog
              conversations={conversations}
              decisions={decisions}
              onDecisionClick={setSelectedDecision}
            />
          </section>
        )}
      </main>

      {/* Decision Modal */}
      {selectedDecision && (
        <DecisionModal
          decision={selectedDecision}
          visible={!!selectedDecision}
          onClose={() => setSelectedDecision(null)}
        />
      )}
    </div>
  );
}
