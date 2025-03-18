import React, { useState } from 'react';

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
  const [activeTab, setActiveTab] = useState<'attempted' | 'problematic'>('attempted');
  
  // Add a check for empty data
  const hasMostAttempted = data?.most_attempted?.length > 0;
  const hasProblematic = data?.problematic?.length > 0;
  
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
        {activeTab === 'attempted' ? (
          hasMostAttempted ? (
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Attempts</th>
                </tr>
              </thead>
              <tbody>
                {data.most_attempted.map(question => (
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
                ))}
              </tbody>
            </table>
          ) : (
            <p>No data available for most attempted questions.</p>
          )
        ) : (
          hasProblematic ? (
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Attempts</th>
                  <th style={{ width: '120px', textAlign: 'center' }}>Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.problematic.map(question => (
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
                ))}
              </tbody>
            </table>
          ) : (
            <p>No data available for problematic questions.</p>
          )
        )}
      </div>
    </div>
  );
};

export default QuestionStats;