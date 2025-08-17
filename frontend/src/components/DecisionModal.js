import React from 'react';
import { Modal } from 'antd';

const DecisionModal = ({ decision, visible, onClose }) => {
  if (!decision) return null;

  return (
    <Modal
      title={
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2c3e50' }}>
          🎯 Decision Analysis & Traceability
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <button
          key="close"
          onClick={onClose}
          style={{
            padding: '8px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      ]}
      width={700}
      style={{ top: 20 }}
    >
      <div style={{ padding: '10px 0' }}>
        {/* Decision Summary */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: 20,
          borderRadius: 8,
          marginBottom: 20,
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 10px', color: '#28a745' }}>Decision Made</h3>
          <p style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>
            {decision.decision || decision.title || 'Decision details not available'}
          </p>
        </div>

        {/* Reasoning */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ color: '#495057', marginBottom: 8 }}>🧠 Medical Reasoning</h4>
          <div style={{
            backgroundColor: '#e3f2fd',
            padding: 15,
            borderRadius: 6,
            borderLeft: '4px solid #2196f3'
          }}>
            {decision.reason || decision.rationale || 'Reasoning not provided'}
          </div>
        </div>

        {/* Trigger */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ color: '#495057', marginBottom: 8 }}>⚡ Triggered By</h4>
          <div style={{
            backgroundColor: '#fff3e0',
            padding: 15,
            borderRadius: 6,
            borderLeft: '4px solid #ff9800'
          }}>
            {decision.trigger_message || decision.trigger || 'Trigger information not available'}
          </div>
        </div>

        {/* Team Member */}
        {decision.team_member && (
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ color: '#495057', marginBottom: 8 }}>👨‍⚕️ Team Member</h4>
            <div style={{
              backgroundColor: '#f3e5f5',
              padding: 15,
              borderRadius: 6,
              borderLeft: '4px solid #9c27b0'
            }}>
              {decision.team_member}
            </div>
          </div>
        )}

        {/* Linked Outcomes */}
        {decision.linked_outcomes?.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ color: '#495057', marginBottom: 8 }}>🎯 Expected Outcomes</h4>
            <div style={{
              backgroundColor: '#e8f5e8',
              padding: 15,
              borderRadius: 6,
              borderLeft: '4px solid #4caf50'
            }}>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {decision.linked_outcomes.map((outcome, idx) => (
                  <li key={idx} style={{ marginBottom: 5 }}>
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Timeline */}
        {decision.timestamp && (
          <div>
            <h4 style={{ color: '#495057', marginBottom: 8 }}>⏰ Timeline</h4>
            <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
              Decision made on: {new Date(decision.timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DecisionModal;
