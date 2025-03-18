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
  
  if (!data || (!data.most_attempted?.length && !data.problematic?.length)) {
    return (
      <div className="question-stats">
        <h2 className="card-title">Question Statistics</h2>
        <p>No question data available yet. This will populate as users attempt questions.</p>
      </div>
    );
  }
  
  return (
    <div className="question-stats">
      <h2 className="card-title">Question Statistics</h2>
      
      <div className="tab-buttons">
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
          <table className="stats-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Question</th>
                <th>Attempts</th>
              </tr>
            </thead>
            <tbody>
              {data.most_attempted && data.most_attempted.map(q => (
                <tr key={q.id}>
                  <td>{q.id}</td>
                  <td>{q.title}</td>
                  <td>{q.attempts}</td>
                </tr>
              ))}
              {(!data.most_attempted || data.most_attempted.length === 0) && (
                <tr>
                  <td colSpan={3}>No data available for most attempted questions.</td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="stats-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Question</th>
                <th>Attempts</th>
                <th>Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.problematic && data.problematic.map(q => (
                <tr key={q.id}>
                  <td>{q.id}</td>
                  <td>{q.title}</td>
                  <td>{q.attempts}</td>
                  <td>{q.success_rate}%</td>
                </tr>
              ))}
              {(!data.problematic || data.problematic.length === 0) && (
                <tr>
                  <td colSpan={4}>No data available for problematic questions.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default QuestionStats;