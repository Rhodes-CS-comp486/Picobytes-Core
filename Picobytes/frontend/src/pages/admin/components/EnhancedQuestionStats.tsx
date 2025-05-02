import React, { useState, useEffect } from 'react';
import '../AdminDashboard.css';

interface Question {
  id: number;
  title: string;
  attempts: number;
  success_rate?: number;
  avg_time?: number;
}

interface EnhancedQuestionStatsProps {
  initialData?: {
    most_attempted: Question[];
    problematic: Question[];
    by_category?: any;
    recent_attempts?: any;
    question_analytics?: any;
  };
}

const EnhancedQuestionStats: React.FC<EnhancedQuestionStatsProps> = ({ initialData }) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'most_attempted' | 'problematic' | 'all'>('most_attempted');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'attempts',
    direction: 'desc'
  });
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  // Get the user ID from localStorage
  const uid = localStorage.getItem('uid');

  const fetchQuestionStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/dashboard/question-stats?uid=${uid}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch question stats: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      updateFilteredQuestions(result, activeTab, searchTerm, sortConfig);
    } catch (err) {
      console.error('Error fetching question stats:', err);
      setError('Failed to load question statistics');
      // Fall back to prop data if available
      if (initialData) {
        setData(initialData);
        updateFilteredQuestions(initialData, activeTab, searchTerm, sortConfig);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateFilteredQuestions = (
    data: any, 
    tab: string, 
    search: string,
    sort: { key: string; direction: 'asc' | 'desc' }
  ) => {
    if (!data) return;
    
    let questions: Question[] = [];
    
    // Select which data to use based on tab
    if (tab === 'most_attempted') {
      questions = [...data.most_attempted];
    } else if (tab === 'problematic') {
      questions = [...data.problematic];
    } else {
      // 'all' tab - combine both arrays
      questions = [...data.most_attempted, ...data.problematic];
      // Remove duplicates by question id
      questions = questions.filter((question, index, self) =>
        index === self.findIndex((q) => q.id === question.id)
      );
    }
    
    // Apply search filter if there's a search term
    if (search) {
      questions = questions.filter(question =>
        question.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply sorting
    questions.sort((a, b) => {
      const aValue = a[sort.key as keyof Question];
      const bValue = b[sort.key as keyof Question];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      const compareResult = aValue < bValue ? -1 : (aValue > bValue ? 1 : 0);
      return sort.direction === 'asc' ? compareResult : -compareResult;
    });
    
    setFilteredQuestions(questions);
  };

  const handleTabChange = (tab: 'most_attempted' | 'problematic' | 'all') => {
    setActiveTab(tab);
    updateFilteredQuestions(data, tab, searchTerm, sortConfig);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    updateFilteredQuestions(data, activeTab, value, sortConfig);
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    
    const newSortConfig = { key, direction };
    setSortConfig(newSortConfig);
    updateFilteredQuestions(data, activeTab, searchTerm, newSortConfig);
  };

  const exportData = () => {
    if (!filteredQuestions.length) return;
    
    let content = '';
    let filename = `question-stats-${new Date().toISOString().slice(0, 10)}`;
    
    if (exportFormat === 'csv') {
      // Create CSV content
      const headers = ['ID', 'Title', 'Attempts', 'Success Rate (%)', 'Avg Time (s)'];
      content = headers.join(',') + '\n';
      
      filteredQuestions.forEach(question => {
        const row = [
          question.id,
          `"${question.title.replace(/"/g, '""')}"`, // Escape quotes in CSV
          question.attempts,
          question.success_rate !== undefined ? question.success_rate.toFixed(1) : 'N/A',
          question.avg_time !== undefined ? question.avg_time : 'N/A'
        ];
        content += row.join(',') + '\n';
      });
      
      filename += '.csv';
      
    } else {
      // Create JSON content
      content = JSON.stringify(filteredQuestions, null, 2);
      filename += '.json';
    }
    
    // Create download link
    const blob = new Blob([content], { type: exportFormat === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Initial fetch on component mount
  useEffect(() => {
    if (!initialData) {
      fetchQuestionStats();
    } else {
      updateFilteredQuestions(initialData, activeTab, searchTerm, sortConfig);
    }
  }, []);

  // When initialData changes (e.g. from parent re-render)
  useEffect(() => {
    if (initialData && !loading) {
      setData(initialData);
      updateFilteredQuestions(initialData, activeTab, searchTerm, sortConfig);
    }
  }, [initialData]);

  return (
    <div className="enhanced-question-stats">
      <div className="stats-header">
        <h2 className="card-title">Question Analytics</h2>
        <div className="stats-controls">
          <button 
            onClick={() => fetchQuestionStats()} 
            className="refresh-button"
            disabled={loading}
          >
            Refresh
          </button>
          
          <div className="export-controls">
            <select 
              value={exportFormat} 
              onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
              className="export-format-select"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
            <button 
              onClick={exportData}
              className="export-button"
              disabled={!filteredQuestions.length}
            >
              Export
            </button>
          </div>
        </div>
      </div>
      
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'most_attempted' ? 'active' : ''}`}
          onClick={() => handleTabChange('most_attempted')}
        >
          Most Attempted
        </button>
        <button 
          className={`tab-button ${activeTab === 'problematic' ? 'active' : ''}`}
          onClick={() => handleTabChange('problematic')}
        >
          Problematic
        </button>
        <button 
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => handleTabChange('all')}
        >
          All Questions
        </button>
      </div>
      
      <div className="search-filter">
        <input
          type="text"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading question statistics...</p>
        </div>
      ) : (
        <div className="questions-table-container">
          <table className="questions-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('id')} className="sortable">
                  ID
                  {sortConfig.key === 'id' && (
                    <span className="sort-indicator">
                      {sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort('title')} className="sortable">
                  Title
                  {sortConfig.key === 'title' && (
                    <span className="sort-indicator">
                      {sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort('attempts')} className="sortable">
                  Attempts
                  {sortConfig.key === 'attempts' && (
                    <span className="sort-indicator">
                      {sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort('success_rate')} className="sortable">
                  Success Rate
                  {sortConfig.key === 'success_rate' && (
                    <span className="sort-indicator">
                      {sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}
                    </span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map(question => (
                  <tr key={question.id}>
                    <td>{question.id}</td>
                    <td>{question.title}</td>
                    <td>{question.attempts}</td>
                    <td>
                      {question.success_rate !== undefined ? (
                        <div className="success-rate-cell">
                          <div 
                            className="success-rate-bar"
                            style={{ 
                              width: `${question.success_rate}%`,
                              backgroundColor: question.success_rate < 50 ? '#ff4d4d' : 
                                              question.success_rate < 75 ? '#ffbb33' : '#44cc44'
                            }}
                          />
                          <span>{question.success_rate.toFixed(1)}%</span>
                        </div>
                      ) : (
                        <span>N/A</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="no-results">
                    {searchTerm 
                      ? 'No questions match your search criteria' 
                      : 'No question data available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EnhancedQuestionStats; 