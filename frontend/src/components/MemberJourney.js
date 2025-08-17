import React, { useState } from "react";

export default function JourneyDashboard({ journey, decisions, conversations }) {
  const [viewMode, setViewMode] = useState("phases"); // phases, timeline, domains, decisions

  const renderPhaseView = () => (
    <div className="phases-grid">
      {journey.map((episode, index) => (
        <div key={episode.id} className="phase-card">
          <div className="phase-header">
            <div className="phase-number">{index + 1}</div>
            <h3>{episode.title}</h3>
            <span className="phase-duration">{episode.metrics.total_messages} messages</span>
          </div>
          
          <div className="phase-metrics">
            <div className="metric">
              <span className="label">Decisions</span>
              <span className="value">{episode.metrics.decisions}</span>
            </div>
            <div className="metric">
              <span className="label">Topics</span>
              <span className="value">{episode.metrics.primary_topics.length}</span>
            </div>
          </div>

          <div className="key-decisions">
            {decisions
              .filter(d => episode.conversations.some(c => c.id === d.conversation_id))
              .slice(0, 2)
              .map(decision => (
                <div key={decision.id} className="decision-summary">
                  🎯 {decision.decision.substring(0, 60)}...
                </div>
              ))
            }
          </div>

          <div className="phase-status">
            <span className={`status ${index < journey.length - 1 ? 'completed' : 'active'}`}>
              {index < journey.length - 1 ? 'Completed' : 'Active'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderHealthDomains = () => {
    const domains = {
      "Labs & Diagnostics": { color: "#e74c3c", icon: "🔬" },
      "Exercise": { color: "#f39c12", icon: "💪" },
      "Nutrition": { color: "#27ae60", icon: "🥗" },
      "Sleep & Recovery": { color: "#3498db", icon: "😴" },
      "Travel/Logistics": { color: "#9b59b6", icon: "✈️" }
    };

    return (
      <div className="domains-grid">
        {Object.entries(domains).map(([domain, config]) => {
          const domainConversations = conversations.filter(c => c.topic === domain);
          const domainDecisions = decisions.filter(d => d.topic === domain);
          
          return (
            <div key={domain} className="domain-card" style={{borderLeft: `4px solid ${config.color}`}}>
              <div className="domain-header">
                <span className="domain-icon">{config.icon}</span>
                <h3>{domain}</h3>
              </div>
              
              <div className="domain-stats">
                <div className="stat">
                  <span className="number">{domainConversations.length}</span>
                  <span className="label">Messages</span>
                </div>
                <div className="stat">
                  <span className="number">{domainDecisions.length}</span>
                  <span className="label">Decisions</span>
                </div>
              </div>

              <div className="recent-activity">
                <h4>Recent Activity</h4>
                {domainConversations.slice(-2).map(conv => (
                  <div key={conv.id} className="activity-item">
                    <strong>{conv.sender}:</strong> {conv.message.substring(0, 80)}...
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="journey-dashboard">
      {/* View Mode Selector */}
      <div className="view-selector">
        <button 
          className={viewMode === 'phases' ? 'active' : ''}
          onClick={() => setViewMode('phases')}
        >
          📋 Journey Phases
        </button>
        <button 
          className={viewMode === 'domains' ? 'active' : ''}
          onClick={() => setViewMode('domains')}
        >
          🎯 Health Domains
        </button>
        <button 
          className={viewMode === 'decisions' ? 'active' : ''}
          onClick={() => setViewMode('decisions')}
        >
          💡 Decision Timeline
        </button>
      </div>

      {/* Content */}
      <div className="journey-content">
        {viewMode === 'phases' && renderPhaseView()}
        {viewMode === 'domains' && renderHealthDomains()}
        {viewMode === 'decisions' && (
          <DecisionTimeline decisions={decisions} conversations={conversations} />
        )}
      </div>
    </div>
  );
}
