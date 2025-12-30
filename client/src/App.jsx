import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import ChatPanel from './components/ChatPanel';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleDataUpdate = (newData) => {
    setData(newData);
  };

  return (
    <div className="app-container">

      <main className="main-content" style={{ paddingLeft: '4rem', paddingRight: '4rem' }}>
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Dashboard</h1>
            <div className="subtitle">Visualize data based on your query</div>
          </div>

          {/* Simple User Profile Pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.8rem',
            padding: '0.5rem 1rem', background: 'var(--glass-bg)',
            borderRadius: '50px', border: '1px solid var(--glass-border)'
          }}>
          </div>
        </header>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '5rem', color: '#94a3b8' }}>
            Loading environmental data...
          </div>
        ) : (
          <Dashboard data={data} />
        )}
      </main>

      <ChatPanel onDataUpdate={handleDataUpdate} />
    </div>
  );
}

export default App;
