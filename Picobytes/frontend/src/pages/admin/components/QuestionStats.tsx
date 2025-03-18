import React, { useState, useEffect } from 'react';

interface QuestionData {
  id: number;
  title: string;
  attempts: number;
  success_rate?: number;
}

interface QuestionStatsProps {
  data: {
    most_attempted: QuestionData[];
    problematic: QuestionData[];
  };
}

const QuestionStats: React.FC<QuestionStatsProps> = ({ data }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState(data);
  const [activeTab, setActiveTab] = useState<'attempted' | 'problematic'>('attempted');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/dashboard/question-stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError('Failed to load question statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="card-title">Question Statistics</h2>
      
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button 
          className={`tab-button ${activeTab === 'attempted' ? 'active' : ''}`} 
          onClick={() => setActiveTab('attempted')}
        >
          Most Attempted
        </button>
        <button 
          className={`tab-button ${activeTab === 'problematic' ? 'active' : ''}`} 
          onClick={() => setActiveTab('problematic')}
        >
          Problematic Questions
        </button>
      </div>
      
      <div className="stats-table-container">
        <table className="stats-table">
          <thead>
            <tr>
              <th>Question</th>
              <th style={{ width: '100px', textAlign: 'center' }}>Attempts</th>
              {activeTab === 'problematic' && <th style={{ width: '120px', textAlign: 'center' }}>Success Rate</th>}
            </tr>
          </thead>
          <tbody>
            {activeTab === 'attempted' ? (
              stats.most_attempted.map(question => (
                <tr key={question.id}>
                  <td>{question.title}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ 
                      backgroundColor: 'rgba(88, 204, 2, 0.2)', 
                      color: '#58cc02',
                      padding: '4px 8px', 
                      borderRadius: '100px',
                      fontWeight: 700,
                      fontSize: '14px',
                      display: 'inline-block' 
                    }}>
                      {question.attempts}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              stats.problematic.map(question => (
                <tr key={question.id}>
                  <td>{question.title}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ 
                      backgroundColor: 'rgba(28, 176, 246, 0.2)', 
                      color: '#1cb0f6',
                      padding: '4px 8px', 
                      borderRadius: '100px',
                      fontWeight: 700,
                      fontSize: '14px',
                      display: 'inline-block' 
                    }}>
                      {question.attempts}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ 
                      backgroundColor: question.success_rate < 50 ? 'rgba(229, 62, 62, 0.2)' : 'rgba(88, 204, 2, 0.2)', 
                      color: question.success_rate < 50 ? '#e53e3e' : '#58cc02',
                      padding: '4px 8px', 
                      borderRadius: '100px',
                      fontWeight: 700,
                      fontSize: '14px',
                      display: 'inline-block' 
                    }}>
                      {question.success_rate}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuestionStats;