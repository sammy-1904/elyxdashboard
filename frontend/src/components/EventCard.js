import React from 'react';
import { Card } from 'antd';

const EventCard = ({ conv, onClick, showDecisionIndicator }) => (
  <Card onClick={onClick} style={{ cursor: 'pointer' }}>
    <p><strong>{conv.sender} ({conv.role})</strong></p>
    <p>{conv.message}</p>
    {showDecisionIndicator && <span style={{ color: 'green' }}>Decision Taken</span>}
  </Card>
);

export default EventCard;
