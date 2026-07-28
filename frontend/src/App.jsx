import React, { useState, useEffect } from 'react';
import { fetchEndpoint } from './api';

const ENDPOINTS = [
  { path: '/api/test/', name: 'GET /api/test/', limit: '10/min' },
  { path: '/api/hello/', name: 'GET /api/hello/', limit: '10/min' },
  { path: '/api/profile/', name: 'GET /api/profile/', limit: '10/min' },
  { path: '/api/login/', name: 'GET /api/login/', limit: '20/min' },
  { path: '/api/purchase/', name: 'GET /api/purchase/', limit: '15/min' },
];

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [activeResponse, setActiveResponse] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('rate_limiter_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleKeyChange = (e) => {
    const val = e.target.value;
    setApiKey(val);
    localStorage.setItem('rate_limiter_api_key', val);
  };

  const handleCallEndpoint = async (endpointPath) => {
    setLoading(true);
    const result = await fetchEndpoint(endpointPath, apiKey);
    setActiveResponse(result);
    setHistory((prev) => [result, ...prev.slice(0, 9)]);
    setLoading(false);
  };

  return (
    <div className="container">
      <header>
        <h1>⚡ API Rate Limiter Tester</h1>
        <p>Real-time endpoint quota tracking and HTTP header inspection</p>
      </header>

      {/* API Key Input Section */}
      <div className="card">
        <div className="card-title">🔑 API Key Configuration</div>
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter UUID API Key (e.g. 550e8400-e29b-41d4-a716-446655440000)"
            value={apiKey}
            onChange={handleKeyChange}
          />
          {apiKey && (
            <button
              className="btn btn-secondary"
              onClick={() => {
                setApiKey('');
                localStorage.removeItem('rate_limiter_api_key');
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Endpoints Actions */}
      <div className="card">
        <div className="card-title">🚀 Available Endpoints</div>
        <div className="endpoint-grid">
          {ENDPOINTS.map((ep) => (
            <button
              key={ep.path}
              className="endpoint-btn"
              disabled={loading}
              onClick={() => handleCallEndpoint(ep.path)}
            >
              <span className="name">{ep.name}</span>
              <span className="limit">Quota: {ep.limit}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Response Card */}
      {activeResponse && (
        <div className={`card response-card ${activeResponse.ok ? 'success' : 'error'}`}>
          <div className="card-title">
            <span>Response: <code style={{ fontFamily: 'var(--font-mono)' }}>{activeResponse.endpoint}</code></span>
            <span className={`status-badge ${activeResponse.ok ? 'success' : 'error'}`}>
              HTTP {activeResponse.status || 'ERR'} {activeResponse.statusText}
            </span>
          </div>

          <div className="quota-box">
            <div className="quota-item">
              <span className="label">X-RateLimit-Limit</span>
              <span className="value">{activeResponse.limit}</span>
            </div>
            <div className="quota-item">
              <span className="label">X-RateLimit-Remaining</span>
              <span className="value" style={{ color: activeResponse.remaining === '0' ? 'var(--error)' : 'var(--primary)' }}>
                {activeResponse.remaining}
              </span>
            </div>
            <div className="quota-item">
              <span className="label">Timestamp</span>
              <span className="value" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {activeResponse.timestamp}
              </span>
            </div>
          </div>

          <pre>{JSON.stringify(activeResponse.data, null, 2)}</pre>
        </div>
      )}

      {/* Request History Log */}
      <div className="card">
        <div className="card-title">
          <span>📜 Request History (Last 10 Calls)</span>
          {history.length > 0 && (
            <button className="btn btn-secondary" onClick={() => setHistory([])}>
              Clear Log
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="empty-state">No requests executed yet. Click an endpoint above to test.</div>
        ) : (
          <div className="history-list">
            {history.map((item, idx) => (
              <div key={idx} className="history-item">
                <span className="endpoint">{item.endpoint}</span>
                <div className="meta">
                  <span className={`status-badge ${item.ok ? 'success' : 'error'}`}>
                    {item.status || 'ERR'}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Remaining: {item.remaining}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {item.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
