import React, { useState } from "react";

export default function JourneyTimeline({ journey = [] }) {
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 5;

  // Sort episodes by start date to ensure chronological order
  const sortedJourney = React.useMemo(() => {
    if (!journey || journey.length === 0) return [];
    
    return [...journey].sort((a, b) => {
      const dateA = a.date_range?.start ? new Date(a.date_range.start.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] || a.date_range.start) : new Date(0);
      const dateB = b.date_range?.start ? new Date(b.date_range.start.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] || b.date_range.start) : new Date(0);
      return dateA - dateB;
    });
  }, [journey]);

  if (!journey || journey.length === 0) {
    return (
      <div style={container}>
        <h3 style={title}>Member Journey Timeline</h3>
        <div style={emptyState}>No journey data available</div>
      </div>
    );
  }

  const handleEpisodeClick = (episode) => {
    if (selectedEpisode?.id === episode.id) {
      setSelectedEpisode(null);
      setShowAllMessages(false);
      setCurrentPage(1);
    } else {
      setSelectedEpisode(episode);
      setShowAllMessages(false);
      setCurrentPage(1);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      // Handle date strings like "2026-01-02 07:05 SGT"
      // Extract just the date part (YYYY-MM-DD)
      const dateMatch = dateString.match(/^(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        const date = new Date(dateMatch[1]);
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        });
      }
      // Fallback to original parsing
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.warn('Date parsing error:', error, 'for date:', dateString);
      return "N/A";
    }
  };

  return (
    <div style={container}>
      <div style={headerContainer}>
        <h3 style={title}>Member Journey Timeline</h3>
        <div style={scrollHint}>← Scroll to see all episodes →</div>
      </div>
      
      {/* Timeline Container */}
      <div style={timelineContainer}>
        {/* Timeline Line */}
        <div style={timelineLine} />
        
                 {/* Episode Points */}
         {sortedJourney.map((episode, index) => (
          <div key={episode.id} style={episodeContainer}>
            {/* Timeline Point */}
            <div 
              style={{
                ...timelinePoint,
                ...(selectedEpisode?.id === episode.id ? selectedPoint : {}),
                ...(episode.metrics?.decisions > 0 ? decisionPoint : {})
              }}
              onClick={() => handleEpisodeClick(episode)}
              title={`${episode.title} - ${formatDate(episode.date_range?.start)}`}
              onMouseEnter={(e) => {
                e.target.style.transform = selectedEpisode?.id === episode.id ? "scale(1.4)" : "scale(1.15)";
                e.target.style.boxShadow = "0 6px 12px rgba(59, 130, 246, 0.3)";
                // Add hover effect to parent container
                e.target.parentElement.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = selectedEpisode?.id === episode.id ? "scale(1.4)" : "scale(1)";
                e.target.style.boxShadow = selectedEpisode?.id === episode.id ? "0 8px 16px rgba(29, 78, 216, 0.4)" : "0 4px 8px rgba(59, 130, 246, 0.25)";
                // Remove hover effect from parent container
                e.target.parentElement.style.transform = "translateY(0)";
              }}
            />
            
                         {/* Episode Label */}
             <div style={episodeLabel}>
               <div style={episodeNumber}>#{index + 1}</div>
               <div style={episodeTitle}>{episode.title}</div>
               <div style={episodeDate}>
                 {formatDate(episode.date_range?.start)}
               </div>
             </div>
            
            {/* Dropdown Details */}
            {selectedEpisode?.id === episode.id && (
              <div style={dropdownContainer}>
                <div style={dropdown}>
                  <div style={dropdownHeader}>
                    <h4 style={dropdownTitle}>{episode.title}</h4>
                    <button 
                      style={closeButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEpisode(null);
                      }}
                    >
                      ×
                    </button>
                  </div>
                  
                  <div style={dropdownContent}>
                    <div style={metricsRow}>
                      <div style={metric}>
                        <span style={metricLabel}>Messages:</span>
                        <span style={metricValue}>{episode.metrics?.total_messages || 0}</span>
                      </div>
                      <div style={metric}>
                        <span style={metricLabel}>Decisions:</span>
                        <span style={metricValue}>{episode.metrics?.decisions || 0}</span>
                      </div>
                      <div style={metric}>
                        <span style={metricLabel}>Team:</span>
                        <span style={metricValue}>{episode.metrics?.team_messages || 0}</span>
                      </div>
                      <div style={metric}>
                        <span style={metricLabel}>Member:</span>
                        <span style={metricValue}>{episode.metrics?.member_messages || 0}</span>
                      </div>
                    </div>
                    
                    {episode.metrics?.primary_topics && episode.metrics.primary_topics.length > 0 && (
                      <div style={topicsSection}>
                        <div style={topicsLabel}>Primary Topics:</div>
                        <div style={topicsList}>
                          {episode.metrics.primary_topics.map((topic, idx) => (
                            <span key={idx} style={topicTag}>{topic}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                                         {episode.summary && (
                       <div style={summarySection}>
                         <div style={summaryText}>{episode.summary}</div>
                       </div>
                     )}
                     
                     {/* Conversations Section */}
                     {episode.conversations && episode.conversations.length > 0 && (
                       <div style={conversationsSection}>
                         <div style={conversationsHeader}>
                           <span style={conversationsTitle}>Messages</span>
                           <span style={conversationsCount}>({episode.conversations.length})</span>
                         </div>
                         
                         {/* Pagination Controls */}
                         {showAllMessages && episode.conversations.length > messagesPerPage && (
                           <div style={paginationContainer}>
                             <button 
                               style={paginationButton}
                               disabled={currentPage === 1}
                               onClick={(e) => {
                                 e.stopPropagation();
                                 setCurrentPage(Math.max(1, currentPage - 1));
                               }}
                             >
                               ← Previous
                             </button>
                             <span style={paginationInfo}>
                               Page {currentPage} of {Math.ceil(episode.conversations.length / messagesPerPage)}
                             </span>
                             <button 
                               style={paginationButton}
                               disabled={currentPage >= Math.ceil(episode.conversations.length / messagesPerPage)}
                               onClick={(e) => {
                                 e.stopPropagation();
                                 setCurrentPage(Math.min(Math.ceil(episode.conversations.length / messagesPerPage), currentPage + 1));
                               }}
                             >
                               Next →
                             </button>
                           </div>
                         )}
                         
                         <div style={conversationsList}>
                           {(showAllMessages 
                             ? episode.conversations.slice((currentPage - 1) * messagesPerPage, currentPage * messagesPerPage)
                             : episode.conversations.slice(0, 3)
                           ).map((conv, idx) => (
                             <div key={conv.id || idx} style={conversationItem}>
                               <div style={conversationHeader}>
                                 <div style={senderInfo}>
                                   <span style={conversationSender}>{conv.sender}</span>
                                   <span style={conversationRole}>({conv.role})</span>
                                 </div>
                                 <span style={conversationTime}>
                                   {formatDate(conv.timestamp)}
                                 </span>
                               </div>
                               <div style={conversationMessage}>
                                 {conv.message.length > 150 
                                   ? `${conv.message.substring(0, 150)}...` 
                                   : conv.message
                                 }
                               </div>
                               {conv.action_decision && (
                                 <div style={decisionBadge}>
                                   🎯 Decision: {conv.decision_type || 'Action'}
                                 </div>
                               )}
                             </div>
                           ))}
                           
                           {/* View All/Show Less Button */}
                           {episode.conversations.length > 3 && !showAllMessages && (
                             <button 
                               style={viewAllButton}
                               onClick={(e) => {
                                 e.stopPropagation();
                                 setShowAllMessages(true);
                                 setCurrentPage(1);
                               }}
                             >
                               View All {episode.conversations.length} Messages
                             </button>
                           )}
                           {showAllMessages && (
                             <button 
                               style={viewAllButton}
                               onClick={(e) => {
                                 e.stopPropagation();
                                 setShowAllMessages(false);
                                 setCurrentPage(1);
                               }}
                             >
                               Show Less
                             </button>
                           )}
                         </div>
                       </div>
                     )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
             {/* Episode Summary */}
       <div style={summaryContainer}>
         <div style={summaryText}>
           Total Episodes: <strong>{sortedJourney.length}</strong> • 
           Episodes with Decisions: <strong>{sortedJourney.filter(ep => ep.metrics?.decisions > 0).length}</strong> • 
           Date Range: <strong>{formatDate(sortedJourney[0]?.date_range?.start)}</strong> to <strong>{formatDate(sortedJourney[sortedJourney.length - 1]?.date_range?.end)}</strong>
         </div>
       </div>
    </div>
  );
}

// Styles
const container = {
  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 24,
  marginBottom: 24,
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
};

const headerContainer = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 24,
  paddingBottom: 16,
  borderBottom: "2px solid #f1f5f9",
};

const title = {
  margin: 0,
  fontSize: 20,
  fontWeight: 700,
  color: "#0f172a",
  letterSpacing: "-0.025em",
};

const scrollHint = {
  fontSize: 13,
  color: "#64748b",
  fontStyle: "italic",
  background: "#f8fafc",
  padding: "6px 12px",
  borderRadius: 20,
  border: "1px solid #e2e8f0",
};

const emptyState = {
  textAlign: "center",
  color: "#64748b",
  padding: "40px 20px",
};

const timelineContainer = {
  position: "relative",
  padding: "50px 30px",
  overflowX: "auto",
  minHeight: 300,
  whiteSpace: "nowrap",
  background: "linear-gradient(180deg, rgba(248, 250, 252, 0.5) 0%, rgba(255, 255, 255, 0) 100%)",
  borderRadius: 12,
  margin: "0 -10px",
};

const timelineLine = {
  position: "absolute",
  top: "50%",
  left: 30,
  right: 30,
  height: 4,
  background: "linear-gradient(90deg, #3b82f6 0%, #1d4ed8 25%, #1e40af 50%, #1d4ed8 75%, #3b82f6 100%)",
  transform: "translateY(-50%)",
  zIndex: 1,
  borderRadius: 4,
  boxShadow: "0 2px 4px rgba(59, 130, 246, 0.3)",
};

const episodeContainer = {
  position: "relative",
  display: "inline-block",
  marginRight: 90,
  verticalAlign: "top",
  zIndex: 2,
  textAlign: "center",
  transition: "transform 0.2s ease",
};

const timelinePoint = {
  width: 20,
  height: 20,
  borderRadius: "50%",
  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  border: "4px solid #fff",
  boxShadow: "0 4px 8px rgba(59, 130, 246, 0.25), 0 2px 4px rgba(0, 0, 0, 0.1)",
  cursor: "pointer",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  zIndex: 3,
  margin: "0 auto",
};

const selectedPoint = {
  background: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
  transform: "scale(1.4)",
  boxShadow: "0 8px 16px rgba(29, 78, 216, 0.4), 0 4px 8px rgba(0, 0, 0, 0.15)",
  border: "4px solid #fff",
};

const decisionPoint = {
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  border: "4px solid #fff",
  boxShadow: "0 4px 8px rgba(16, 185, 129, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1)",
};

const episodeLabel = {
  textAlign: "center",
  marginTop: 16,
  minWidth: 110,
  maxWidth: 130,
  padding: "8px 4px",
  borderRadius: 8,
  transition: "background-color 0.2s ease",
};

const episodeNumber = {
  fontSize: 11,
  fontWeight: 800,
  color: "#3b82f6",
  marginBottom: 4,
  background: "rgba(59, 130, 246, 0.1)",
  padding: "2px 6px",
  borderRadius: 12,
  display: "inline-block",
};

const episodeTitle = {
  fontSize: 13,
  fontWeight: 600,
  color: "#1f2937",
  lineHeight: 1.4,
  marginBottom: 6,
  wordWrap: "break-word",
  whiteSpace: "normal",
};

const episodeDate = {
  fontSize: 12,
  color: "#6b7280",
  fontWeight: 500,
  background: "#f9fafb",
  padding: "2px 6px",
  borderRadius: 6,
  display: "inline-block",
};

const dropdownContainer = {
  position: "absolute",
  top: "100%",
  left: "50%",
  transform: "translateX(-50%)",
  marginTop: 10,
  zIndex: 10,
};

const dropdown = {
  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  minWidth: 340,
  maxWidth: 420,
  backdropFilter: "blur(10px)",
};

const dropdownHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 20px",
  borderBottom: "1px solid #e2e8f0",
  background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
  borderRadius: "12px 12px 0 0",
};

const dropdownTitle = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
  color: "#0f172a",
  letterSpacing: "-0.025em",
};

const closeButton = {
  background: "rgba(100, 116, 139, 0.1)",
  border: "none",
  fontSize: 18,
  color: "#64748b",
  cursor: "pointer",
  padding: 0,
  width: 24,
  height: 24,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  transition: "all 0.2s ease",
};

const dropdownContent = {
  padding: 20,
};

const metricsRow = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
  marginBottom: 20,
  padding: "16px",
  background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
  borderRadius: 8,
  border: "1px solid #e2e8f0",
};

const metric = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "4px 0",
};

const metricLabel = {
  fontSize: 13,
  color: "#64748b",
  fontWeight: 500,
};

const metricValue = {
  fontSize: 13,
  fontWeight: 700,
  color: "#1e293b",
  background: "rgba(59, 130, 246, 0.1)",
  padding: "2px 8px",
  borderRadius: 6,
};

const topicsSection = {
  marginBottom: 12,
};

const topicsLabel = {
  fontSize: 12,
  fontWeight: 500,
  color: "#475569",
  marginBottom: 6,
};

const topicsList = {
  display: "flex",
  flexWrap: "wrap",
  gap: 4,
};

const topicTag = {
  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  color: "#ffffff",
  padding: "4px 8px",
  borderRadius: 12,
  fontSize: 11,
  fontWeight: 600,
  boxShadow: "0 1px 2px rgba(59, 130, 246, 0.2)",
};

const summarySection = {
  borderTop: "1px solid #e2e8f0",
  paddingTop: 12,
};

const summaryContainer = {
  marginTop: 24,
  padding: "16px 20px",
  background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
};

const summaryText = {
  fontSize: 13,
  color: "#64748b",
  lineHeight: 1.5,
  textAlign: "center",
  fontWeight: 500,
};

// Conversation styles
const conversationsSection = {
  borderTop: "1px solid #e2e8f0",
  paddingTop: 12,
  marginTop: 12,
};

const conversationsHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
};

const conversationsTitle = {
  fontSize: 12,
  fontWeight: 600,
  color: "#374151",
};

const conversationsCount = {
  fontSize: 11,
  color: "#6b7280",
  fontWeight: 500,
};

const conversationsList = {
  maxHeight: 300,
  overflowY: "auto",
  padding: "8px 0",
  scrollbarWidth: "thin",
  scrollbarColor: "#cbd5e1 #f1f5f9",
};

// Custom scrollbar styles for webkit browsers
const conversationsListStyle = {
  maxHeight: 300,
  overflowY: "auto",
  padding: "8px 0",
  scrollbarWidth: "thin",
  scrollbarColor: "#cbd5e1 #f1f5f9",
  // Webkit scrollbar styles
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "#f1f5f9",
    borderRadius: "3px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#cbd5e1",
    borderRadius: "3px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: "#94a3b8",
  },
};

const conversationItem = {
  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  padding: 12,
  marginBottom: 8,
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  transition: "all 0.2s ease",
};

const conversationHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 4,
  flexWrap: "wrap",
  gap: 4,
};

const senderInfo = {
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const conversationSender = {
  fontSize: 11,
  fontWeight: 600,
  color: "#1e293b",
};

const conversationRole = {
  fontSize: 10,
  color: "#64748b",
};

const conversationTime = {
  fontSize: 10,
  color: "#64748b",
  fontWeight: 500,
};

const conversationMessage = {
  fontSize: 12,
  color: "#374151",
  lineHeight: 1.5,
  marginBottom: 6,
  padding: "8px 0",
  borderTop: "1px solid #f1f5f9",
  borderBottom: "1px solid #f1f5f9",
};

const decisionBadge = {
  background: "#dcfce7",
  color: "#166534",
  fontSize: 10,
  fontWeight: 600,
  padding: "2px 6px",
  borderRadius: 4,
  display: "inline-block",
};

const moreMessages = {
  fontSize: 11,
  color: "#6b7280",
  fontStyle: "italic",
  textAlign: "center",
  padding: "4px 0",
};

const viewAllButton = {
  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 16px",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  width: "100%",
  marginTop: 12,
  transition: "all 0.2s ease",
  boxShadow: "0 2px 4px rgba(59, 130, 246, 0.2)",
};

const paginationContainer = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px 0",
  marginBottom: 8,
  borderBottom: "1px solid #e2e8f0",
};

const paginationButton = {
  background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
  color: "#475569",
  border: "1px solid #cbd5e1",
  borderRadius: 6,
  padding: "6px 12px",
  fontSize: 11,
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:disabled": {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  "&:hover:not(:disabled)": {
    background: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)",
    color: "#374151",
  },
};

const paginationInfo = {
  fontSize: 11,
  color: "#64748b",
  fontWeight: 500,
};
