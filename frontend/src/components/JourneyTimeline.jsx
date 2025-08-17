import React, { useState, useMemo } from "react";

export default function JourneyTimeline({ journey = [], decisions = [], onDecisionClick }) {
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  
  const episodes = Array.isArray(journey) ? journey : [];

  // Create a timeline with episodes and decisions
  const timelineData = useMemo(() => {
    const items = [];
    
    episodes.forEach((episode, index) => {
      items.push({
        type: 'episode',
        data: episode,
        index,
        date: episode.date || episode.timestamp || `Episode ${index + 1}`
      });
    });

    decisions.forEach((decision) => {
      items.push({
        type: 'decision',
        data: decision,
        date: decision.timestamp || decision.date || 'Unknown date'
      });
    });

    return items.sort((a, b) => {
      // Simple date sorting - could be enhanced
      if (a.date < b.date) return -1;
      if (a.date > b.date) return 1;
      return 0;
    });
  }, [episodes, decisions]);

  if (episodes.length === 0) {
    return (
      <div style={{ 
        padding: 40, 
        textAlign: 'center', 
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        border: '1px solid #dee2e6'
      }}>
        <p>No journey data available</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'white', borderRadius: 8, border: '1px solid #dee2e6', padding: 20 }}>
      <h3 style={{ marginBottom: 20, color: '#2c3e50' }}>Journey Timeline</h3>
      
      {/* Timeline Container */}
      <div style={{ position: 'relative', paddingLeft: 30 }}>
        {/* Vertical Line */}
        <div style={{
          position: 'absolute',
          left: 15,
          top: 0,
          bottom: 0,
          width: 2,
          backgroundColor: '#dee2e6'
        }} />

        {/* Timeline Items */}
        {timelineData.map((item, index) => (
          <div key={index} style={{ position: 'relative', marginBottom: 30 }}>
            {/* Timeline Dot */}
            <div style={{
              position: 'absolute',
              left: -23,
              top: 5,
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: item.type === 'decision' ? '#28a745' : '#007bff',
              border: '3px solid white',
              boxShadow: '0 0 0 2px #dee2e6'
            }} />

            {/* Content Card */}
            <div
              style={{
                backgroundColor: item.type === 'decision' ? '#f8fff9' : '#f8f9fa',
                border: item.type === 'decision' ? '2px solid #28a745' : '1px solid #dee2e6',
                borderRadius: 8,
                padding: 15,
                cursor: item.type === 'decision' ? 'pointer' : 'default',
                transition: 'all 0.2s ease'
              }}
              onClick={() => {
                if (item.type === 'decision' && onDecisionClick) {
                  onDecisionClick(item.data);
                } else if (item.type === 'episode') {
                  setSelectedEpisode(selectedEpisode === index ? null : index);
                }
              }}
              onMouseEnter={(e) => {
                if (item.type === 'decision') {
                  e.target.style.transform = 'translateX(5px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (item.type === 'decision') {
                  e.target.style.transform = 'translateX(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h4 style={{ margin: 0, color: item.type === 'decision' ? '#28a745' : '#007bff' }}>
                  {item.type === 'decision' ? '🎯 Decision' : `📋 ${item.data.title || `Episode ${item.index + 1}`}`}
                </h4>
                <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                  {item.date}
                </span>
              </div>

              {/* Content */}
              {item.type === 'decision' ? (
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>
                    {item.data.decision || item.data.title}
                  </p>
                  <p style={{ margin: '5px 0 0', fontSize: '0.9rem', color: '#6c757d' }}>
                    Click to view details and reasoning
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{ margin: 0 }}>
                    {item.data.summary || item.data.description || 'Episode details'}
                  </p>
                  {item.data.metrics && (
                    <div style={{ marginTop: 10, fontSize: '0.9rem', color: '#495057' }}>
                      Messages: {item.data.metrics.messages || 0} | 
                      Decisions: {item.data.metrics.decisions || 0}
                    </div>
                  )}
                  {selectedEpisode === index && item.data.conversations && (
                    <div style={{ marginTop: 15, padding: 10, backgroundColor: 'white', borderRadius: 4 }}>
                      <strong>Conversations:</strong>
                      {item.data.conversations.slice(0, 3).map((conv, i) => (
                        <div key={i} style={{ marginTop: 5, fontSize: '0.85rem' }}>
                          <strong>{conv.sender}:</strong> {conv.message.substring(0, 100)}...
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
