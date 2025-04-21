// components/cards/StatCard.js
import React from 'react';

export const StatCard = ({ title, value, icon, trend, color }) => {
  return (
    <div className="sp-card">
      <div className="sp-card-header">
        <div className="sp-card-text">
          <div className="sp-card-title">{title}</div>
          <div className="sp-card-value">{value}</div>
        </div>
        <div className={`sp-card-icon sp-card-icon-${color}`}>
          {icon}
        </div>
      </div>
      <div className="sp-card-footer">
        <span className={`sp-trend-${trend.includes('up') ? 'up' : 'down'}`}>
          {trend}
        </span>
      </div>
    </div>
  );
};

export default StatCard;