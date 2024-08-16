import React, { useState } from 'react';
import { Tabs, Tab } from './TabComponent';
import LeaguesTab from './LeaguesTab';
import TeamsTab from './TeamsTab';
import ResultsTab from './ResultsTab.jsx';
import PlayersTab from './PlayersTab';
import './Dashboard.css';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('leagues');

  const renderTabContent = () => {
    switch(activeTab) {
      case 'leagues':
        return <LeaguesTab />;
      case 'teams':
        return <TeamsTab />;
      case 'results':
        return <ResultsTab />;
      case 'players':
        return <PlayersTab />;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard</h1>
      <Tabs activeTab={activeTab} onChange={setActiveTab}>
        <Tab id="leagues" title="Leagues" />
        <Tab id="teams" title="Teams" />
        <Tab id="results" title="Results" />
        <Tab id="players" title="Players" />
      </Tabs>
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
}

export default Dashboard;