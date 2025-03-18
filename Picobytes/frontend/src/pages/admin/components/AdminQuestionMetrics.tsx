import React, { useState, useEffect } from 'react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const AdminQuestionMetrics = () => {
  const [questionStats, setQuestionStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('attempted');

  useEffect(() => {
    fetchQuestionStats();
  }, []);

  const fetchQuestionStats = async () => {
    try {
      setLoading(true);
      // Fetch real data from the backend API
      const response = await fetch('http://localhost:5000/api/admin/dashboard/question-stats');
      
      if (!response.ok) {
        throw new Error(`Error fetching question stats: ${response.status}`);
      }
      
      const data = await response.json();
      setQuestionStats(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch question stats:', err);
      setError('Failed to load question statistics. Using fallback data.');
      
      // Fallback to mock data if API fails
      setQuestionStats({
        most_attempted: [
          { id: 1, title: "Which C operator can be used to access a variable's address?", attempts: 287 },
          { id: 2, title: "What is the correct way to dynamically allocate memory for an integer in C?", attempts: 245 },
          { id: 3, title: "What will happen if you try to dereference a NULL pointer in C?", attempts: 228 },
          { id: 4, title: "Which function is used to release dynamically allocated memory in C?", attempts: 198 },
          { id: 5, title: "What is the purpose of sizeof() in C?", attempts: 187 }
        ],
        problematic: [
          { id: 15, title: "What does the pwd command do in Linux?", attempts: 124, success_rate: 36.2 },
          { id: 23, title: "Do all C programs require a main() function?", attempts: 156, success_rate: 42.8 },
          { id: 7, title: "How do you round the number 7.25, to the nearest integer?", attempts: 98, success_rate: 47.3 },
          { id: 19, title: "How can you add a comment in a JavaScript?", attempts: 132, success_rate: 51.9 },
          { id: 11, title: "Does the size of a pointer depend on the type of the variable it points to?", attempts: 174, success_rate: 54.1 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  // Format data for the bar charts
  const formatChartData = (data, valueKey = 'attempts') => {
    if (!data) return [];
    return data.map(item => ({
      name: item.title.length > 30 ? item.title.slice(0, 30) + '...' : item.title,
      [valueKey]: valueKey === 'success_rate' ? item.success_rate : item.attempts,
      fullTitle: item.title, // Keep full title for tooltip
      id: item.id
    }));
  };

  const renderAttemptedChart = () => {
    if (!questionStats || !questionStats.most_attempted) return null;
    
    const data = formatChartData(questionStats.most_attempted);
    
    return (
      <div className="chart-container">
        <h3 className="text-lg font-semibold mb-4">Most Attempted Questions</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [value, 'Attempts']}
              labelFormatter={(label, payload) => {
                if (payload && payload.length > 0) {
                  return payload[0].payload.fullTitle;
                }
                return label;
              }}
            />
            <Bar dataKey="attempts" fill="#58cc02" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderProblematicChart = () => {
    if (!questionStats || !questionStats.problematic) return null;
    
    const data = formatChartData(questionStats.problematic, 'success_rate');
    
    return (
      <div className="chart-container">
        <h3 className="text-lg font-semibold mb-4">Problematic Questions (Low Success Rate)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip 
              formatter={(value, name) => [`${value}%`, 'Success Rate']}
              labelFormatter={(label, payload) => {
                if (payload && payload.length > 0) {
                  return payload[0].payload.fullTitle;
                }
                return label;
              }}
            />
            <Bar dataKey="success_rate" fill="#1cb0f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderTopicDistribution = () => {
    if (!questionStats || !questionStats.most_attempted) return null;
    
    // Count questions by topic
    const topicCount = {};
    [...(questionStats.most_attempted || []), ...(questionStats.problematic || [])].forEach(question => {
      const topic = question.topic || 'Unknown';
      topicCount[topic] = (topicCount[topic] || 0) + 1;
    });
    
    const topicData = Object.entries(topicCount).map(([topic, count]) => ({
      name: topic,
      count: count
    }));
    
    return (
      <div className="chart-container">
        <h3 className="text-lg font-semibold mb-4">Question Distribution by Topic</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={topicData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#e53e3e" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
      {error && <div className="bg-red-900 text-white p-4 rounded-lg mb-4">{error}</div>}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Question Analytics</h2>
        <div className="flex space-x-2">
          <button 
            className={`px-4 py-2 rounded-lg ${activeTab === 'attempted' ? 'bg-green-600' : 'bg-gray-700'}`}
            onClick={() => setActiveTab('attempted')}
          >
            Most Attempted
          </button>
          <button 
            className={`px-4 py-2 rounded-lg ${activeTab === 'problematic' ? 'bg-green-600' : 'bg-gray-700'}`}
            onClick={() => setActiveTab('problematic')}
          >
            Problematic
          </button>
          <button 
            className={`px-4 py-2 rounded-lg ${activeTab === 'topics' ? 'bg-green-600' : 'bg-gray-700'}`}
            onClick={() => setActiveTab('topics')}
          >
            Topics
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div>
          {activeTab === 'attempted' && renderAttemptedChart()}
          {activeTab === 'problematic' && renderProblematicChart()}
          {activeTab === 'topics' && renderTopicDistribution()}
          
          <div className="mt-8 bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">
              {activeTab === 'attempted' ? 'Most Attempted Questions' : 
               activeTab === 'problematic' ? 'Problematic Questions' :
               'Question Topics'}
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-600">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Question</th>
                    {activeTab === 'attempted' && (
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Attempts</th>
                    )}
                    {activeTab === 'problematic' && (
                      <>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Attempts</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Success Rate</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {activeTab === 'attempted' && questionStats?.most_attempted?.map((question) => (
                    <tr key={question.id}>
                      <td className="px-4 py-3 whitespace-nowrap">{question.id}</td>
                      <td className="px-4 py-3">{question.title}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="bg-green-900 text-green-200 px-2 py-1 rounded-full text-xs">
                          {question.attempts}
                        </span>
                      </td>
                    </tr>
                  ))}
                  
                  {activeTab === 'problematic' && questionStats?.problematic?.map((question) => (
                    <tr key={question.id}>
                      <td className="px-4 py-3 whitespace-nowrap">{question.id}</td>
                      <td className="px-4 py-3">{question.title}</td>
                      <td className="px-4 py-3 text-right">{question.attempts}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`${question.success_rate < 50 ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'} px-2 py-1 rounded-full text-xs`}>
                          {question.success_rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  
                  {activeTab === 'topics' && Object.entries(topicCount || {}).map(([topic, count], index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap">{index + 1}</td>
                      <td className="px-4 py-3">{topic}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="bg-blue-900 text-blue-200 px-2 py-1 rounded-full text-xs">
                          {count} questions
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuestionMetrics;