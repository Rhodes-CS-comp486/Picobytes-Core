import React from 'react';

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
  // Calculate max value for chart scaling
  const maxCompletions = Math.max(...data.daily_completions.map(day => day.count));

  return (
    <div>
      <h2 className="card-title">Student Performance</h2>
      
      <div style={{ display: 'flex', gap: '16px' }}>
        <div className="metric-card" style={{ flex: 1 }}>
          <div className="metric-title">Completion Rate</div>
          <div className="metric-value">{data.completion_rate}%</div>
        </div>
        
        <div className="metric-card" style={{ flex: 1 }}>
          <div className="metric-title">Average Score</div>
          <div className="metric-value">{data.average_score}%</div>
        </div>
      </div>
      
      <h3 style={{ fontSize: '16px', marginTop: '20px', marginBottom: '10px', color: 'var(--text-primary)', fontWeight: 600 }}>
        Completions (Last 7 Days)
      </h3>
      
      <div className="chart-container">
        <div className="bar-chart">
          {data.daily_completions.map((day, index) => (
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