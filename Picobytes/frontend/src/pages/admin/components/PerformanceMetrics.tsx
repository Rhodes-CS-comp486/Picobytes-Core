import React, { useState, useEffect } from 'react';

interface PerformanceMetricsProps {
  data: {
    completion_rate: number;
    average_score: number;
    daily_completions: {
      date: string;
      count: number;
    }[];
  };
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ data }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState(data);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/dashboard/performance');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      const data = await response.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError('Failed to load performance metrics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading metrics...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  // Calculate max value for chart scaling
  const maxCompletions = Math.max(...metrics.daily_completions.map(day => day.count));

  return (
    <div>
      <h2 className="card-title">Student Performance</h2>
      
      <div style={{ display: 'flex', gap: '16px' }}>
        <div className="metric-card" style={{ flex: 1 }}>
          <div className="metric-title">Completion Rate</div>
          <div className="metric-value">{metrics.completion_rate}%</div>
        </div>
        
        <div className="metric-card" style={{ flex: 1 }}>
          <div className="metric-title">Average Score</div>
          <div className="metric-value">{metrics.average_score}%</div>
        </div>
      </div>
      
      <h3 style={{ fontSize: '16px', marginTop: '20px', marginBottom: '10px', color: '#e2e8f0', fontWeight: 600 }}>
        Completions (Last 7 Days)
      </h3>
      
      <div className="chart-container">
        <div className="bar-chart">
          {metrics.daily_completions.map((day, index) => (
            <div className="chart-item" key={index}>
              <div 
                className="chart-bar" 
                style={{ 
                  height: `${(day.count / (maxCompletions || 1)) * 100}%`,
                  backgroundColor: '#58cc02'
                }}
              >
                <div className="chart-tooltip">{day.count} completions</div>
              </div>
              <div className="chart-label">
                {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;