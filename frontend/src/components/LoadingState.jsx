// src/components/LoadingState.jsx
import React from 'react';

export default function LoadingState({ label = 'Loading...' }) {
  return (
    <div style={{
      padding: '16px',
      border: '1px dashed #ddd',
      borderRadius: 12,
      background: '#fafafa',
      textAlign: 'center'
    }}>
      {label}
    </div>
  );
}
