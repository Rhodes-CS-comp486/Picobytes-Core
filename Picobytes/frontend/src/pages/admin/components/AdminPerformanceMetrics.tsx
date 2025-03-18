import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const AdminPerformanceMetrics = () => {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      // Fetch real data from the backend API
      const response = await fetch('http://localhost:5000/api/admin/dashboard/performance');
      
      if (!response.ok) {
        throw new Error(`Error fetching performance data: ${response.status}`);
      }
      
      const data = await response.json();
      setPerformanceData(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch performance data:', err);
      setError('Failed to load performance metrics. Using fallback data.');
      
      // Fallback to mock data if API fails
      setPerformanceData({
        completion_rate: 68.5,
        average_score: 72.3,
        daily_completions: [
          { date: '2025-02-19', count: 24 },
          { date: '2025-02-20', count: 31 },
          { date: '2025-02-21', count: 18 },
          { date: '2025-02-22', count: 12 },
          { date: '2025-02-23', count: 9 },
          { date: '2025-02-24', count: 27 },
          { date: '2025-02-25', count: 35 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
      {error && <div className="bg-red-900 text-white p-4 rounded-lg mb-4">{error}</div>}
      
      <h2 className="text-2xl font-bold mb-6">Performance Metrics</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg text-gray-300 mb-2">Completion Rate</h3>
              <div className="text-4xl font-bold text-green-400">
                {performanceData?.completion_rate}%
              </div>
              <div className="text-sm text-gray-400 mt-2">
                Percentage of questions successfully completed
              </div>
            </div>
            
            <div className="bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg text-gray-300 mb-2">Average Score</h3>
              <div className="text-4xl font-bold text-blue-400">
                {performanceData?.average_score}%
              </div>
              <div className="text-sm text-gray-400 mt-2">
                Average score across all students
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Daily Completions (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={performanceData?.daily_completions}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(label) => `Date: ${formatDate(label)}`}
                  formatter={(value) => [`${value} completions`, 'Count']}
                />
                <Legend />
                <Bar dataKey="count" name="Completions" fill="#58cc02" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Completion History</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-600">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Completions</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Trend</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {performanceData?.daily_completions.map((day, index) => {
                    const prevDay = index < performanceData.daily_completions.length - 1 
                      ? performanceData.daily_completions[index + 1] 
                      : null;
                    const trend = prevDay 
                      ? day.count > prevDay.count 
                        ? 'up' 
                        : day.count < prevDay.count 
                          ? 'down' 
                          : 'same'
                      : 'same';
                    
                    return (
                      <tr key={day.date}>
                        <td className="px-4 py-3 whitespace-nowrap">{formatDate(day.date)}</td>
                        <td className="px-4 py-3 text-right">{day.count}</td>
                        <td className="px-4 py-3 text-right">
                          {trend === 'up' && <span className="text-green-500">↑ {day.count - (prevDay?.count || 0)}</span>}
                          {trend === 'down' && <span className="text-red-500">↓ {(prevDay?.count || 0) - day.count}</span>}
                          {trend === 'same' && <span className="text-gray-500">–</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPerformanceMetrics;