import React, { useMemo, useState } from "react";

export default function ConversationLog({ conversations = [], decisions = [], onDecisionClick }) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    // Filter by type
    if (filterType === "decisions") {
      const decisionConvIds = new Set(decisions.map(d => d.conversation_id || d.trigger_message_id));
      filtered = conversations.filter(c => decisionConvIds.has(c.id));
    } else if (filterType === "team") {
      filtered = conversations.filter(c => 
        c.role && !["member", "user", "patient"].includes(c.role.toLowerCase())
      );
    }

    // Apply search
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((c) =>
        [c?.sender, c?.role, c?.topic, c?.message].some((text) => 
          (text || "").toLowerCase().includes(q)
        )
      );
    }

    return filtered.slice(0, 100);
  }, [conversations, decisions, search, filterType]);

  const decisionsByConvId = useMemo(() => {
    const map = {};
    decisions.forEach((d) => {
      const convId = d.conversation_id || d.trigger_message_id;
      if (convId) {
        if (!map[convId]) map[convId] = [];
        map[convId].push(d);
      }
    });
    return map;
  }, [decisions]);

  return (
    <div style={{ backgroundColor: 'white', borderRadius: 8, border: '1px solid #dee2e6' }}>
      {/* Search and Filters */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', gap: 15, marginBottom: 15, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: '1 1 300px',
              padding: '10px 12px',
              border: '2px solid #dee2e6',
              borderRadius: 6,
              fontSize: '14px'
            }}
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: '10px 12px',
              border: '2px solid #dee2e6',
              borderRadius: 6,
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            <option value="all">All Conversations</option>
            <option value="decisions">With Decisions</option>
            <option value="team">Team Messages</option>
          </select>
        </div>
      </div>

      {/* Conversation List */}
      <div style={{ maxHeight: 500, overflowY: 'auto', padding: '0 20px 20px' }}>
        {filteredConversations.length === 0 && (
          <p style={{ textAlign: 'center', color: '#6c757d', fontStyle: 'italic' }}>
            No conversations match your search.
          </p>
        )}
        
        {filteredConversations.map((conv) => {
          const linkedDecisions = decisionsByConvId[conv.id] || [];
          const hasDecision = linkedDecisions.length > 0;
          
          return (
            <div
              key={conv.id}
              style={{
                marginBottom: 15,
                padding: 15,
                border: hasDecision ? '2px solid #28a745' : '1px solid #dee2e6',
                borderRadius: 8,
                backgroundColor: hasDecision ? '#f8fff9' : 'white',
                cursor: hasDecision ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onClick={() => hasDecision && onDecisionClick(linkedDecisions[0])}
              title={hasDecision ? 'Click to view decision details' : ''}
              onMouseEnter={(e) => {
                if (hasDecision) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (hasDecision) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              {/* Conversation Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  {conv.sender} 
                  <span style={{ 
                    marginLeft: 8, 
                    padding: '2px 8px', 
                    backgroundColor: '#e9ecef', 
                    borderRadius: 12, 
                    fontSize: '0.8rem',
                    color: '#495057'
                  }}>
                    {conv.role}
                  </span>
                </div>
                {conv.timestamp && (
                  <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                    {new Date(conv.timestamp).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div style={{ 
                whiteSpace: 'pre-wrap', 
                lineHeight: 1.5,
                color: '#495057'
              }}>
                {conv.message}
              </div>

              {/* Decision Indicator */}
              {hasDecision && (
                <div style={{
                  marginTop: 10,
                  padding: '6px 12px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  borderRadius: 4,
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  display: 'inline-block'
                }}>
                  📊 Decision Made - Click to View
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
