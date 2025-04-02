import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Home_Header from './home/home_header';
import './question.css';

const CodingQuestion = () => {
  const [code, setCode] = useState('');
  const [question, setQuestion] = useState('Loading question...');
  const [starterCode, setStarterCode] = useState('');
  const [testCases, setTestCases] = useState('');
  const [showTestCases, setShowTestCases] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [topic, setTopic] = useState('');
  const [executionResults, setExecutionResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const params = useParams();
  const qid = params.id;
  const navigate = useNavigate();
  
  // Get user ID from local storage
  const uid = localStorage.getItem('uid');
  
  // Fetch question data when ID changes
  useEffect(() => {
    fetchQuestion(qid);
  }, [qid]);
  
  const fetchQuestion = (questionId: string | undefined) => {
    if (!questionId) return;
    
    // Reset states when fetching a new question
    setFeedback('');
    setError('');
    setIsSubmitting(false);
    setExecutionResults(null);
    setLoading(true);
    
    fetch(`http://127.0.0.1:5000/api/coding/question/${questionId}`, {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        
        setQuestion(data.question_text);
        setDifficulty(data.question_level);
        setTopic(data.question_topic);
        setStarterCode(data.starter_code);
        setTestCases(data.test_cases || '');
        setCode(data.starter_code); // Initialize code with starter code
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching question: ', error);
        setError(error.message);
        setLoading(false);
      });
  };
  
  const saveCode = () => {
    if (!uid) {
      setFeedback('Please log in to save your code.');
      return;
    }
    
    setIsSubmitting(true);
    setFeedback('');
    
    fetch('http://127.0.0.1:5000/api/coding/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid,
        qid,
        code,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        
        setFeedback('Code saved successfully!');
        setIsSubmitting(false);
      })
      .catch((error) => {
        console.error('Error saving code: ', error);
        setFeedback(`Error: ${error.message}`);
        setIsSubmitting(false);
      });
  };
  
  const executeCode = () => {
    if (!code.trim()) {
      setFeedback('Please write some code before executing.');
      return;
    }
    
    setIsSubmitting(true);
    setExecutionResults(null);
    setFeedback('Executing your code...');
    
    fetch('http://127.0.0.1:5000/api/coding/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        qid,
        code,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        
        setExecutionResults(data);
        setFeedback('Code executed! Check the results below.');
        setIsSubmitting(false);
      })
      .catch((error) => {
        console.error('Error executing code: ', error);
        setFeedback(`Error: ${error.message}`);
        setIsSubmitting(false);
      });
  };
  
  const resetCode = () => {
    setCode(starterCode);
    setFeedback('Code reset to starter code.');
  };
  
  const goToHomepage = () => {
    navigate('/homepage');
  };
  
  const toggleTestCases = () => {
    setShowTestCases(!showTestCases);
  };
  
  if (loading) {
    return (
      <div className="duolingo-question-page">
        <Home_Header toggleOverlay={() => {}} />
        <div className="question-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading question...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="duolingo-question-page">
        <Home_Header toggleOverlay={() => {}} />
        <div className="question-content error-content">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h1>Error</h1>
            <p>{error}</p>
            <p>Question ID: {qid}</p>
            <div className="question-nav">
              <button className="nav-button home-button" onClick={goToHomepage}>
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="duolingo-question-page">
      <Home_Header toggleOverlay={() => {}} />
      
      <div className="question-content">
        <div className="question-header">
          <h2>Coding Question</h2>
          <div className="question-metadata">
            <span className="difficulty-tag">{difficulty}</span>
            <span className="topic-tag">{topic}</span>
          </div>
        </div>
        
        <div className="question-text-wrapper">
          <div className="question-text-label">Question:</div>
          <div className="question-text">
            <p>{question}</p>
          </div>
        </div>
        
        <div className="coding-editor-container">
          <div className="code-editor-header">
            <span>Your Solution</span>
          </div>
          <textarea
            className="coding-editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            placeholder="Write your code here..."
            disabled={isSubmitting}
          />
        </div>
        
        <div className="test-cases-container">
          <div className="test-cases-header">
            <button 
              className="test-cases-toggle" 
              onClick={toggleTestCases}
            >
              {showTestCases ? 'Hide Test Cases' : 'Show Test Cases'}
            </button>
          </div>
          
          {showTestCases && (
            <div className="test-cases-content">
              <h3>Test Cases</h3>
              <pre className="test-cases-code">
                {testCases}
              </pre>
            </div>
          )}
        </div>
        
        <div className="coding-buttons">
          <button
            className="coding-button reset-button"
            onClick={resetCode}
            disabled={isSubmitting}
          >
            Reset Code
          </button>
          <button
            className="coding-button execute-button"
            onClick={executeCode}
            disabled={isSubmitting}
          >
            Execute Code
          </button>
          <button
            className="coding-button save-button"
            onClick={saveCode}
            disabled={isSubmitting}
          >
            Save Code
          </button>
        </div>
        
        {isSubmitting && (
          <div className="processing-indicator">
            <div className="loading-spinner"></div>
            <p>Processing your code...</p>
          </div>
        )}
        
        {feedback && (
          <div className="feedback-message">
            <p>{feedback}</p>
          </div>
        )}
        
        {executionResults && (
          <div className="execution-results">
            <h3>Execution Results</h3>
            <div className="execution-details">
              {executionResults.success ? (
                <div className="success-message">
                  <p>{executionResults.message}</p>
                  {executionResults.payload && (
                    <div className="payload-info">
                      <p>Payload prepared for execution:</p>
                      <p>Code and test cases have been encoded to base64 and are ready to be sent to the execution service.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="error-message">
                  <p>{executionResults.error || "An error occurred during execution."}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodingQuestion; 