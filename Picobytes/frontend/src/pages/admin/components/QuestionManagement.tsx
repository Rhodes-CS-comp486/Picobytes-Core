import React, { useState, useEffect } from 'react';
import './QuestionManagement.css';

interface Question {
  qid: number;
  qtext: string;
  qtype: string;
  qlevel: string;
  qtopic: string;
  qactive: boolean;
}

const QuestionManagement = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [bulkCategory, setBulkCategory] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load all questions on component mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const uid = localStorage.getItem('uid');
      const response = await fetch(`http://localhost:5000/api/admin/all_questions?uid=${uid}`);
      
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions);
      } else {
        console.error('Failed to fetch questions');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestionSelection = (qid: number) => {
    if (selectedQuestions.includes(qid)) {
      setSelectedQuestions(selectedQuestions.filter(id => id !== qid));
    } else {
      setSelectedQuestions([...selectedQuestions, qid]);
    }
  };

  const toggleQuestionActive = async (qid: number, currentActive: boolean) => {
    try {
      const uid = localStorage.getItem('uid');
      const response = await fetch('http://localhost:5000/api/admin/update_question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: uid,
          qid: qid,
          updates: {
            qactive: !currentActive
          }
        }),
      });

      if (response.ok) {
        // Update local state
        setQuestions(questions.map(q => 
          q.qid === qid ? { ...q, qactive: !currentActive } : q
        ));
      } else {
        console.error('Failed to update question');
      }
    } catch (error) {
      console.error('Error updating question:', error);
    }
  };

  const updateDifficultyRating = async (qid: number, newLevel: string) => {
    try {
      const uid = localStorage.getItem('uid');
      const response = await fetch('http://localhost:5000/api/admin/update_question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: uid,
          qid: qid,
          updates: {
            qlevel: newLevel
          }
        }),
      });

      if (response.ok) {
        // Update local state
        setQuestions(questions.map(q => 
          q.qid === qid ? { ...q, qlevel: newLevel } : q
        ));
      } else {
        console.error('Failed to update question difficulty');
      }
    } catch (error) {
      console.error('Error updating question difficulty:', error);
    }
  };

  const applyBulkCategoryChange = async () => {
    if (!bulkCategory || selectedQuestions.length === 0) {
      return;
    }

    try {
      const uid = localStorage.getItem('uid');
      const response = await fetch('http://localhost:5000/api/admin/bulk_update_questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: uid,
          question_ids: selectedQuestions,
          updates: {
            qtopic: bulkCategory
          }
        }),
      });

      if (response.ok) {
        // Update local state
        setQuestions(questions.map(q => 
          selectedQuestions.includes(q.qid) ? { ...q, qtopic: bulkCategory } : q
        ));
        // Clear selections
        setSelectedQuestions([]);
        setBulkCategory('');
      } else {
        console.error('Failed to update questions');
      }
    } catch (error) {
      console.error('Error updating questions:', error);
    }
  };

  const previewQuestionAsStudent = async (qid: number) => {
    try {
      const uid = localStorage.getItem('uid');
      const response = await fetch(`http://localhost:5000/api/question/${qid}?uid=${uid}`);
      
      if (response.ok) {
        const data = await response.json();
        setPreviewQuestion(data);
        setShowPreview(true);
      } else {
        console.error('Failed to fetch question for preview');
      }
    } catch (error) {
      console.error('Error fetching question for preview:', error);
    }
  };

  const deleteQuestion = async (qid: number) => {
    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    try {
      const uid = localStorage.getItem('uid');
      const response = await fetch('http://localhost:5000/api/admin/delete_question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: uid,
          qid: qid
        }),
      });

      if (response.ok) {
        // Remove from local state
        setQuestions(questions.filter(q => q.qid !== qid));
      } else {
        console.error('Failed to delete question');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  // Filter questions based on current filter and search query
  const filteredQuestions = questions.filter(q => {
    // Apply type filter
    if (currentFilter !== 'all' && q.qtype !== currentFilter) {
      return false;
    }
    
    // Apply search query
    if (searchQuery && !q.qtext.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !q.qtopic.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  if (loading) {
    return <div className="loading">Loading questions...</div>;
  }

  return (
    <div className="question-management">
      <div className="question-management-header">
        <h2>Question Management</h2>
        <div className="question-management-actions">
          <div className="search-filter">
            <input 
              type="text" 
              placeholder="Search questions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select 
              value={currentFilter} 
              onChange={(e) => setCurrentFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="multiple_choice">Multiple Choice</option>
              <option value="true_false">True/False</option>
              <option value="free_response">Free Response</option>
              <option value="code_blocks">Fill in Code</option>
            </select>
          </div>
        </div>
      </div>
      
      {selectedQuestions.length > 0 && (
        <div className="bulk-actions">
          <h3>Bulk Actions ({selectedQuestions.length} questions selected)</h3>
          <div className="bulk-category-action">
            <input 
              type="text" 
              placeholder="New category name" 
              value={bulkCategory}
              onChange={(e) => setBulkCategory(e.target.value)}
            />
            <button 
              onClick={applyBulkCategoryChange}
              disabled={!bulkCategory}
            >
              Apply to Selected
            </button>
          </div>
          <button onClick={() => setSelectedQuestions([])}>Clear Selection</button>
        </div>
      )}

      <div className="questions-list">
        <table>
          <thead>
            <tr>
              <th>Select</th>
              <th>ID</th>
              <th>Question Text</th>
              <th>Type</th>
              <th>Difficulty</th>
              <th>Category</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.map(question => (
              <tr key={question.qid} className={question.qactive ? 'active' : 'inactive'}>
                <td>
                  <input 
                    type="checkbox" 
                    checked={selectedQuestions.includes(question.qid)} 
                    onChange={() => toggleQuestionSelection(question.qid)}
                  />
                </td>
                <td>{question.qid}</td>
                <td className="question-text-cell">
                  {question.qtext.length > 120 ? `${question.qtext.substring(0, 120)}...` : question.qtext}
                </td>
                <td>{question.qtype}</td>
                <td>
                  <select 
                    value={question.qlevel} 
                    onChange={(e) => updateDifficultyRating(question.qid, e.target.value)}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </td>
                <td>{question.qtopic}</td>
                <td>
                  <button 
                    className={`status-toggle ${question.qactive ? 'active' : 'inactive'}`}
                    onClick={() => toggleQuestionActive(question.qid, question.qactive)}
                  >
                    {question.qactive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="actions">
                  <button onClick={() => previewQuestionAsStudent(question.qid)}>Preview</button>
                  <button onClick={() => deleteQuestion(question.qid)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPreview && previewQuestion && (
        <div className="question-preview-overlay">
          <div className="question-preview-modal">
            <h3>Student Question Preview</h3>
            <div className="preview-content">
              <h4>Question: {previewQuestion.qtext}</h4>
              <p><strong>Type:</strong> {previewQuestion.qtype}</p>
              <p><strong>Difficulty:</strong> {previewQuestion.qlevel}</p>
              <p><strong>Category:</strong> {previewQuestion.qtopic}</p>
              
              {/* Display question type-specific details */}
              {previewQuestion.qtype === 'multiple_choice' && (
                <div className="preview-multiple-choice">
                  <p><strong>Options:</strong></p>
                  <ol>
                    <li>{(previewQuestion as any).option_1}</li>
                    <li>{(previewQuestion as any).option_2}</li>
                    <li>{(previewQuestion as any).option_3}</li>
                    <li>{(previewQuestion as any).option_4}</li>
                  </ol>
                  <p><strong>Correct Answer:</strong> {(previewQuestion as any).answer}</p>
                </div>
              )}
              
              {previewQuestion.qtype === 'true_false' && (
                <div className="preview-true-false">
                  <p><strong>Correct Answer:</strong> {(previewQuestion as any).correct_answer ? 'True' : 'False'}</p>
                </div>
              )}
              
              {previewQuestion.qtype === 'code_blocks' && (
                <div className="preview-code-blocks">
                  <p><strong>Code:</strong></p>
                  <pre>{(previewQuestion as any).block1 || 'No code provided'}</pre>
                </div>
              )}
            </div>
            <button onClick={() => setShowPreview(false)}>Close Preview</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManagement; 