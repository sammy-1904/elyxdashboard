import React, { useEffect, useMemo, useState } from "react";
import { eventAPI } from "../services/api";
import MemberProfileCard from "./MemberProfileCard";
import MetricsOverview from "./MetricsOverview";
import JourneyTimeline from "./JourneyTimeline";

import PlansView from "./PlansView";  // 👈 add this

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
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Responsive detection
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

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

  // Enhanced loading state
  if (loading) {
    return (
      <div style={getLoadingContainerStyle(isMobile)}>
        <div style={loadingContent}>
          <div style={loadingAnimation}>
            <div style={loadingSpinner} />
            <div style={loadingSpinnerInner} />
          </div>
          <div style={getLoadingTitleStyle(isMobile)}>Loading Elyx Dashboard</div>
          <div style={getLoadingSubtitleStyle(isMobile)}>
            Analyzing member data and journey insights
          </div>
          <div style={loadingProgress}>
            <div style={loadingProgressBar} />
          </div>
        </div>
      </div>
    );
  }

  // Enhanced error state
  if (error) {
    return (
      <div style={getErrorContainerStyle(isMobile)}>
        <div style={errorContent}>
          <div style={errorIcon}>⚠️</div>
          <h3 style={errorTitle}>Dashboard Error</h3>
          <p style={errorMessage}>{error}</p>
          <button 
            style={retryButton}
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="elyx-dashboard" style={getDashboardContainerStyle()}>
      {/* Enhanced Header */}
      <header style={getHeaderStyle(isMobile, isTablet)}>
        <div style={headerContent}>
          <div style={titleSection}>
            {isMobile && (
              <button
                style={mobileMenuButton}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle navigation menu"
              >
                ☰
              </button>
            )}
            <div>
              <h1 style={getMainTitleStyle(isMobile)}>
                <span style={titleIcon}>🏥</span>
                Elyx Member Dashboard
              </h1>
              <p style={getSubtitleStyle(isMobile)}>
                {profile?.name || 'Member'}'s Health Journey & Decision Tracking
              </p>
            </div>
          </div>
          
          {/* Enhanced Navigation */}
          <nav style={getNavigationStyle(isMobile, sidebarOpen)}>
            <div style={navContainer}>
              {[
                { key: "overview", label: "Overview", icon: "📊" },
                { key: "plans", label: "Plans", icon: "📝" }, 
                { key: "timeline", label: "Timeline", icon: "📈" },
                
                // { key: "conversations", label: isMobile ? "Messages" : "Communications", icon: "💬" }
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveView(item.key);
                    if (isMobile) setSidebarOpen(false);
                  }}
                  style={getNavButtonStyle(activeView === item.key, isMobile)}
                  onMouseEnter={(e) => {
                    if (!isMobile && activeView !== item.key) {
                      e.target.style.background = "#f8fafc";
                      e.target.style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isMobile && activeView !== item.key) {
                      e.target.style.background = "#ffffff";
                      e.target.style.transform = "translateY(0)";
                    }
                  }}
                >
                  <span style={navIcon}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            
            {/* Stats Quick View */}
            {!isMobile && (
              <div style={quickStats}>
                <div style={quickStatItem}>
                  <span style={quickStatIcon}>📊</span>
                  <span style={quickStatValue}>{journey.length}</span>
                  <span style={quickStatLabel}>Episodes</span>
                </div>
                <div style={quickStatItem}>
                  <span style={quickStatIcon}>💬</span>
                  <span style={quickStatValue}>{totals.msg}</span>
                  <span style={quickStatLabel}>Messages</span>
                </div>
                <div style={quickStatItem}>
                  <span style={quickStatIcon}>🎯</span>
                  <span style={quickStatValue}>{totals.decisionsCount}</span>
                  <span style={quickStatLabel}>Decisions</span>
                </div>
              </div>
            )}
          </nav>
        </div>
        
        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div 
            style={mobileOverlay}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </header>

      {/* Enhanced Main Content */}
      <main style={getMainContentStyle(isMobile, isTablet)}>
        {/* Always show Journey Timeline - Enhanced */}
        

        {/* Enhanced Dynamic Content Based on Active View */}
        <section style={contentSection}>
          {activeView === "overview" && (
            
            <div style={overviewContainer}>
              <div style={getOverviewLayoutStyle(isMobile, isTablet)}>
                <div style={getProfileCardContainerStyle(isMobile)}>
                  <MemberProfileCard profile={profile} />
                </div>
                <div style={getMetricsContainerStyle(isMobile)}>
                  <MetricsOverview metrics={metrics} />
                </div>
              </div>
              
              {/* Enhanced Summary Cards */}
              
            </div>
          )}
          {activeView === "plans" && (
  <PlansView isMobile={isMobile} />
)}
{activeView === "timeline" && (
  <div>
    <h2 style={{ marginBottom: 20 }}>📈 Journey Timeline</h2>
    <section style={timelineSection}>
      <JourneyTimeline journey={journey} />
    </section>
  </div>
)}

          {/* {activeView === "timeline" && (
            <div style={timelineDetailsContainer}>
              <div style={sectionHeader}>
                <h2 style={getSectionTitleStyle(isMobile)}>
                  <span style={sectionIcon}>📈</span>
                  Detailed Journey Analysis
                </h2>
                <p style={getSectionDescriptionStyle(isMobile)}>
                  Comprehensive view of journey episodes with expanded metrics and conversation details
                </p>
              </div>
              
              <div style={getEpisodesGridStyle(isMobile, isTablet)}>
                {journey.map((episode) => (
                  <div key={episode.id} style={getEpisodeCardStyle(isMobile)}>
                    <div style={episodeCardHeader}>
                      <div style={episodeCardTitle}>
                        <span style={episodeCardIcon}>
                          {episode.metrics?.decisions > 0 ? "🎯" : "💬"}
                        </span>
                        <h4 style={episodeCardTitleText}>{episode.title}</h4>
                      </div>
                      <div style={episodeCardDate}>
                        {episode.date_range?.start && 
                          new Date(episode.date_range.start).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: isMobile ? '2-digit' : 'numeric'
                          })
                        }
                      </div>
                    </div>
                    
                    <div style={episodeMetricsGrid}>
                      <div style={episodeMetric}>
                        <span style={episodeMetricIcon}>💬</span>
                        <span style={episodeMetricValue}>{episode.metrics?.total_messages || 0}</span>
                        <span style={episodeMetricLabel}>Messages</span>
                      </div>
                      <div style={episodeMetric}>
                        <span style={episodeMetricIcon}>🎯</span>
                        <span style={episodeMetricValue}>{episode.metrics?.decisions || 0}</span>
                        <span style={episodeMetricLabel}>Decisions</span>
                      </div>
                      <div style={episodeMetric}>
                        <span style={episodeMetricIcon}>👥</span>
                        <span style={episodeMetricValue}>{episode.metrics?.team_messages || 0}</span>
                        <span style={episodeMetricLabel}>Team</span>
                      </div>
                      <div style={episodeMetric}>
                        <span style={episodeMetricIcon}>👤</span>
                        <span style={episodeMetricValue}>{episode.metrics?.member_messages || 0}</span>
                        <span style={episodeMetricLabel}>Member</span>
                      </div>
                    </div>
                    
                    {episode.summary && (
                      <div style={episodeSummary}>
                        <div style={episodeSummaryHeader}>
                          <span style={summaryIcon}>📝</span>
                          <span style={summaryLabel}>Summary</span>
                        </div>
                        <div style={episodeSummaryText}>
                          {episode.summary}
                        </div>
                      </div>
                    )}
                    
                    {episode.metrics?.primary_topics && episode.metrics.primary_topics.length > 0 && (
                      <div style={episodeTopics}>
                        <div style={episodeTopicsHeader}>
                          <span style={topicsIcon}>🏷️</span>
                          <span style={topicsLabel}>Topics</span>
                        </div>
                        <div style={episodeTopicsList}>
                          {episode.metrics.primary_topics.slice(0, isMobile ? 2 : 3).map((topic, idx) => (
                            <span key={idx} style={getEpisodeTopicTagStyle(isMobile)}>
                              {topic}
                            </span>
                          ))}
                          {episode.metrics.primary_topics.length > (isMobile ? 2 : 3) && (
                            <span style={moreTopicsIndicator}>
                              +{episode.metrics.primary_topics.length - (isMobile ? 2 : 3)} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )} */}

          {activeView === "conversations" && (
            <div style={conversationsContainer}>
              <div style={sectionHeader}>
                <h2 style={getSectionTitleStyle(isMobile)}>
                  <span style={sectionIcon}>💬</span>
                  Communications & Decisions
                </h2>
                <p style={getSectionDescriptionStyle(isMobile)}>
                  Search conversations and click on highlighted messages to see decision details
                </p>
              </div>
              
              
            </div>
          )}
        </section>
      </main>

      {/* Enhanced Decision Modal */}
      
      
    </div>
  );
}

// Enhanced Responsive Styles

const getDashboardContainerStyle = () => ({
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  position: 'relative',
});

const getHeaderStyle = (isMobile, isTablet) => ({
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  borderBottom: '2px solid #e2e8f0',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  position: 'sticky',
  top: 0,
  zIndex: 100,
  backdropFilter: 'blur(10px)',
});

const headerContent = {
  padding: '20px 30px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 20,
  maxWidth: '1400px',
  margin: '0 auto',
};

const titleSection = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  flex: 1,
  minWidth: 0,
};

const mobileMenuButton = {
  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  border: 'none',
  borderRadius: 8,
  padding: 10,
  color: '#ffffff',
  fontSize: 18,
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const titleIcon = {
  fontSize: 28,
  marginRight: 8,
};

const getMainTitleStyle = (isMobile) => ({
  margin: 0,
  fontSize: isMobile ? 20 : 28,
  fontWeight: 800,
  color: '#0f172a',
  letterSpacing: '-0.025em',
  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'flex',
  alignItems: 'center',
  lineHeight: 1.2,
});

const getSubtitleStyle = (isMobile) => ({
  margin: '8px 0 0',
  fontSize: isMobile ? 12 : 14,
  color: '#64748b',
  fontWeight: 500,
  lineHeight: 1.4,
});

const getNavigationStyle = (isMobile, sidebarOpen) => ({
  display: 'flex',
  flexDirection: isMobile ? 'column' : 'row',
  alignItems: isMobile ? 'stretch' : 'center',
  gap: isMobile ? 16 : 24,
  position: isMobile ? 'fixed' : 'static',
  top: isMobile ? 0 : 'auto',
  right: isMobile ? (sidebarOpen ? 0 : '-100%') : 'auto',
  width: isMobile ? '280px' : 'auto',
  height: isMobile ? '100vh' : 'auto',
  background: isMobile ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' : 'transparent',
  padding: isMobile ? '20px' : '0',
  boxShadow: isMobile ? '-4px 0 12px rgba(0, 0, 0, 0.1)' : 'none',
  zIndex: 101,
  transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflowY: isMobile ? 'auto' : 'visible',
});

const navContainer = {
  display: 'flex',
  flexDirection: 'inherit',
  gap: 'inherit',
};

const getNavButtonStyle = (isActive, isMobile) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: isMobile ? '12px 16px' : '10px 20px',
  border: isActive ? '2px solid #3b82f6' : '2px solid transparent',
  background: isActive 
    ? 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)' 
    : '#ffffff',
  borderRadius: isMobile ? 12 : 8,
  cursor: 'pointer',
  fontSize: isMobile ? 14 : 13,
  fontWeight: 600,
  color: isActive ? '#1d4ed8' : '#475569',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: isActive 
    ? '0 4px 12px rgba(59, 130, 246, 0.2)' 
    : '0 2px 4px rgba(0, 0, 0, 0.05)',
  textDecoration: 'none',
  minHeight: isMobile ? 48 : 40,
  justifyContent: isMobile ? 'flex-start' : 'center',
});

const navIcon = {
  fontSize: 16,
  lineHeight: 1,
};

const quickStats = {
  display: 'flex',
  gap: 16,
  marginLeft: 20,
  paddingLeft: 20,
  borderLeft: '2px solid #e2e8f0',
};

const quickStatItem = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
  minWidth: 60,
};

const quickStatIcon = {
  fontSize: 16,
};

const quickStatValue = {
  fontSize: 18,
  fontWeight: 800,
  color: '#1e293b',
  lineHeight: 1,
};

const quickStatLabel = {
  fontSize: 10,
  color: '#64748b',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const mobileOverlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  zIndex: 100,
};

const getMainContentStyle = (isMobile, isTablet) => ({
  padding: isMobile ? '16px' : isTablet ? '24px' : '30px',
  maxWidth: '1400px',
  margin: '0 auto',
  minHeight: 'calc(100vh - 120px)',
});

const timelineSection = {
  marginBottom: 32,
};

const contentSection = {
  animation: 'fadeIn 0.5s ease-in-out',
};

const overviewContainer = {
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
};

const getOverviewLayoutStyle = (isMobile, isTablet) => ({
  display: 'flex',
  flexDirection: isMobile ? 'column' : 'row',
  gap: isMobile ? 20 : 30,
  flexWrap: 'wrap',
  marginBottom: 24,
});

const getProfileCardContainerStyle = (isMobile) => ({
  flex: isMobile ? '1' : '1 1 350px',
  minWidth: isMobile ? '100%' : 300,
});

const getMetricsContainerStyle = (isMobile) => ({
  flex: isMobile ? '1' : '2 1 500px',
  minWidth: isMobile ? '100%' : 450,
});

const getSummaryCardsStyle = (isMobile, isTablet) => ({
  display: 'grid',
  gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
  gap: isMobile ? 16 : 20,
  marginTop: 24,
});

const getSummaryCardStyle = (isMobile) => ({
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  border: '2px solid #e2e8f0',
  borderRadius: isMobile ? 12 : 16,
  padding: isMobile ? 16 : 20,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease',
});

const summaryCardHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  marginBottom: 16,
};

const summaryCardIcon = {
  fontSize: 24,
  padding: 8,
  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
  borderRadius: 10,
  border: '2px solid #bae6fd',
};

const summaryCardTitle = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
  color: '#1e293b',
};

const summaryCardContent = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

const summaryCardStat = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

const summaryCardValue = {
  fontSize: 24,
  fontWeight: 800,
  color: '#3b82f6',
  lineHeight: 1,
};

const summaryCardLabel = {
  fontSize: 12,
  color: '#64748b',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const summaryCardDescription = {
  fontSize: 13,
  color: '#64748b',
  lineHeight: 1.5,
};

const timelineDetailsContainer = {
  animation: 'slideIn 0.5s ease-out',
};

const sectionHeader = {
  marginBottom: 24,
  textAlign: 'center',
};

const getSectionTitleStyle = (isMobile) => ({
  margin: '0 0 8px 0',
  fontSize: isMobile ? 20 : 24,
  fontWeight: 800,
  color: '#0f172a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
});

const sectionIcon = {
  fontSize: 28,
};

const getSectionDescriptionStyle = (isMobile) => ({
  margin: 0,
  fontSize: isMobile ? 12 : 14,
  color: '#64748b',
  lineHeight: 1.6,
  maxWidth: '600px',
  margin: '0 auto',
});

const getEpisodesGridStyle = (isMobile, isTablet) => ({
  display: 'grid',
  gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: isMobile ? 16 : 20,
});

const getEpisodeCardStyle = (isMobile) => ({
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  border: '2px solid #e2e8f0',
  borderRadius: isMobile ? 12 : 16,
  padding: isMobile ? 16 : 20,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
});

const episodeCardHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: 16,
  gap: 12,
};

const episodeCardTitle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flex: 1,
  minWidth: 0,
};

const episodeCardIcon = {
  fontSize: 20,
  flexShrink: 0,
};

const episodeCardTitleText = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
  color: '#1e293b',
  lineHeight: 1.3,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const episodeCardDate = {
  fontSize: 12,
  color: '#64748b',
  fontWeight: 600,
  background: '#f1f5f9',
  padding: '4px 8px',
  borderRadius: 6,
  flexShrink: 0,
};

const episodeMetricsGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 12,
  marginBottom: 16,
};

const episodeMetric = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
  padding: 12,
  background: 'linear-gradient(135deg, #f9fafb 0%, #f3f6 100%)',
 
 borderRadius: 8,
 border: '1px solid #e5e7eb',
};

const episodeMetricIcon = {
 fontSize: 16,
};

const episodeMetricValue = {
 fontSize: 18,
 fontWeight: 800,
 color: '#1e293b',
 lineHeight: 1,
};

const episodeMetricLabel = {
 fontSize: 10,
 color: '#64748b',
 fontWeight: 600,
 textTransform: 'uppercase',
 letterSpacing: '0.05em',
};

const episodeSummary = {
 marginBottom: 16,
 padding: 16,
 background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
 borderRadius: 12,
 border: '1px solid #fde047',
};

const episodeSummaryHeader = {
 display: 'flex',
 alignItems: 'center',
 gap: 8,
 marginBottom: 8,
};

const summaryIcon = {
 fontSize: 14,
};

const summaryLabel = {
 fontSize: 12,
 fontWeight: 700,
 color: '#92400e',
 textTransform: 'uppercase',
 letterSpacing: '0.05em',
};

const episodeSummaryText = {
 fontSize: 13,
 color: '#451a03',
 lineHeight: 1.5,
};

const episodeTopics = {
 borderTop: '1px solid #f1f5f9',
 paddingTop: 16,
};

const episodeTopicsHeader = {
 display: 'flex',
 alignItems: 'center',
 gap: 8,
 marginBottom: 8,
};

const topicsIcon = {
 fontSize: 14,
};

const topicsLabel = {
 fontSize: 12,
 fontWeight: 700,
 color: '#374151',
 textTransform: 'uppercase',
 letterSpacing: '0.05em',
};

const episodeTopicsList = {
 display: 'flex',
 flexWrap: 'wrap',
 gap: 6,
 alignItems: 'center',
};

const getEpisodeTopicTagStyle = (isMobile) => ({
 background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
 color: '#ffffff',
 padding: isMobile ? '4px 8px' : '6px 10px',
 borderRadius: 12,
 fontSize: isMobile ? 10 : 11,
 fontWeight: 600,
 boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
});

const moreTopicsIndicator = {
 fontSize: 11,
 color: '#64748b',
 fontWeight: 500,
 fontStyle: 'italic',
 padding: '4px 8px',
 background: '#f8fafc',
 borderRadius: 12,
 border: '1px solid #e2e8f0',
};

const conversationsContainer = {
 animation: 'slideIn 0.5s ease-out',
};

const conversationLogContainer = {
 background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
 border: '2px solid #e2e8f0',
 borderRadius: 16,
 padding: 20,
 boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
};

// Loading States
const getLoadingContainerStyle = (isMobile) => ({
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 minHeight: '100vh',
 background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
 padding: isMobile ? '20px' : '40px',
});

const loadingContent = {
 textAlign: 'center',
 maxWidth: '400px',
 width: '100%',
};

const loadingAnimation = {
 position: 'relative',
 width: 80,
 height: 80,
 margin: '0 auto 24px',
};

const loadingSpinner = {
 position: 'absolute',
 width: '100%',
 height: '100%',
 border: '4px solid #e2e8f0',
 borderTop: '4px solid #3b82f6',
 borderRadius: '50%',
 animation: 'spin 1s linear infinite',
};

const loadingSpinnerInner = {
 position: 'absolute',
 top: '50%',
 left: '50%',
 transform: 'translate(-50%, -50%)',
 width: '60%',
 height: '60%',
 border: '3px solid #f1f5f9',
 borderBottom: '3px solid #1d4ed8',
 borderRadius: '50%',
 animation: 'spin 1.5s linear infinite reverse',
};

const getLoadingTitleStyle = (isMobile) => ({
 fontSize: isMobile ? 18 : 20,
 fontWeight: 700,
 color: '#1e293b',
 marginBottom: 8,
});

const getLoadingSubtitleStyle = (isMobile) => ({
 fontSize: isMobile ? 12 : 14,
 color: '#64748b',
 marginBottom: 20,
 lineHeight: 1.5,
});

const loadingProgress = {
 width: '100%',
 height: 4,
 background: '#e2e8f0',
 borderRadius: 2,
 overflow: 'hidden',
 position: 'relative',
};

const loadingProgressBar = {
 width: '40%',
 height: '100%',
 background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
 borderRadius: 2,
 animation: 'progress 2s ease-in-out infinite',
};

// Error States
const getErrorContainerStyle = (isMobile) => ({
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 minHeight: '100vh',
 background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
 padding: isMobile ? '20px' : '40px',
});

const errorContent = {
 textAlign: 'center',
 maxWidth: '400px',
 width: '100%',
 padding: 32,
 background: '#ffffff',
 borderRadius: 16,
 border: '2px solid #fecaca',
 boxShadow: '0 8px 24px rgba(220, 38, 38, 0.1)',
};

const errorIcon = {
 fontSize: 48,
 marginBottom: 16,
};

const errorTitle = {
 margin: '0 0 12px 0',
 fontSize: 20,
 fontWeight: 700,
 color: '#dc2626',
};

const errorMessage = {
 margin: '0 0 20px 0',
 fontSize: 14,
 color: '#64748b',
 lineHeight: 1.5,
};

const retryButton = {
 background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
 color: '#ffffff',
 border: 'none',
 borderRadius: 8,
 padding: '12px 24px',
 fontSize: 14,
 fontWeight: 600,
 cursor: 'pointer',
 transition: 'all 0.2s ease',
 boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
};

// Enhanced CSS animations and global styles
const globalStyles = `
 @keyframes fadeIn {
   from { opacity: 0; transform: translateY(10px); }
   to { opacity: 1; transform: translateY(0); }
 }
 
 @keyframes slideIn {
   from { opacity: 0; transform: translateX(-20px); }
   to { opacity: 1; transform: translateX(0); }
 }
 
 @keyframes spin {
   0% { transform: rotate(0deg); }
   100% { transform: rotate(360deg); }
 }
 
 @keyframes progress {
   0% { transform: translateX(-100%); }
   50% { transform: translateX(0); }
   100% { transform: translateX(100%); }
 }
 
 /* Enhanced scrollbar styles */
 *::-webkit-scrollbar {
   width: 8px;
   height: 8px;
 }
 
 *::-webkit-scrollbar-track {
   background: #f1f5f9;
   border-radius: 4px;
 }
 
 *::-webkit-scrollbar-thumb {
   background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
   border-radius: 4px;
   border: 1px solid #f1f5f9;
 }
 
 *::-webkit-scrollbar-thumb:hover {
   background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
 }
 
 /* Enhanced focus styles for accessibility */
 button:focus-visible,
 [role="button"]:focus-visible {
   outline: 3px solid #3b82f6;
   outline-offset: 2px;
   border-radius: 6px;
 }
 
 /* Enhanced mobile optimizations */
 @media (max-width: 640px) {
   .elyx-dashboard {
     overflow-x: hidden;
   }
   
   button, [role="button"] {
     min-height: 44px;
     touch-action: manipulation;
   }
   
   /* Prevent zoom on input focus */
   input, select, textarea {
     font-size: 16px;
   }
 }
 
 /* Enhanced hover effects for desktop */
 @media (min-width: 1024px) {
   .summary-card:hover {
     transform: translateY(-2px);
     box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
   }
   
   .episode-card:hover {
     transform: translateY(-1px);
     box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
   }
   
   .nav-button:hover {
     transform: translateY(-1px);
   }
 }
 
 /* Enhanced tablet optimizations */
 @media (min-width: 641px) and (max-width: 1023px) {
   .header-content {
     padding: 16px 24px;
   }
   
   .main-content {
     padding: 24px;
   }
 }
 
 /* Print styles */
 @media print {
   .elyx-dashboard {
     background: white !important;
   }
   
   header {
     position: static !important;
     box-shadow: none !important;
   }
   
   button {
     display: none !important;
   }
 }
 
 /* High contrast mode support */
 @media (prefers-contrast: high) {
   .elyx-dashboard {
     --primary-color: #000000;
     --secondary-color: #ffffff;
     --border-color: #000000;
   }
 }
 
 /* Reduced motion support */
 @media (prefers-reduced-motion: reduce) {
   * {
     animation-duration: 0.01ms !important;
     animation-iteration-count: 1 !important;
     transition-duration: 0.01ms !important;
   }
 }
 
 /* Dark mode support (if needed) */
 @media (prefers-color-scheme: dark) {
   .elyx-dashboard {
     --bg-primary: #0f172a;
     --bg-secondary: #1e293b;
     --text-primary: #f8fafc;
     --text-secondary: #cbd5e1;
   }
 }
`;

// Inject global styles
if (typeof document !== 'undefined' && !document.getElementById('dashboard-styles')) {
 const styleElement = document.createElement('style');
 styleElement.id = 'dashboard-styles';
 styleElement.textContent = globalStyles;
 document.head.appendChild(styleElement);
}