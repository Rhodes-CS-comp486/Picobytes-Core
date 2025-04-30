import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Home_Header from './home/home_header';
import SideBar from './home/side_bar';
import { useSidebar } from './home/side_bar_context';
import './code_execution/code_execution.css';
import './CodingQuestion.css';

interface Prop {
  toggleDark: () => void;
}

interface CodingQuestion {
  qid: number;
  qtext: string;
  topic: string;
  difficulty: string;
  function_template: string;
  test_code?: string;
}

interface ExecutionResult {
  is_correct: boolean;
  execution_results: {
    compile: boolean;
    run: boolean;
    output: string;
    error?: string;
    build?: boolean;
    valgrind?: string;
    failed_tests?: string[];
    original_error?: string;
  };
  error?: string;
}

const CodingQuestionPage = ({ toggleDark }: Prop) => {
  const { qid } = useParams<{ qid: string }>();
  const navigate = useNavigate();
  const { isVisible } = useSidebar();
  
  const [question, setQuestion] = useState<CodingQuestion | null>(null);
  const [code, setCode] = useState<string>('');
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  
  // Fetch the question when the component mounts
  useEffect(() => {
    if (!qid) return;
    
    fetch(`http://127.0.0.1:5000/api/coding-questions/${qid}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch question');
        }
        return response.json();
      })
      .then(data => {
        setQuestion(data);
        setCode(data.function_template || '// Write your code here');
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching question:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [qid]);
  
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };
  
  const submitCode = async () => {
    if (!qid || !code.trim()) return;
    
    setIsSubmitting(true);
    setFeedback('');
    setResult(null);
    
    try {
      // Use the test endpoint that doesn't require authentication for testing
      const response = await fetch(`http://127.0.0.1:5000/api/coding-questions/${qid}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      const data = await response.json();
      
      setResult(data);
      
      if (data.error) {
        setFeedback(data.error);
      } else if (data.is_correct) {
        setFeedback('Correct! All tests passed successfully.');
      } else {
        setFeedback('Your solution did not pass all tests. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting code:', err);
      setFeedback(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderContent = () => {
    if (loading) {
      return <div className="loading-state">Loading question...</div>;
    }
    
    if (error) {
      return (
        <>
          <div className="error-state">Error: {error}</div>
          <div className="navigation-buttons">
            <button className="home-button" onClick={() => navigate('/coding-questions')}>
              Back to Coding Questions
            </button>
          </div>
        </>
      );
    }
    
    if (!question) {
      return (
        <>
          <div className="error-state">Question not found</div>
          <div className="navigation-buttons">
            <button className="home-button" onClick={() => navigate('/coding-questions')}>
              Back to Coding Questions
            </button>
          </div>
        </>
      );
    }
    
    return (
      <>
        <div className="coding-question-header">
          <h2>Coding Question #{qid}</h2>
          <div className="question-meta">
            <span className="topic">{question.topic}</span>
            <span className={`difficulty ${question.difficulty.toLowerCase()}`}>
              {question.difficulty}
            </span>
          </div>
        </div>
        
        <div className="problem-statement">
          <h3>Problem Statement</h3>
          <div className="question-markdown">
            {question.qtext.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('# ')) {
                const headerText = paragraph.substring(2);
                return (
                  <div key={index}>
                    <h1>{headerText}</h1>
                  </div>
                );
              } else {
                // Parse and render code in backticks
                const parts = paragraph.split(/(`[^`]+`)/);
                return (
                  <p key={index}>
                    {parts.map((part, partIndex) => {
                      if (part.startsWith('`') && part.endsWith('`')) {
                        // This is code, so render it with the appropriate styling
                        return <code key={partIndex}>{part.slice(1, -1)}</code>;
                      } else {
                        // Regular text
                        return <span key={partIndex}>{part}</span>;
                      }
                    })}
                  </p>
                );
              }
            })}
          </div>
        </div>
        
        <div className="code-editor-section">
          <div className="editor-container">
            <h3>Your Solution</h3>
            <textarea
              className="code-editor"
              value={code}
              onChange={handleCodeChange}
              placeholder="Write your solution here..."
              disabled={isSubmitting}
            ></textarea>
          </div>
        </div>
        
        <div className="execution-controls">
          <button 
            className="submit-button"
            onClick={submitCode}
            disabled={isSubmitting || !code.trim()}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Solution'}
          </button>
        </div>
        
        {feedback && (
          <div className={`execution-feedback ${
            feedback.includes('Correct') ? 'success-feedback' : 'error-feedback'
          }`}>
            {feedback}
          </div>
        )}
        
        {result && result.execution_results && (
          <div className="execution-results">
            <h3>Results</h3>
            
            <div className="result-status">
              <div className="status-item">
                <span className="status-label">Compilation:</span>
                <span className={`status-value ${result.execution_results.compile ? 'status-success' : 'status-error'}`}>
                  {result.execution_results.compile ? 'Success' : 'Failed'}
                </span>
              </div>
              
              {result.execution_results.compile && (
                <div className="status-item">
                  <span className="status-label">Execution:</span>
                  <span className={`status-value ${result.execution_results.run ? 'status-success' : 'status-error'}`}>
                    {result.execution_results.run ? 'Success' : 'Failed'}
                  </span>
                </div>
              )}
            </div>
            
            <div className="output-container">
              <h4>Output:</h4>
              <pre className="output-display">{result.execution_results.output || 'No output'}</pre>
            </div>
            
            {result.execution_results.failed_tests && result.execution_results.failed_tests.length > 0 && (
              <div className="failed-tests">
                <h4>Failed Tests:</h4>
                <ul>
                  {result.execution_results.failed_tests.map((test, index) => (
                    <li key={index}>{test}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        <div className="navigation-buttons">
          <button className="home-button" onClick={() => navigate('/coding-questions')}>
            Back to Coding Questions
          </button>
        </div>
      </>
    );
  };
  
  return (
    <div className={`coding-question-container ${isVisible ? "sidebar-expanded" : "sidebar-collapsed"}`}>
      {/* Left Sidebar */}
      <SideBar toggleDark={toggleDark} />
      
      <div className="right-content-wrapper">
        {/* Header */}
        <Home_Header toggleOverlay={() => {}} />
        
        <div className="coding-question-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default CodingQuestionPage;