import React from 'react';
import './TabComponent.css';

export function Tabs({ children, activeTab, onChange }) {
  return (
    <div className="tabs">
      {React.Children.map(children, (child) => 
        React.cloneElement(child, { activeTab, onChange })
      )}
    </div>
  );
}

export function Tab({ id, title, activeTab, onChange }) {
  return (
    <button 
      className={`tab ${activeTab === id ? 'active' : ''}`}
      onClick={() => onChange(id)}
    >
      {title}
    </button>
  );
}