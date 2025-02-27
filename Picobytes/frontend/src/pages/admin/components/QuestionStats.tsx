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
  
  return (
    <div>
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
        <table className="stats-table">
          <thead>
            <tr>
              <th>Question</th>
              <th>Attempts</th>
              {activeTab === 'problematic' && <th>Success Rate</th>}
            </tr>
          </thead>
          <tbody>
            {activeTab === 'attempted' ? (
              data.most_attempted.map(question => (
                <tr key={question.id}>
                  <td>{question.title}</td>
                  <td>{question.attempts}</td>
                </tr>
              ))
            ) : (
              data.problematic.map(question => (
                <tr key={question.id}>
                  <td>{question.title}</td>
                  <td>{question.attempts}</td>
                  <td>{question.success_rate}%</td>
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